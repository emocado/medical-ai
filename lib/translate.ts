import { getGeminiClient, GEMINI_FLASH_MODEL } from "./gemini";
import { LANGUAGE_NAMES } from "./prompts";
import { cleanJsonText } from "./report-analyzer";
import type { Language } from "@/types";

/**
 * Takes the original value's shape and fills each string from the matching
 * position in the model's translation. Keys, numbers and array lengths always
 * come from the original, so a sloppy translation can never corrupt a record.
 */
/** Machine-readable fields whose values must never be translated. */
const PRESERVED_KEYS = new Set([
  "dosageSource",
  "confidence",
  "progression",
  "status",
  "change",
  "previousStatus",
  "currentStatus",
  "id",
  "language",
]);

export function mergeTranslatedStrings<T>(original: T, translated: unknown): T {
  if (typeof original === "string") {
    return (typeof translated === "string" && translated.trim() ? translated : original) as T;
  }
  if (Array.isArray(original)) {
    const source = Array.isArray(translated) ? translated : [];
    return original.map((item, i) => mergeTranslatedStrings(item, source[i])) as T;
  }
  if (original && typeof original === "object") {
    const source = translated && typeof translated === "object" ? (translated as Record<string, unknown>) : {};
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(original as Record<string, unknown>)) {
      out[key] = PRESERVED_KEYS.has(key) ? value : mergeTranslatedStrings(value, source[key]);
    }
    return out as T;
  }
  return original;
}

export async function translateContent<T>(content: T, targetLanguage: Language): Promise<T> {
  const client = getGeminiClient();
  const prompt = `Translate every human-readable string value in the JSON below into ${LANGUAGE_NAMES[targetLanguage]} for an elderly patient.
Keep exactly the same JSON structure, keys and array order.
Keep medicine brand names, generic drug names, numbers and measurement units (mg, mmol/L, %) exactly as written.
Translate everything else, including everyday words such as "tablet" and month names.
Use simple, gentle wording. Return ONLY the translated JSON.

${JSON.stringify(content)}`;

  const response = await client.models.generateContent({
    model: GEMINI_FLASH_MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { responseMimeType: "application/json" },
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleanJsonText(response.text || ""));
  } catch (err) {
    throw new Error(`Failed to parse translation: ${err instanceof Error ? err.message : String(err)}`);
  }
  return mergeTranslatedStrings(content, parsed);
}
