import { describe, it, expect } from "vitest";
import {
  findKnownInteractions,
  findSameMedication,
  inferSchedule,
  localDate,
  medicationFromPill,
} from "@/lib/medications";
import type { PillInfo } from "@/types";

const pill = (over: Partial<PillInfo>): PillInfo => ({
  name: "X",
  genericName: "X",
  purpose: "",
  dosage: "",
  sideEffects: [],
  foodInteractions: [],
  drugInteractions: [],
  ...over,
});

describe("Dose schedule from label wording", () => {
  it("reads times from the sample pharmacy labels", () => {
    expect(inferSchedule("Take 1 tablet twice daily after breakfast and dinner")).toEqual(["morning", "evening"]);
    expect(inferSchedule("Take 1 tablet once daily in the morning")).toEqual(["morning"]);
    expect(inferSchedule("Take 1 tablet once daily at night")).toEqual(["night"]);
    expect(inferSchedule("Makan 1 biji 2 kali sehari")).toEqual(["morning", "evening"]);
    expect(inferSchedule("1 tab TDS")).toEqual(["morning", "afternoon", "evening"]);
    expect(inferSchedule("每日两次，每次一片")).toEqual(["morning", "evening"]);
    expect(inferSchedule("")).toEqual(["morning"]);
  });
});

describe("Adding scanned medicines", () => {
  it("never carries over a dose that was not on the label", () => {
    const med = medicationFromPill(pill({ name: "Amlodipine", dosage: "5mg daily", dosageSource: "not-visible" }));
    expect(med.analysis.dosage).toBe("");
    expect(med.active).toBe(true);
  });

  it("recognises a medicine that is already on the list", () => {
    const existing = medicationFromPill(pill({ name: "Lipitor", genericName: "Atorvastatin" }));
    expect(findSameMedication([existing], { name: "Atorvastatin 20mg", genericName: "atorvastatin" })).toBe(existing);
    expect(findSameMedication([existing], { name: "Metformin", genericName: "Metformin" })).toBeUndefined();
  });

  it("formats the local date", () => {
    expect(localDate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("Known dangerous combinations", () => {
  it("flags clarithromycin with atorvastatin (the sample antibiotic + regimen)", () => {
    const found = findKnownInteractions([
      { name: "Metformin HCl 500mg", genericName: "Metformin Hydrochloride" },
      { name: "Atorvastatin 20mg", genericName: "Atorvastatin" },
      { name: "Clarithromycin 500mg", genericName: "Clarithromycin" },
    ]);
    expect(found).toEqual([
      { medicines: ["Clarithromycin 500mg", "Atorvastatin 20mg"], severity: "serious", adviceKey: "interaction.statinMacrolide" },
    ]);
  });

  it("flags warfarin with an NSAID and ACE inhibitor with spironolactone", () => {
    const keys = findKnownInteractions([
      { name: "Warfarin", genericName: "warfarin" },
      { name: "Aspirin 100mg", genericName: "acetylsalicylic acid (aspirin)" },
      { name: "Perindopril", genericName: "perindopril" },
      { name: "Aldactone", genericName: "spironolactone" },
    ]).map((f) => f.adviceKey);
    expect(keys).toEqual(["interaction.warfarinNsaid", "interaction.potassium"]);
  });

  it("does not flag a safe regimen", () => {
    expect(
      findKnownInteractions([
        { name: "Metformin", genericName: "metformin" },
        { name: "Amlodipine", genericName: "amlodipine" },
      ])
    ).toEqual([]);
  });
});

describe("AI interaction check parsing", () => {
  it("sorts serious findings first, defaults unknown severity, drops malformed items", async () => {
    const { parseInteractionResponse } = await import("@/lib/interaction-checker");
    const result = parseInteractionResponse(
      JSON.stringify({
        summary: "Two things to ask about.",
        findings: [
          { medicines: ["Metformin"], severity: "minor", explanation: "a", advice: "b" },
          { medicines: ["Clarithromycin", "Atorvastatin"], severity: "serious", explanation: "c", advice: "d" },
          { medicines: ["Amlodipine"], severity: "weird", explanation: "e", advice: "f" },
          { severity: "serious" },
        ],
      })
    );
    expect(result.findings.map((f) => f.severity)).toEqual(["serious", "moderate", "minor"]);
    expect(result.findings[0].medicines).toEqual(["Clarithromycin", "Atorvastatin"]);
    expect(result.summary).toBe("Two things to ask about.");
  });
});
