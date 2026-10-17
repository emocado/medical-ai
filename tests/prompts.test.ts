import { describe, it, expect } from "vitest";
import { buildHealthMatePrompt, ensureDisclaimer, MEDICAL_DISCLAIMER, MEDICAL_DISCLAIMERS } from "@/lib/prompts";
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

describe("Localized medical disclaimer", () => {
  it("appends the disclaimer in the reader's language", () => {
    expect(ensureDisclaimer("Gula anda tinggi.", "bm")).toBe(`Gula anda tinggi.\n\n${MEDICAL_DISCLAIMERS.bm}`);
  });

  it("swaps an English disclaimer the model added to non-English text", () => {
    const out = ensureDisclaimer(`血糖偏高。\n\n${MEDICAL_DISCLAIMERS.en}`, "zh");
    expect(out).not.toContain(MEDICAL_DISCLAIMERS.en);
    expect(out.endsWith(MEDICAL_DISCLAIMERS.zh)).toBe(true);
  });

  it("does not duplicate an existing disclaimer", () => {
    const text = `Fine.\n\n${MEDICAL_DISCLAIMERS.en}`;
    expect(ensureDisclaimer(text, "en")).toBe(text);
  });
});

describe("Medication context", () => {
  it("uses the confirmed medicine list instead of old pill scans and skips stopped medicines", () => {
    const med = (name: string, active: boolean) => ({
      id: name,
      name,
      genericName: name.toLowerCase(),
      analysis: { purpose: "p", dosage: "", sideEffects: [], foodInteractions: ["Grapefruit"], drugInteractions: [] },
      schedule: ["night" as const],
      active,
      createdAt: 1,
    });
    const prompt = buildHealthMatePrompt({
      medications: [med("Atorvastatin", true), med("Ibuprofen", false)],
      knownPills: [{ id: "s", date: "", createdAt: 1, analysis: { pills: [{ name: "OldScanDrug", genericName: "", purpose: "", dosage: "", sideEffects: [], foodInteractions: [], drugInteractions: [] }] } }],
    });
    expect(prompt).toContain("CONFIRMS THEY CURRENTLY TAKE");
    expect(prompt).toContain("Atorvastatin (atorvastatin), dose not recorded; follow the pharmacy label, taken: night");
    expect(prompt).not.toContain("Ibuprofen");
    expect(prompt).not.toContain("OldScanDrug");
  });
});
