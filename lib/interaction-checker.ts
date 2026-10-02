import { getGeminiClient, GEMINI_FLASH_MODEL } from "./gemini";
import { buildHealthMatePrompt } from "./prompts";
import { cleanJsonText } from "./report-analyzer";
import type { Language, MedicationEntry, ReportRecord } from "@/types";

export type InteractionSeverity = "serious" | "moderate" | "minor";

export interface InteractionFinding {
  medicines: string[];
  severity: InteractionSeverity;
  explanation: string;
  advice: string;
}

export interface InteractionCheckResult {
  findings: InteractionFinding[];
  summary: string;
}

const SEVERITY_ORDER: InteractionSeverity[] = ["serious", "moderate", "minor"];

export function parseInteractionResponse(rawText: string): InteractionCheckResult {
  let parsed: any;
  try {
    parsed = JSON.parse(cleanJsonText(rawText));
  } catch (err) {
    throw new Error(`Failed to parse interaction check: ${err instanceof Error ? err.message : String(err)}`);
  }

  const findings: InteractionFinding[] = (Array.isArray(parsed.findings) ? parsed.findings : [])
    .filter((f: any) => f && Array.isArray(f.medicines) && f.medicines.length > 0)
    .map((f: any) => ({
      medicines: f.medicines.map(String),
      // Unknown severities are treated as moderate: worth showing, not alarming.
      severity: SEVERITY_ORDER.includes(f.severity) ? f.severity : "moderate",
      explanation: String(f.explanation || ""),
      advice: String(f.advice || ""),
    }))
    .sort((a: InteractionFinding, b: InteractionFinding) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity));

  return { findings, summary: String(parsed.summary || "") };
}

export async function checkMedicationInteractions(params: {
  medications: MedicationEntry[];
  latestReport?: ReportRecord | null;
  language?: Language;
}): Promise<InteractionCheckResult> {
  const client = getGeminiClient();
  const active = params.medications.filter((m) => m.active);
  const list = active.map((m) => `- ${m.name} (${m.genericName})`).join("\n");

  const prompt = buildHealthMatePrompt({
    language: params.language,
    latestReport: params.latestReport,
    extraInstructions: `Check this elderly patient's complete list of current medicines for problems when they are taken TOGETHER, and with the health conditions in their report (for example kidney function and diabetes medicines).

Medicines:
${list}

Return JSON with:
1. "findings": array of real, clinically meaningful problems only (no theoretical or trivial ones), each with:
   - "medicines": the medicine names involved, exactly as written above
   - "severity": "serious" (needs a doctor or pharmacist soon), "moderate" (worth asking at the next visit) or "minor"
   - "explanation": one plain sentence on what could happen
   - "advice": one plain sentence on what to do. Never tell the patient to stop a medicine on their own; tell them to ask their doctor or pharmacist.
2. "summary": two or three gentle, honest sentences about the overall result.
If there are no meaningful problems, return an empty "findings" array.

Return ONLY valid JSON matching { "findings": [...], "summary": "..." }.`,
  });

  const response = await client.models.generateContent({
    model: GEMINI_FLASH_MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { responseMimeType: "application/json" },
  });

  return parseInteractionResponse(response.text || "");
}
