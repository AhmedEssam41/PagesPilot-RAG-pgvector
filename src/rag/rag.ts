// src/rag/rag.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { search } from "./vectorDB";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function ask(
  question: string,
  options: {
    collection?: string;
    systemPrompt?: string;
    language?: string;
    chatHistory?: { role: string; content: string }[];
    topK?: number;
  } = {}
) {
  const {
    collection = null,
    systemPrompt = null,
    language = "ar",
    chatHistory = [],
    topK = 5,
  } = options;

  // 1. البحث في pgvector
  const results = await search(question, {
    collection: collection ?? undefined,
    limit: topK,
    threshold: 0.0,
  });

  // 2. بناء الـ context
  const context =
    results.length > 0
      ? results
          .map(
            (r: any, i: number) =>
              `[${i + 1}] ${r.title ? r.title + "\n" : ""}${r.content}`
          )
          .join("\n\n---\n\n")
      : null;

  // 3. الـ system prompt
  const defaultSystem =
    language === "ar"
      ? `أنت مساعد ذكي ومفيد. أجب على الأسئلة بناءً على المعلومات المتوفرة.
- أجب بنفس لغة السؤال
- إذا وُجدت مصادر، أشر إليها بـ [1] [2] إلخ
- إذا لم تجد إجابة في المعلومات المتوفرة، قل ذلك بوضوح
- كن دقيقاً ومختصراً`
      : `You are a helpful AI assistant. Answer based on the provided context.
- Respond in the same language as the question
- Reference sources with [1] [2] etc.
- If the answer isn't in the context, say so clearly`;

  const model = genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite-preview",
    systemInstruction: systemPrompt || defaultSystem,
  });

  // 4. رسالة المستخدم
  const userMessage = context
    ? `المعلومات المتاحة:\n\n${context}\n\n---\n\nالسؤال: ${question}`
    : `السؤال: ${question}\n\n(لا توجد معلومات ذات صلة في قاعدة البيانات)`;

  // 5. سجل المحادثة
  const history = chatHistory.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(userMessage);
  const answer = result.response.text();

  return {
    answer,
    sources: results.map((r: any) => ({
      id: r.id,
      collection: r.collection,
      title: r.title || null,
      preview: r.content.slice(0, 150) + (r.content.length > 150 ? "..." : ""),
      similarity: parseFloat(r.similarity),
    })),
    hasContext: results.length > 0,
    retrievedChunks: results.length,
  };
}