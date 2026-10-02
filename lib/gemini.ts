import { GoogleGenAI } from "@google/genai";

export const GEMINI_FLASH_MODEL = "gemini-3.8-flash";

// Gemini models are served through the OpenCode Zen gateway, which speaks the
// Google GenAI wire format at /zen/v1/models/<model-id> and accepts the key via
// the same `x-goog-api-key` header the SDK already sends.
export const OPENCODE_ZEN_BASE_URL = "https://opencode.ai/zen";
export const OPENCODE_ZEN_API_VERSION = "v1";

let clientInstance: GoogleGenAI | null = null;
let cachedApiKey: string | null = null;

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.OPENCODE_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPENCODE_API_KEY environment variable. Please check your .env configuration.");
  }

  if (!clientInstance || cachedApiKey !== apiKey) {
    clientInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        baseUrl: OPENCODE_ZEN_BASE_URL,
        apiVersion: OPENCODE_ZEN_API_VERSION,
      },
    });
    cachedApiKey = apiKey;
  }

  return clientInstance;
}
