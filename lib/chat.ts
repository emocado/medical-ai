import { getGeminiClient, GEMINI_FLASH_MODEL } from "./gemini";
import { buildHealthMatePrompt, MEDICAL_DISCLAIMER } from "./prompts";
import type { Language, ReportRecord, PillRecord } from "@/types";

export interface ChatMessageItem {
  role: "user" | "assistant" | "model";
  content: string;
}

export function formatChatPrompt(params: {
  language?: Language;
  latestReport?: ReportRecord | null;
  knownPills?: PillRecord[] | null;
}): string {
  return buildHealthMatePrompt({
    language: params.language,
    latestReport: params.latestReport,
    knownPills: params.knownPills,
    extraInstructions: `You are answering follow-up health questions from an elderly patient.
Be warm, compassionate, patient, and straightforward.
If the user asks questions about their report or pills, refer to their injected health context.
If no report or pills are provided, provide safe, accurate, general health information.
Never prescribe medication or give definitive diagnoses.
Always conclude your answer with the disclaimer: "${MEDICAL_DISCLAIMER}".`,
  });
}

export async function processChatMessage(params: {
  messages: ChatMessageItem[];
  language?: Language;
  latestReport?: ReportRecord | null;
  knownPills?: PillRecord[] | null;
}): Promise<string> {
  const client = getGeminiClient();
  const systemPrompt = formatChatPrompt({
    language: params.language,
    latestReport: params.latestReport,
    knownPills: params.knownPills,
  });

  const contents = params.messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const response = await client.models.generateContent({
    model: GEMINI_FLASH_MODEL,
    contents,
    config: {
      systemInstruction: systemPrompt,
    },
  });

  let text = (response.text || "").trim();
  if (!text.includes(MEDICAL_DISCLAIMER)) {
    text = `${text}\n\n${MEDICAL_DISCLAIMER}`;
  }

  return text;
}
