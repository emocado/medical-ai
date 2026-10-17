import { getGeminiClient, GEMINI_FLASH_MODEL } from "./gemini";
import { buildHealthMatePrompt, ensureDisclaimer } from "./prompts";
import { cleanJsonText } from "./report-analyzer";
import { compareMarkers, overallProgression, type ChangeVerdict, type MarkerComparison } from "./trends";
import type { Language, MarkerStatus, ReportRecord } from "@/types";

export interface MarkerDelta {
  markerName: string;
  previousValue: string | number;
  currentValue: string | number;
  statusChange: string;
  interpretation: string;
  /** Set when the change was computed from the reports rather than described by the AI. */
  change?: ChangeVerdict;
  previousStatus?: MarkerStatus;
  currentStatus?: MarkerStatus;
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

function formatValue(marker: { value: string | number; unit?: string }): string {
  return `${marker.value}${marker.unit ? ` ${marker.unit}` : ""}`;
}

/**
 * Combines the computed comparison (which values changed, and whether that is
 * better or worse) with the AI's plain-language wording. The numbers, verdicts
 * and overall progression always come from the computation; the AI only
 * contributes the summary and per-marker explanations.
 */
export function mergeDelta(
  comparisons: MarkerComparison[],
  narrative: DeltaComparisonResult
): DeltaComparisonResult {
  const interpretations = new Map(
    narrative.markerDeltas.map((d) => [d.markerName.trim().toLowerCase(), d.interpretation])
  );

  return {
    progression: comparisons.length > 0 ? overallProgression(comparisons) : narrative.progression,
    summary: narrative.summary,
    markerDeltas: comparisons.map((c) => ({
      markerName: c.name,
      previousValue: formatValue(c.previous),
      currentValue: formatValue(c.current),
      statusChange: `${c.previous.status ?? "unknown"} -> ${c.current.status ?? "unknown"}`,
      interpretation: interpretations.get(c.name.trim().toLowerCase()) ?? "",
      change: c.change,
      previousStatus: c.previous.status,
      currentStatus: c.current.status,
    })),
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

  const comparisons = compareMarkers(older, newer);
  const progression = overallProgression(comparisons);
  const facts = comparisons
    .map(
      (c) =>
        `- ${c.name}: ${formatValue(c.previous)} (${c.previous.status ?? "unknown"}) -> ${formatValue(c.current)} (${c.current.status ?? "unknown"}); change: ${c.change}`
    )
    .join("\n");

  const systemPrompt = buildHealthMatePrompt({
    language: params.language,
    extraInstructions: `You are comparing two medical reports across different dates for an elderly patient to evaluate their health progression.

Earlier Report (${older.date}, file: ${older.fileName}):
Summary: ${olderSummary}

Later Report (${newer.date}, file: ${newer.fileName}):
Summary: ${newerSummary}

These changes were calculated from the two reports. Treat them as facts; do not recalculate them or contradict them:
${facts || "(No markers appear in both reports.)"}
Overall: ${progression}

Write:
1. "summary": a clear, honest, plain-language explanation for the elderly patient of what got better, what got worse and what to discuss with their doctor. Do not call a worsening result fine.
2. "markerDeltas": for each marker listed above, { "markerName": the exact name as listed, "interpretation": one short sentence on what this change means for them }.

Return ONLY valid JSON matching { "summary", "markerDeltas": [...] }.`,
  });

  const response = await client.models.generateContent({
    model: GEMINI_FLASH_MODEL,
    contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
    config: {
      responseMimeType: "application/json",
    },
  });

  return mergeDelta(comparisons, parseDeltaResponse(response.text || "", params.language));
}
