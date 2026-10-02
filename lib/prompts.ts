import type { Language, ReportRecord, PillRecord } from "@/types";

export const MEDICAL_DISCLAIMERS: Record<Language, string> = {
  en: "This is not a substitute for professional medical advice. Please consult your doctor.",
  bm: "Ini bukan pengganti nasihat perubatan profesional. Sila berjumpa doktor anda.",
  zh: "本内容不能替代专业医疗建议。请咨询您的医生。",
  ta: "இது தொழில்முறை மருத்துவ ஆலோசனைக்கு மாற்றாகாது. தயவுசெய்து உங்கள் மருத்துவரை அணுகவும்.",
};

export const MEDICAL_DISCLAIMER = MEDICAL_DISCLAIMERS.en;

export function getDisclaimer(language: Language = "en"): string {
  return MEDICAL_DISCLAIMERS[language] || MEDICAL_DISCLAIMER;
}

/**
 * Makes sure AI text ends with the disclaimer in the reader's language. An
 * English disclaimer the model added to non-English text is swapped out
 * rather than doubled up.
 */
export function ensureDisclaimer(text: string, language: Language = "en"): string {
  const disclaimer = getDisclaimer(language);
  let body = text.trim();
  if (language !== "en" && body.includes(MEDICAL_DISCLAIMER)) {
    body = body.split(MEDICAL_DISCLAIMER).join("").trim();
  }
  return body.includes(disclaimer) ? body : `${body}\n\n${disclaimer}`;
}

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
Be gentle, patient and easy to understand for elderly users, but always honest: never downplay abnormal or worrying results.
If a result is critical, or the patient describes serious symptoms (chest pain, trouble breathing, confusion, fainting, sudden weakness), clearly advise contacting their doctor today, or calling 999 in an emergency.
Always end your response with this disclaimer verbatim on a new line:
"${getDisclaimer(context.language)}"\n\n`;

  if (context.latestReport) {
    const rSummary =
      context.latestReport.summary[context.language || "en"] ||
      context.latestReport.summary.en;
    prompt += `=== USER'S RECENT MEDICAL REPORT CONTEXT ===\n${rSummary}\n`;
    if (context.latestReport.keyMarkers && Object.keys(context.latestReport.keyMarkers).length > 0) {
      prompt += "Key Markers:\n";
      for (const [key, marker] of Object.entries(context.latestReport.keyMarkers)) {
        const range = marker.referenceRange ? `, normal range ${marker.referenceRange}` : "";
        prompt += `- ${key}: ${marker.value} ${marker.unit || ""} (${marker.status || "unknown"}${range})\n`;
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
