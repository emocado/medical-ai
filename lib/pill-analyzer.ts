import { getGeminiClient, GEMINI_FLASH_MODEL } from "./gemini";
import { buildHealthMatePrompt } from "./prompts";
import { cleanJsonText } from "./report-analyzer";
import type { Language, PillInfo, PillRecord, ReportRecord } from "@/types";

export function parsePillResponse(rawText: string, imageBase64?: string): PillRecord {
  const cleaned = cleanJsonText(rawText);
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Failed to parse AI response into pill data: ${err instanceof Error ? err.message : String(err)}`);
  }

  const rawPills = Array.isArray(parsed.pills) ? parsed.pills : [];
  const pills: PillInfo[] = rawPills.map((p: any) => ({
    name: p.name || "Unknown Medication",
    genericName: p.genericName || "",
    purpose: p.purpose || "Health management",
    dosage: p.dosage || "As prescribed by doctor",
    sideEffects: Array.isArray(p.sideEffects) ? p.sideEffects : [],
    foodInteractions: Array.isArray(p.foodInteractions) ? p.foodInteractions : [],
    drugInteractions: Array.isArray(p.drugInteractions) ? p.drugInteractions : [],
  }));

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
   - "dosage": Safe dosage and timing instructions (e.g. "500mg with meals twice daily")
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
  return parsePillResponse(responseText, params.imageBase64);
}
