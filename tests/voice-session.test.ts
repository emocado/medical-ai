import { describe, it, expect } from "vitest";
import { buildLiveSessionConfig } from "@/lib/voice-session";
import { MEDICAL_DISCLAIMER } from "@/lib/prompts";
import type { ReportRecord, PillRecord } from "@/types";

describe("Voice Chat Live Session Configuration", () => {
  it("builds live session prompt with persona and language instructions", () => {
    const config = buildLiveSessionConfig({ language: "bm" });
    expect(config.systemPrompt).toContain("HealthMate");
    expect(config.systemPrompt).toContain("Bahasa Malaysia");
    expect(config.systemPrompt).toContain(MEDICAL_DISCLAIMER);
    expect(config.model).toBeDefined();
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

    const config = buildLiveSessionConfig({
      language: "en",
      latestReport: mockReport as ReportRecord,
      knownPills: mockPills as PillRecord[],
    });

    expect(config.systemPrompt).toContain("mild osteoarthritis");
    expect(config.systemPrompt).toContain("Glucosamine (1500mg daily)");
  });

  it("selects appropriate voice name for selected language", () => {
    const enConfig = buildLiveSessionConfig({ language: "en" });
    const bmConfig = buildLiveSessionConfig({ language: "bm" });
    const zhConfig = buildLiveSessionConfig({ language: "zh" });
    const taConfig = buildLiveSessionConfig({ language: "ta" });

    expect(enConfig.voiceName).toBeDefined();
    expect(bmConfig.voiceName).toBeDefined();
    expect(zhConfig.voiceName).toBeDefined();
    expect(taConfig.voiceName).toBeDefined();
  });
});
