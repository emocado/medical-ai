import { describe, it, expect } from "vitest";
import {
  buildVoiceSystemPrompt,
  parseVoiceTurnResponse,
  stripMarkdown,
} from "@/lib/voice-session";
import { MEDICAL_DISCLAIMER } from "@/lib/prompts";
import type { ReportRecord, PillRecord } from "@/types";

describe("Voice Chat Session", () => {
  it("builds voice prompt with persona and language instructions", () => {
    const prompt = buildVoiceSystemPrompt({ language: "bm" });
    expect(prompt).toContain("HealthMate");
    expect(prompt).toContain("Bahasa Malaysia");
    expect(prompt).toContain(MEDICAL_DISCLAIMER);
    expect(prompt).toContain('"transcript"');
  });

  it("injects latest report and pills into voice prompt context", () => {
    const mockReport: Partial<ReportRecord> = {
      summary: {
        en: "Patient diagnosed with mild osteoarthritis.",
        bm: "Pesakit didiagnosis dengan osteoartritis ringan.",
        zh: "",
        ta: "",
      },
    };

    const mockPills: Partial<PillRecord>[] = [
      {
        analysis: {
          pills: [
            {
              name: "Glucosamine",
              genericName: "Glucosamine Sulfate",
              purpose: "Joint health",
              dosage: "1500mg daily",
              sideEffects: [],
              foodInteractions: [],
              drugInteractions: [],
            },
          ],
        },
      },
    ];

    const prompt = buildVoiceSystemPrompt({
      language: "en",
      latestReport: mockReport as ReportRecord,
      knownPills: mockPills as PillRecord[],
    });

    expect(prompt).toContain("mild osteoarthritis");
    expect(prompt).toContain("Glucosamine (1500mg daily)");
  });

  it("parses a transcript and spoken reply, stripping markdown for speech", () => {
    const result = parseVoiceTurnResponse(
      '```json\n{"transcript":"Is my sugar high?","reply":"**Yes**, a little.\\n- Eat less rice."}\n```'
    );
    expect(result.transcript).toBe("Is my sugar high?");
    expect(result.reply).toBe("Yes, a little.\nEat less rice.");
  });

  it("rejects a response with no reply", () => {
    expect(() => parseVoiceTurnResponse('{"transcript":"hello"}')).toThrow(/reply/);
  });

  it("strips headings and inline code", () => {
    expect(stripMarkdown("## Advice\n`rest` well")).toBe("Advice\nrest well");
  });
});
