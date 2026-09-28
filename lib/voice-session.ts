import { buildHealthMatePrompt, MEDICAL_DISCLAIMER } from "./prompts";
import type { Language, PillRecord, ReportRecord } from "@/types";

export const GEMINI_LIVE_MODEL = "gemini-2.0-flash-exp";

export interface LiveSessionConfig {
  model: string;
  systemPrompt: string;
  voiceName: string;
}

export function getVoiceForLanguage(lang?: Language): string {
  // Available Live voices: Puck, Charon, Kore, Fenrir, Aoede
  switch (lang) {
    case "bm":
    case "ta":
      return "Aoede"; // Warm and clear
    case "zh":
      return "Kore"; // Gentle and distinct
    case "en":
    default:
      return "Aoede";
  }
}

export function buildLiveSessionConfig(params: {
  language?: Language;
  latestReport?: ReportRecord | null;
  knownPills?: PillRecord[] | null;
}): LiveSessionConfig {
  const systemPrompt = buildHealthMatePrompt({
    language: params.language,
    latestReport: params.latestReport,
    knownPills: params.knownPills,
    extraInstructions: `You are in a live, full-duplex spoken voice conversation with an elderly patient.
Keep all spoken replies gentle, warm, patient, and conversational.
Do not use markdown formatting, bullet points, or visual characters in your spoken words.
Speak naturally in clear, concise sentences.
If the patient mentions their recent reports or pills, use the injected health context.
Remind them kindly that this is conversational guidance and not a substitute for seeing their doctor.
Conclude your key medical answers with: "${MEDICAL_DISCLAIMER}".`,
  });

  return {
    model: GEMINI_LIVE_MODEL,
    systemPrompt,
    voiceName: getVoiceForLanguage(params.language),
  };
}
