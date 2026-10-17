import { getGeminiClient, GEMINI_FLASH_MODEL } from "./gemini";
import { buildHealthMatePrompt, ensureDisclaimer } from "./prompts";
import { cleanJsonText } from "./report-analyzer";
import type { Language, ReportRecord } from "@/types";

export interface MarkerDelta {
  markerName: string;
  previousValue: string | number;
  currentValue: string | number;
  statusChange: string;
  interpretation: string;
}

export interface DeltaComparisonResult {
  progression: "improving" | "stable" | "declining" | "mixed";
  summary: string;
  markerDeltas: MarkerDelta[];
}

export function parseDeltaResponse(rawText: string, language: Language = "en"): DeltaComparisonResult {
  const cleaned = cleanJsonText(rawText);
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Failed to parse delta response: ${err instanceof Error ? err.message : String(err)}`);
  }

  const progression: "improving" | "stable" | "declining" | "mixed" =
    ["improving", "stable", "declining", "mixed"].includes(parsed.progression)
      ? parsed.progression
      : "stable";

  const summary = ensureDisclaimer(parsed.summary || "Report comparison completed.", language);

  const rawDeltas = Array.isArray(parsed.markerDeltas) ? parsed.markerDeltas : [];
  const markerDeltas: MarkerDelta[] = rawDeltas.map((d: any) => ({
    markerName: d.markerName || "Health Marker",
    previousValue: d.previousValue ?? "-",
    currentValue: d.currentValue ?? "-",
    statusChange: d.statusChange || "Observed change",
    interpretation: d.interpretation || "",
  }));

  return {
    progression,
    summary,
    markerDeltas,
  };
}

export async function compareReportsWithGemini(params: {
  reportA: ReportRecord;
  reportB: ReportRecord;
  language?: Language;
}): Promise<DeltaComparisonResult> {
  const client = getGeminiClient();

  // Order chronologically: earlier date is report 1 (previous), later is report 2 (current)
  const isAOlder = new Date(params.reportA.date).getTime() <= new Date(params.reportB.date).getTime();
  const older = isAOlder ? params.reportA : params.reportB;
  const newer = isAOlder ? params.reportB : params.reportA;

  const olderSummary = older.summary[params.language || "en"] || older.summary.en;
  const newerSummary = newer.summary[params.language || "en"] || newer.summary.en;

  const systemPrompt = buildHealthMatePrompt({
    language: params.language,
    extraInstructions: `You are comparing two medical reports across different dates for an elderly patient to evaluate their health progression.

Earlier Report (${older.date}, file: ${older.fileName}):
Summary: ${olderSummary}
Key Markers: ${JSON.stringify(older.keyMarkers)}

Later Report (${newer.date}, file: ${newer.fileName}):
Summary: ${newerSummary}
Key Markers: ${JSON.stringify(newer.keyMarkers)}

Evaluate:
1. "progression": exactly one of "improving", "stable", "declining", or "mixed"
2. "summary": A clear, comforting, plain-language progression explanation for the elderly patient explaining whether they are getting better, staying stable, or need extra attention.
3. "markerDeltas": array of key marker comparisons, each with:
   - "markerName": e.g. "Fasting Glucose"
   - "previousValue": value from earlier report
   - "currentValue": value from later report
   - "statusChange": e.g. "High -> Normal" or "Improved"
   - "interpretation": concise explanation of what this difference means.

Return ONLY valid JSON matching { "progression", "summary", "markerDeltas": [...] }.`,
  });

  const response = await client.models.generateContent({
    model: GEMINI_FLASH_MODEL,
    contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
    config: {
      responseMimeType: "application/json",
    },
  });

  const responseText = response.text || "";
  return parseDeltaResponse(responseText, params.language);
}
