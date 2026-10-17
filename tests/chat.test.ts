import { describe, it, expect, vi } from "vitest";
import { formatChatPrompt, processChatMessage } from "@/lib/chat";
import { MEDICAL_DISCLAIMER, MEDICAL_DISCLAIMERS } from "@/lib/prompts";
import * as geminiModule from "@/lib/gemini";
import type { ReportRecord, PillRecord } from "@/types";

describe("Chat Logic and Prompt Construction", () => {
  it("formats prompt including disclaimer and language instruction", () => {
    const prompt = formatChatPrompt({ language: "zh" });
    expect(prompt).toContain("HealthMate");
    expect(prompt).toContain("Mandarin (Simplified Chinese)");
    expect(prompt).toContain(MEDICAL_DISCLAIMERS.zh);
  });

  it("injects report and pills context if present", () => {
    const report: Partial<ReportRecord> = {
      summary: {
        en: "Cholesterol is high.",
        bm: "Kolesterol tinggi.",
        zh: "胆固醇偏高。",
        ta: "கொழுப்பு அதிகம்.",
      },
      keyMarkers: {
        Cholesterol: { value: 6.2, unit: "mmol/L", status: "high" },
      },
    };

    const pills: Partial<PillRecord>[] = [
      {
        analysis: {
          pills: [
            {
              name: "Atorvastatin",
              genericName: "Atorvastatin",
              purpose: "Lower cholesterol",
              dosage: "20mg nightly",
              sideEffects: ["Muscle aches"],
              foodInteractions: ["Grapefruit"],
              drugInteractions: [],
            },
          ],
        },
      },
    ];

    const prompt = formatChatPrompt({
      language: "en",
      latestReport: report as ReportRecord,
      knownPills: pills as PillRecord[],
    });

    expect(prompt).toContain("Cholesterol is high.");
    expect(prompt).toContain("Atorvastatin (20mg nightly)");
  });

  it("calls Gemini with multi-turn chat history and appends disclaimer to reply", async () => {
    const mockGenerateContent = vi.fn().mockResolvedValue({
      text: "You can take your medication with warm water after dinner.",
    });

    vi.spyOn(geminiModule, "getGeminiClient").mockReturnValue({
      models: {
        generateContent: mockGenerateContent,
      },
    } as any);

    const reply = await processChatMessage({
      messages: [
        { role: "user", content: "Should I take my pills before or after eating?" },
      ],
      language: "en",
    });

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(reply).toContain("You can take your medication with warm water");
    expect(reply).toContain(MEDICAL_DISCLAIMER);
  });
});
