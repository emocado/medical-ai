import { getGeminiClient, GEMINI_FLASH_MODEL } from "./gemini";
import { buildHealthMatePrompt, MEDICAL_DISCLAIMER } from "./prompts";
import type { KeyMarker, ReportRecord } from "@/types";

interface RawKeyMarker {
  name: string;
  value: string | number;
  unit?: string;
  status?: string;
}

export function cleanJsonText(rawText: string): string {
  let cleaned = rawText.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/i, "").replace(/\s*```$/, "");
  }
  return cleaned.trim();
}

function ensureDisclaimer(text: string): string {
  if (!text.includes(MEDICAL_DISCLAIMER)) {
    return `${text.trim()}\n\n${MEDICAL_DISCLAIMER}`;
  }
  return text;
}

export function parseReportResponse(
  rawText: string,
  fileName: string,
  fileType: string,
  rawBase64?: string
): ReportRecord {
  const cleaned = cleanJsonText(rawText);
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Failed to parse AI response into JSON: ${err instanceof Error ? err.message : String(err)}`);
  }

  const rawSummary = parsed.summary || {};
  const summary = {
    en: ensureDisclaimer(rawSummary.en || "Medical report summary not available."),
    bm: ensureDisclaimer(rawSummary.bm || "Ringkasan laporan perubatan tidak tersedia."),
    zh: ensureDisclaimer(rawSummary.zh || "医疗报告摘要不可用。"),
    ta: ensureDisclaimer(rawSummary.ta || "மருத்துவ அறிக்கை சுருக்கம் கிடைக்கவில்லை."),
  };

  const keyMarkers: Record<string, KeyMarker> = {};
  if (Array.isArray(parsed.keyMarkers)) {
    for (const item of parsed.keyMarkers) {
      if (item && item.name) {
        keyMarkers[item.name] = {
          value: item.value ?? "",
          unit: item.unit ?? "",
          status: item.status ?? "normal",
        };
      }
    }
  } else if (parsed.keyMarkers && typeof parsed.keyMarkers === "object") {
    for (const [key, val] of Object.entries<any>(parsed.keyMarkers)) {
      if (val && typeof val === "object") {
        keyMarkers[key] = {
          value: val.value ?? "",
          unit: val.unit ?? "",
          status: val.status ?? "normal",
        };
      } else {
        keyMarkers[key] = { value: String(val) };
      }
    }
  }

  const now = new Date();
  const dateStr = parsed.date || now.toISOString().split("T")[0];

  return {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `rep-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    date: dateStr,
    fileName,
    fileType,
    rawBase64,
    summary,
    keyMarkers,
    createdAt: Date.now(),
  };
}

export async function analyzeReportWithGemini(params: {
  fileBase64: string;
  mimeType: string;
  fileName: string;
}): Promise<ReportRecord> {
  const client = getGeminiClient();
  const systemPrompt = buildHealthMatePrompt({
    extraInstructions: `You are analyzing a medical document or report image/PDF for an elderly patient.
Extract:
1. "date": The date of the medical report (YYYY-MM-DD format if known, or best estimate).
2. "summary": A compassionate, easy-to-understand plain language summary for the patient in 4 languages:
   - "en": English
   - "bm": Bahasa Malaysia
   - "zh": Simplified Chinese (中文)
   - "ta": Tamil (தமிழ்)
   Explain what the test was, what the results mean, and any important highlights. Keep it simple and clear.
3. "keyMarkers": An array of important lab test or vital markers found in the report, with fields:
   - "name": e.g. "Fasting Blood Glucose", "Total Cholesterol", "Hemoglobin", "Blood Pressure"
   - "value": string or number
   - "unit": e.g. "mmol/L", "mg/dL", "g/dL", "mmHg"
   - "status": "normal" | "high" | "low" | "abnormal"

Return ONLY valid JSON with fields { "date", "summary": { "en", "bm", "zh", "ta" }, "keyMarkers": [...] }.`,
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
              data: params.fileBase64,
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
  return parseReportResponse(responseText, params.fileName, params.mimeType, params.fileBase64);
}
