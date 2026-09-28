import type { Language, ReportRecord, PillRecord } from "@/types";

export const MEDICAL_DISCLAIMER =
  "This is not a substitute for professional medical advice. Please consult your doctor.";

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English",
  bm: "Bahasa Malaysia",
  zh: "Mandarin (Simplified Chinese)",
  ta: "Tamil",
};

interface PromptContext {
  language?: Language;
  latestReport?: ReportRecord | null;
  knownPills?: PillRecord[] | null;
  extraInstructions?: string;
}

export function buildHealthMatePrompt(context: PromptContext = {}): string {
  const langName = context.language ? LANGUAGE_NAMES[context.language] : "English";

  let prompt = `You are HealthMate, a compassionate medical companion for elderly patients.
Your role is to explain medical information simply, kindly, and clearly, avoiding unnecessary jargon, in ${langName}.
Keep all explanations gentle, reassuring, and easy to understand for elderly users.
Always end your response with this disclaimer verbatim on a new line:
"${MEDICAL_DISCLAIMER}"\n\n`;

  if (context.latestReport) {
    const rSummary =
      context.latestReport.summary[context.language || "en"] ||
      context.latestReport.summary.en;
    prompt += `=== USER'S RECENT MEDICAL REPORT CONTEXT ===\n${rSummary}\n`;
    if (context.latestReport.keyMarkers && Object.keys(context.latestReport.keyMarkers).length > 0) {
      prompt += "Key Markers:\n";
      for (const [key, marker] of Object.entries(context.latestReport.keyMarkers)) {
        prompt += `- ${key}: ${marker.value} ${marker.unit || ""} (${marker.status || "normal"})\n`;
      }
    }
    prompt += "\n";
  }

  if (context.knownPills && context.knownPills.length > 0) {
    prompt += `=== USER'S CURRENT MEDICATIONS ===\n`;
    for (const record of context.knownPills) {
      for (const pill of record.analysis.pills) {
        prompt += `- ${pill.name} (${pill.dosage}): ${pill.purpose}. Side effects: ${pill.sideEffects.join(", ")}. Food interactions: ${pill.foodInteractions.join(", ")}\n`;
      }
    }
    prompt += "\n";
  }

  if (context.extraInstructions) {
    prompt += `=== TASK INSTRUCTIONS ===\n${context.extraInstructions}\n`;
  }

  return prompt;
}
