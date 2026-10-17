import { describe, it, expect } from "vitest";
import { buildVisitSummary, visitQuestions, visitSummaryText } from "@/lib/visit-summary";
import type { MedicationEntry, ReportRecord } from "@/types";

const report = (id: string, date: string, keyMarkers: ReportRecord["keyMarkers"]): ReportRecord => ({
  id,
  date,
  fileName: `${id}.pdf`,
  fileType: "application/pdf",
  summary: { en: "", bm: "", zh: "", ta: "" },
  keyMarkers,
  createdAt: 1,
});

const med = (name: string, genericName: string, dosage: string, active = true): MedicationEntry => ({
  id: name,
  name,
  genericName,
  analysis: { purpose: "", dosage, sideEffects: [], foodInteractions: [], drugInteractions: [] },
  schedule: ["night"],
  active,
  createdAt: 1,
});

const september = report("sept", "2026-09-10", {
  eGFR: { value: 64, unit: "mL/min/1.73m²", status: "low", referenceRange: "> 90" },
  HbA1c: { value: 7.0, unit: "%", status: "high" },
  Sodium: { value: 140, unit: "mmol/L", status: "normal" },
});
const march = report("march", "2026-03-15", {
  eGFR: { value: 68, unit: "mL/min/1.73m²", status: "low" },
  HbA1c: { value: 7.9, unit: "%", status: "high" },
  Sodium: { value: 139, unit: "mmol/L", status: "normal" },
});
const meds = [
  med("Atorvastatin 20mg", "Atorvastatin", "Take 1 tablet at night"),
  med("Clarithromycin 500mg", "Clarithromycin", ""),
  med("Ibuprofen", "Ibuprofen", "", false),
];

describe("Doctor visit summary", () => {
  const summary = buildVisitSummary([september, march], meds);

  it("collects out-of-range results, computed changes and active medicines only", () => {
    expect(summary.outOfRange.map(([name]) => name)).toEqual(["eGFR", "HbA1c"]);
    expect(summary.changes.map((c) => [c.name, c.change])).toEqual([
      ["eGFR", "worse"],
      ["HbA1c", "better"],
    ]);
    expect(summary.medications.map((m) => m.name)).not.toContain("Ibuprofen");
    expect(summary.interactions).toHaveLength(1);
  });

  it("asks about interactions and worsening results first, without repeating a marker", () => {
    const qs = visitQuestions(summary, "en");
    expect(qs[0]).toBe("I take Clarithromycin 500mg and Atorvastatin 20mg. Is it safe to take them together?");
    expect(qs[1]).toContain("My eGFR changed from 68 mL/min/1.73m² to 64 mL/min/1.73m²");
    expect(qs.filter((q) => q.includes("eGFR"))).toHaveLength(1);
    expect(qs).toContain("My HbA1c is high (7 %). Do I need any change in treatment?");
    expect(qs).toContain("What is the right dose and time for Clarithromycin 500mg?");
    expect(qs.length).toBeLessThanOrEqual(6);
  });

  it("renders a shareable text in the doctor's language", () => {
    const text = visitSummaryText(summary, "bm", "Rasa pening pada waktu pagi");
    expect(text).toContain("Ubat semasa:");
    expect(text).toContain("- Clarithromycin 500mg (Clarithromycin): dos tidak direkod; Malam");
    expect(text).toContain("Perubahan sejak 2026-03-15:");
    expect(text).toContain("Nota saya sendiri:\nRasa pening pada waktu pagi");
  });

  it("handles a brand-new user with nothing recorded", () => {
    const empty = buildVisitSummary([], []);
    expect(visitQuestions(empty, "en")).toEqual([]);
    expect(visitSummaryText(empty, "en")).toContain("No medicines recorded.");
  });
});
