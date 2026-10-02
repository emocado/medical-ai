import { getGeminiClient, GEMINI_FLASH_MODEL } from "./gemini";
import { buildHealthMatePrompt } from "./prompts";
import { cleanJsonText } from "./report-analyzer";
import type { Language, PillInfo, PillRecord, ReportRecord } from "@/types";

export function parsePillResponse(
  rawText: string,
  imageBase64?: string,
  language: Language = "en"
): PillRecord {
  const cleaned = cleanJsonText(rawText);
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Failed to parse AI response into pill data: ${err instanceof Error ? err.message : String(err)}`);
  }

  const rawPills = Array.isArray(parsed.pills) ? parsed.pills : [];
  const pills: PillInfo[] = rawPills.map((p: any) => {
    const dosage = typeof p.dosage === "string" ? p.dosage.trim() : "";
    return {
      name: p.name || "Unknown Medication",
      genericName: p.genericName || "",
      purpose: p.purpose || "Health management",
      // Only label text counts as a dose; the model must never invent one.
      dosage: p.dosageSource === "not-visible" ? "" : dosage,
      dosageSource: p.dosageSource !== "not-visible" && dosage ? "label" : "not-visible",
      confidence: ["high", "medium", "low"].includes(p.confidence) ? p.confidence : "low",
      sideEffects: Array.isArray(p.sideEffects) ? p.sideEffects : [],
      foodInteractions: Array.isArray(p.foodInteractions) ? p.foodInteractions : [],
      drugInteractions: Array.isArray(p.drugInteractions) ? p.drugInteractions : [],
    };
  });

  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];

  return {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `pill-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    date: dateStr,
    imageBase64,
    analysis: {
      pills,
      crossRefWithReports: parsed.crossRefWithReports || undefined,
    },
    createdAt: Date.now(),
    language,
  };
}

export async function analyzePillImage(params: {
  imageBase64: string;
  mimeType: string;
  latestReport?: ReportRecord | null;
  language?: Language;
}): Promise<PillRecord> {
  const client = getGeminiClient();
  const systemPrompt = buildHealthMatePrompt({
    language: params.language,
    latestReport: params.latestReport,
    extraInstructions: `You are identifying medications and pills from a photograph for an elderly patient.
Carefully examine any pills, blister packs, prescription labels, or boxes visible.
Return a structured JSON object with:
1. "pills": array of detected medications, each with:
   - "name": Brand or familiar name (e.g. "Panadol", "Lipitor")
   - "genericName": Active ingredient (e.g. "Paracetamol", "Atorvastatin")
   - "purpose": Plain language explanation of what this medication does for the patient
   - "dosage": the dosing instructions EXACTLY as printed on the pharmacy or prescription label (e.g. "Take 1 tablet twice daily after meals"), translated into the reply language if needed. If no dosing instructions are visible, return "". NEVER suggest, estimate or fill in a dose yourself.
   - "dosageSource": "label" if the dosage was read from a label in the photo, otherwise "not-visible"
   - "confidence": how sure you are of the identification: "high" if the drug name is clearly printed on a label or box, "medium" if partly readable, "low" if identified only from the pill's appearance
   - "sideEffects": Array of key symptoms or side effects the patient should watch out for
   - "foodInteractions": Array of foods, drinks, or herbs to avoid while taking this pill (e.g. "Grapefruit", "Alcohol")
   - "drugInteractions": Array of other medications or substances to watch out for
2. "crossRefWithReports": If recent health reports are provided in the context, explicitly explain how these pills connect to the patient's existing health conditions (e.g. "Prescribed for the high blood pressure noted on your recent hospital report").

Return ONLY valid JSON matching { "pills": [...], "crossRefWithReports": "..." }.`,
  });

  const response = await client.models.generateContent({
    model: GEMINI_FLASH_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: params.mimeType,
              data: params.imageBase64,
            },
          },
          {
            text: systemPrompt,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
    },
  });

  const responseText = response.text || "";
  return parsePillResponse(responseText, params.imageBase64, params.language);
}
