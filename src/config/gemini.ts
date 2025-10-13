import { GoogleGenerativeAI } from "@google/generative-ai";

// Debug: Log environment variables
console.log("Gemini Config:");
console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "Set" : "Not set");

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use Gemini 2.5 Flash for content generation (latest available model)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export default model;
