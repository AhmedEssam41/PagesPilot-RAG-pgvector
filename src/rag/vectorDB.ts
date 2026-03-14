// src/rag/vectorDB.ts
import { PrismaClient } from "@prisma/client";
import { embedBatch, embedQuery, toVector } from "./embedder";

const prisma = new PrismaClient();

// ─────────────────────────────────────────────
// INGEST — حفظ البيانات
// ─────────────────────────────────────────────

export async function ingest(
  collection: string,
  sourceType: string,
  documents: { content: string; title?: string; metadata?: any }[]
) {
  if (!documents.length) return { inserted: 0, collection };

  const texts = documents.map((d) => d.content);
  const embeddings = await embedBatch(texts);

  let inserted = 0;

  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    const vector = toVector(embeddings[i]);

    await prisma.$executeRaw`
      INSERT INTO rag_documents (collection, source_type, title, content, metadata, embedding)
      VALUES (
        ${collection},
        ${sourceType},
        ${doc.title ?? null},
        ${doc.content},
        ${JSON.stringify(doc.metadata ?? {})}::jsonb,
        ${vector}::vector
      )
    `;
    inserted++;
  }

  return { inserted, collection };
}

// ─────────────────────────────────────────────
// SEARCH — البحث الدلالي
// ─────────────────────────────────────────────

export async function search(
  query: string,
  options: { collection?: string; limit?: number; threshold?: number } = {}
) {
  const { collection = null, limit = 5, threshold = 0.0 } = options;
  const embedding = await embedQuery(query);
  const vec = toVector(embedding);

  try {
    const results: any[] = await prisma.$queryRawUnsafe(
      collection
        ? `SELECT id, collection, source_type, title, content, metadata,
                 ROUND((1 - (embedding <=> '${vec}'::vector))::numeric, 4) AS similarity
           FROM rag_documents
           WHERE collection = '${collection}'
           ORDER BY embedding <=> '${vec}'::vector
           LIMIT ${limit}`
        : `SELECT id, collection, source_type, title, content, metadata,
                 ROUND((1 - (embedding <=> '${vec}'::vector))::numeric, 4) AS similarity
           FROM rag_documents
           ORDER BY embedding <=> '${vec}'::vector
           LIMIT ${limit}`
    );

    console.log("Results count:", results.length);
    return results.filter((r: any) => parseFloat(r.similarity) >= threshold);
  } catch (err) {
    console.error("Search query error:", err);
    throw err;
  }
}

// ─────────────────────────────────────────────
// VIEW — عرض البيانات
// ─────────────────────────────────────────────

export async function getCollections() {
  const results: any[] = await prisma.$queryRaw`
    SELECT
      collection,
      COUNT(*) AS total_docs,
      array_agg(DISTINCT source_type) AS source_types,
      MIN(created_at) AS first_added,
      MAX(created_at) AS last_added
    FROM rag_documents
    GROUP BY collection
    ORDER BY last_added DESC
  `;
  return results.map((r) => ({
    ...r,
    total_docs: Number(r.total_docs),
  }));
}

export async function getDocuments(
  collection: string,
  options: { page?: number; limit?: number; search?: string } = {}
) {
  const { page = 1, limit = 20 } = options;
  const offset = (page - 1) * limit;

  const documents: any[] = await prisma.$queryRaw`
    SELECT id, source_type, title,
           LEFT(content, 200) AS content_preview,
           metadata, created_at
    FROM rag_documents
    WHERE collection = ${collection}
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  const countResult: any[] = await prisma.$queryRaw`
    SELECT COUNT(*) AS total FROM rag_documents WHERE collection = ${collection}
  `;

  return {
    documents,
    total: parseInt(countResult[0].total),
    page,
    pages: Math.ceil(parseInt(countResult[0].total) / limit),
  };
}

export async function deleteCollection(collection: string) {
  const result = await prisma.$executeRaw`
    DELETE FROM rag_documents WHERE collection = ${collection}
  `;
  return { deleted: result };
}

export async function deleteDocument(id: number) {
  const result = await prisma.$executeRaw`
    DELETE FROM rag_documents WHERE id = ${id}
  `;
  return { deleted: result };
}