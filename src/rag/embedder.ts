const HF_URL = "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction";

async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch(HF_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.HF_TOKEN}`,
    },
    body: JSON.stringify({ inputs: text }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`HuggingFace error: ${err}`);
  }

  const data = await response.json();
  console.log("HF response type:", typeof data, Array.isArray(data), JSON.stringify(data).slice(0, 100));
  if (Array.isArray(data[0])) return data[0];
  return data;
}

export async function embedOne(text: string, _taskType = "RETRIEVAL_DOCUMENT"): Promise<number[]> {
  return getEmbedding(text.slice(0, 512));
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];
  for (const text of texts) {
    const embedding = await embedOne(text);
    results.push(embedding);
  }
  return results;
}

export async function embedQuery(text: string): Promise<number[]> {
  return getEmbedding(text.slice(0, 512));
}

export function toVector(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}