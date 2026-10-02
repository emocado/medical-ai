import { getGeminiClient, GEMINI_FLASH_MODEL } from "./gemini";
import { buildHealthMatePrompt, getDisclaimer } from "./prompts";
import { cleanJsonText } from "./report-analyzer";
import type { Language, PillRecord, ReportRecord, MedicationEntry } from "@/types";

export interface VoiceHistoryItem {
  role: "user" | "assistant";
  content: string;
}

export interface VoiceTurnResult {
  transcript: string;
  reply: string;
}

/** How many prior chat turns are sent along with each spoken question. */
export const VOICE_HISTORY_LIMIT = 10;

export function buildVoiceSystemPrompt(params: {
  language?: Language;
  latestReport?: ReportRecord | null;
  knownPills?: PillRecord[] | null;
  medications?: MedicationEntry[] | null;
}): string {
  return buildHealthMatePrompt({
    language: params.language,
    latestReport: params.latestReport,
    knownPills: params.knownPills,
    medications: params.medications,
    extraInstructions: `You are in a spoken voice conversation with an elderly patient. Each turn you receive a short audio recording of the patient speaking.
1. Transcribe exactly what the patient said, in the language they spoke.
2. Reply as you would out loud: gentle, warm, patient, conversational, at most 4 short sentences.
Do not use markdown formatting, bullet points, numbering, or visual characters in the reply; it will be read aloud.
If the patient mentions their recent reports or pills, use the injected health context.
If the recording is silent or unintelligible, set "transcript" to "" and kindly ask them to repeat.
Conclude your key medical answers with: "${getDisclaimer(params.language)}".

Return ONLY valid JSON matching { "transcript": "...", "reply": "..." }.`,
  });
}

export function parseVoiceTurnResponse(rawText: string): VoiceTurnResult {
  let parsed: any;
  try {
    parsed = JSON.parse(cleanJsonText(rawText));
  } catch (err) {
    throw new Error(`Failed to parse voice response: ${err instanceof Error ? err.message : String(err)}`);
  }

  const transcript = typeof parsed.transcript === "string" ? parsed.transcript.trim() : "";
  const reply = typeof parsed.reply === "string" ? stripMarkdown(parsed.reply) : "";
  if (!reply) {
    throw new Error("Voice response did not include a reply.");
  }
  return { transcript, reply };
}

/** Removes markdown symbols that a text-to-speech voice would read out literally. */
export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/^#+\s*/gm, "")
    .replace(/^\s*[-*•]\s+/gm, "")
    .replace(/`/g, "")
    .trim();
}

export async function processVoiceTurn(params: {
  audioBase64: string;
  mimeType: string;
  history?: VoiceHistoryItem[];
  language?: Language;
  latestReport?: ReportRecord | null;
  knownPills?: PillRecord[] | null;
  medications?: MedicationEntry[] | null;
}): Promise<VoiceTurnResult> {
  const client = getGeminiClient();
  const systemPrompt = buildVoiceSystemPrompt(params);

  const history = (params.history || []).slice(-VOICE_HISTORY_LIMIT).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const response = await client.models.generateContent({
    model: GEMINI_FLASH_MODEL,
    contents: [
      ...history,
      {
        role: "user",
        parts: [
          { inlineData: { mimeType: params.mimeType, data: params.audioBase64 } },
          { text: "This is the patient's spoken question." },
        ],
      },
    ],
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
    },
  });

  return parseVoiceTurnResponse(response.text || "");
}
