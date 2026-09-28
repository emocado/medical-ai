import { GoogleGenAI } from "@google/genai";

export const GEMINI_FLASH_MODEL = "gemini-2.5-flash";

let clientInstance: GoogleGenAI | null = null;
let cachedApiKey: string | null = null;

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable. Please check your .env configuration.");
  }

  if (!clientInstance || cachedApiKey !== apiKey) {
    clientInstance = new GoogleGenAI({ apiKey });
    cachedApiKey = apiKey;
  }

  return clientInstance;
}
