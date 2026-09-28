import { describe, it, expect } from "vitest";
import { buildHealthMatePrompt, MEDICAL_DISCLAIMER } from "@/lib/prompts";
import type { ReportRecord, PillRecord } from "@/types";

describe("HealthMate System Prompt Builder", () => {
  it("includes persona and standard medical disclaimer", () => {
    const prompt = buildHealthMatePrompt({ language: "en" });
    expect(prompt).toContain("HealthMate");
    expect(prompt).toContain("compassionate medical companion for elderly patients");
    expect(prompt).toContain("English");
    expect(prompt).toContain(MEDICAL_DISCLAIMER);
  });

  it("injects latest report summary and known pills when provided", () => {
    const mockReport: Partial<ReportRecord> = {
      summary: {
        en: "Mild hypertension noted.",
        bm: "Hipertensi ringan dicatat.",
        zh: "轻度高血压。",
        ta: "லேசான உயர் இரத்த அழுத்தம்.",
      },
    };

    const mockPillRecord: Partial<PillRecord> = {
      analysis: {
        pills: [
          {
            name: "Amlodipine",
            genericName: "Amlodipine Besylate",
            purpose: "Blood pressure",
            dosage: "5mg daily",
            sideEffects: ["Swelling"],
            foodInteractions: ["Grapefruit"],
            drugInteractions: [],
          },
        ],
      },
    };

    const prompt = buildHealthMatePrompt({
      language: "en",
      latestReport: mockReport as ReportRecord,
      knownPills: [mockPillRecord as PillRecord],
    });

    expect(prompt).toContain("Mild hypertension noted.");
    expect(prompt).toContain("Amlodipine (5mg daily)");
  });

  it("handles different languages (bm, zh, ta)", () => {
    const bmPrompt = buildHealthMatePrompt({ language: "bm" });
    expect(bmPrompt).toContain("Bahasa Malaysia");

    const zhPrompt = buildHealthMatePrompt({ language: "zh" });
    expect(zhPrompt).toContain("Mandarin (Simplified Chinese)");

    const taPrompt = buildHealthMatePrompt({ language: "ta" });
    expect(taPrompt).toContain("Tamil");
  });
});
