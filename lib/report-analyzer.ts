import { getGeminiClient, GEMINI_FLASH_MODEL } from "./gemini";
import { buildHealthMatePrompt, ensureDisclaimer } from "./prompts";
import type { KeyMarker, MarkerStatus, ReportRecord } from "@/types";

export function cleanJsonText(rawText: string): string {
  let cleaned = rawText.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/i, "").replace(/\s*```$/, "");
  }
  return cleaned.trim();
}


const MARKER_STATUSES: MarkerStatus[] = ["normal", "high", "low", "abnormal", "critical", "unknown"];

/**
 * Maps the model's status to a known value. Anything missing or unrecognised
 * becomes "unknown" so an unreadable result is never shown as normal.
 */
export function normalizeMarkerStatus(raw: unknown): MarkerStatus {
  const status = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  return (MARKER_STATUSES as string[]).includes(status) ? (status as MarkerStatus) : "unknown";
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
    en: ensureDisclaimer(rawSummary.en || "Medical report summary not available.", "en"),
    bm: ensureDisclaimer(rawSummary.bm || "Ringkasan laporan perubatan tidak tersedia.", "bm"),
    zh: ensureDisclaimer(rawSummary.zh || "医疗报告摘要不可用。", "zh"),
    ta: ensureDisclaimer(rawSummary.ta || "மருத்துவ அறிக்கை சுருக்கம் கிடைக்கவில்லை.", "ta"),
  };

  const keyMarkers: Record<string, KeyMarker> = {};
  const entries: [string, any][] = Array.isArray(parsed.keyMarkers)
    ? parsed.keyMarkers.filter((item: any) => item && item.name).map((item: any) => [item.name, item])
    : parsed.keyMarkers && typeof parsed.keyMarkers === "object"
    ? Object.entries<any>(parsed.keyMarkers)
    : [];
  for (const [name, val] of entries) {
    if (val && typeof val === "object") {
      keyMarkers[name] = {
        value: val.value ?? "",
        unit: val.unit ?? "",
        status: normalizeMarkerStatus(val.status),
        ...(val.referenceRange ? { referenceRange: String(val.referenceRange) } : {}),
      };
    } else {
      keyMarkers[name] = { value: String(val), status: "unknown" };
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
   - "referenceRange": the reference/normal range exactly as printed on the report (e.g. "3.9 - 6.0", "<5.2"), or "" if none is printed
   - "status": one of:
       "critical" if the report marks it critical/panic (e.g. "HH", "LL", "CRITICAL", "*CRIT*"),
       "high" or "low" if it is flagged (H/L) or falls outside the printed reference range,
       "normal" if it is inside the printed reference range,
       "abnormal" for a non-numeric result reported as abnormal,
       "unknown" if there is no flag and no reference range to judge by. Never guess "normal".

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
