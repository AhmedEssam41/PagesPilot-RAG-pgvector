// src/routes/ragRoutes.ts
import { Router, Request, Response } from "express";
import multer from "multer";
import * as vectorDB from "../rag/vectorDB";
import { ask } from "../rag/rag";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// ══════════════════════════════════════════════
// INGEST — إدخال البيانات
// ══════════════════════════════════════════════

// إدخال JSON مباشرة
router.post("/ingest/json", async (req: Request, res: Response) => {
  try {
    const { collection, data, contentFields, titleField, metadataFields } = req.body;

    if (!collection || !data)
      return res.status(400).json({ error: "collection and data are required" });

    const docs = (Array.isArray(data) ? data : [data]).map((item: any) => {
      const content = contentFields
        ? contentFields.map((f: string) => `${f}: ${item[f] ?? ""}`).join(" | ")
        : JSON.stringify(item);
      const title = titleField ? String(item[titleField] ?? "") : undefined;
      const metadata = metadataFields
        ? Object.fromEntries(metadataFields.map((f: string) => [f, item[f]]))
        : item;
      return { content, title, metadata };
    });

    const result = await vectorDB.ingest(collection, "json", docs);
    res.status(201).json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// إدخال نص مباشرة
router.post("/ingest/text", async (req: Request, res: Response) => {
  try {
    const { collection, text, title } = req.body;

    if (!collection || !text)
      return res.status(400).json({ error: "collection and text are required" });

    const words = text.split(/\s+/);
    const chunkSize = 500;
    const overlap = 50;
    const docs = [];

    for (let i = 0; i < words.length; i += chunkSize - overlap) {
      const chunk = words.slice(i, i + chunkSize).join(" ");
      docs.push({
        content: chunk,
        title: title ? `${title} (${docs.length + 1})` : undefined,
        metadata: { chunk_index: docs.length },
      });
    }

    const result = await vectorDB.ingest(collection, "text", docs);
    res.status(201).json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// إدخال ملف CSV أو JSON أو TXT
router.post("/ingest/file", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "file is required" });

    const { collection, contentFields, titleField } = req.body;
    if (!collection) return res.status(400).json({ error: "collection is required" });

    const ext = req.file.originalname.split(".").pop()?.toLowerCase();
    const content = req.file.buffer.toString("utf-8");
    const cfArray = contentFields ? contentFields.split(",").map((f: string) => f.trim()) : null;

    let docs: { content: string; title?: string; metadata?: any }[] = [];

    if (ext === "json") {
      const data = JSON.parse(content);
      const items = Array.isArray(data) ? data : [data];
      docs = items.map((item: any) => ({
        content: cfArray
          ? cfArray.map((f: string) => `${f}: ${item[f] ?? ""}`).join(" | ")
          : JSON.stringify(item),
        title: titleField ? String(item[titleField] ?? "") : undefined,
        metadata: item,
      }));
    } else if (ext === "csv") {
      const lines = content.trim().split("\n");
      const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
      docs = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
        const item: any = Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
        return {
          content: cfArray
            ? cfArray.map((f: string) => `${f}: ${item[f] ?? ""}`).join(" | ")
            : headers.map((h) => `${h}: ${item[h]}`).join(" | "),
          title: titleField ? String(item[titleField] ?? "") : undefined,
          metadata: item,
        };
      });
    } else if (ext === "txt" || ext === "md") {
      const words = content.split(/\s+/);
      for (let i = 0; i < words.length; i += 450) {
        docs.push({
          content: words.slice(i, i + 500).join(" "),
          title: req.file.originalname,
          metadata: { chunk_index: docs.length },
        });
      }
    } else {
      return res.status(400).json({ error: "Unsupported file. Use: json, csv, txt, md" });
    }

    const result = await vectorDB.ingest(collection, ext!, docs);
    res.status(201).json({ success: true, file: req.file.originalname, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// إدخال نتائج SQL
router.post("/ingest/sql", async (req: Request, res: Response) => {
  try {
    const { collection, rows, contentFields, titleField } = req.body;
    if (!collection || !rows)
      return res.status(400).json({ error: "collection and rows are required" });

    const docs = rows.map((item: any) => ({
      content: contentFields
        ? contentFields.map((f: string) => `${f}: ${item[f] ?? ""}`).join(" | ")
        : JSON.stringify(item),
      title: titleField ? String(item[titleField] ?? "") : undefined,
      metadata: item,
    }));

    const result = await vectorDB.ingest(collection, "sql", docs);
    res.status(201).json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════
// SEARCH — البحث الدلالي
// ══════════════════════════════════════════════

router.post("/search", async (req: Request, res: Response) => {
  try {
    const { query, collection, limit = 5 } = req.body;
    if (!query) return res.status(400).json({ error: "query is required" });

    const results = await vectorDB.search(query, { collection, limit, threshold: 0.0 });
    res.json({ success: true, query, count: results.length, results });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════
// ASK — RAG سؤال وجواب
// ══════════════════════════════════════════════

router.post("/ask", async (req: Request, res: Response) => {
  try {
    const { question, collection, language, systemPrompt, chatHistory, topK } = req.body;
    if (!question) return res.status(400).json({ error: "question is required" });

    const result = await ask(question, { collection, language, systemPrompt, chatHistory, topK });
    res.json({ success: true, question, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════
// VIEW — عرض البيانات
// ══════════════════════════════════════════════

router.get("/collections", async (_req: Request, res: Response) => {
  try {
    const collections = await vectorDB.getCollections();
    res.json({ success: true, collections });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/collections/:collection/documents", async (req: Request, res: Response) => {
  try {
    const { collection } = req.params;
    const { page = 1, limit = 20, search } = req.query;

    const result = await vectorDB.getDocuments(collection, {
      page: Number(page),
      limit: Number(limit),
      search: search as string,
    });
    res.json({ success: true, collection, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/collections/:collection", async (req: Request, res: Response) => {
  try {
    const result = await vectorDB.deleteCollection(req.params.collection);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/documents/:id", async (req: Request, res: Response) => {
  try {
    const result = await vectorDB.deleteDocument(Number(req.params.id));
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;