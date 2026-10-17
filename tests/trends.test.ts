import { describe, it, expect } from "vitest";
import { buildTrends, compareMarkers, overallProgression } from "@/lib/trends";
import { mergeDelta } from "@/lib/delta-comparator";
import type { KeyMarker } from "@/types";

const march: Record<string, KeyMarker> = {
  "Fasting Plasma Glucose": { value: 7.8, unit: "mmol/L", status: "high" },
  "Total Cholesterol": { value: 6.2, unit: "mmol/L", status: "high" },
  "HDL-Cholesterol": { value: 1.0, unit: "mmol/L", status: "low" },
  "eGFR (CKD-EPI)": { value: 68, unit: "mL/min/1.73m²", status: "low" },
  Creatinine: { value: 98, unit: "µmol/L", status: "high" },
  Sodium: { value: 139, unit: "mmol/L", status: "normal" },
  "Blood Pressure": { value: "148/92", unit: "mmHg", status: "high" },
};

// Same tests, but named the way a different lab might print them.
const september: Record<string, KeyMarker> = {
  FBS: { value: 6.4, unit: "mmol/L", status: "high" },
  "Cholesterol, Total": { value: 5.1, unit: "mmol/L", status: "normal" },
  "HDL-C": { value: 1.1, unit: "mmol/L", status: "low" },
  eGFR: { value: 64, unit: "mL/min/1.73m²", status: "low" },
  "Serum Creatinine": { value: 102, unit: "µmol/L", status: "high" },
  Sodium: { value: 140, unit: "mmol/L", status: "normal" },
  BP: { value: "136/84", unit: "mmHg", status: "high" },
  "Vitamin D": { value: 20, unit: "ng/mL", status: "low" },
};

describe("Report comparison is computed, not guessed", () => {
  const comparisons = compareMarkers({ keyMarkers: march }, { keyMarkers: september });
  const verdict = Object.fromEntries(comparisons.map((c) => [c.key, c.change]));

  it("matches markers across different lab names and skips unmatched ones", () => {
    expect(comparisons).toHaveLength(7);
    expect(comparisons.find((c) => c.key === "fasting_glucose")?.name).toBe("FBS");
  });

  it("judges each change by its flags and direction", () => {
    expect(verdict.fasting_glucose).toBe("better"); // high and falling
    expect(verdict.total_cholesterol).toBe("better"); // high -> normal
    expect(verdict.hdl).toBe("better"); // low and rising
    expect(verdict.egfr).toBe("worse"); // low and falling
    expect(verdict.creatinine).toBe("worse"); // high and rising
    expect(verdict.sodium).toBe("same"); // normal -> normal
    expect(verdict.blood_pressure).toBe("better"); // systolic 148 -> 136
  });

  it("calls a mix of improvements and declines 'mixed'", () => {
    expect(overallProgression(comparisons)).toBe("mixed");
    expect(overallProgression([])).toBe("stable");
  });

  it("keeps computed numbers and verdicts even if the AI narrative disagrees", () => {
    const merged = mergeDelta(comparisons, {
      progression: "improving",
      summary: "Summary.",
      markerDeltas: [{ markerName: "eGFR", previousValue: "?", currentValue: "?", statusChange: "fine", interpretation: "Kidney filtering dipped a little." }],
    });
    const egfr = merged.markerDeltas.find((d) => d.markerName === "eGFR");
    expect(merged.progression).toBe("mixed");
    expect(egfr).toMatchObject({
      previousValue: "68 mL/min/1.73m²",
      currentValue: "64 mL/min/1.73m²",
      change: "worse",
      interpretation: "Kidney filtering dipped a little.",
    });
  });
});

describe("Marker trends across reports", () => {
  it("builds oldest-first series for markers seen at least twice", () => {
    const trends = buildTrends([
      { date: "2026-09-10", keyMarkers: september },
      { date: "2026-03-15", keyMarkers: march },
    ]);
    const glucose = trends.find((t) => t.key === "fasting_glucose");
    expect(glucose?.points.map((p) => [p.date, p.value])).toEqual([
      ["2026-03-15", 7.8],
      ["2026-09-10", 6.4],
    ]);
    expect(trends.find((t) => t.name === "Vitamin D")).toBeUndefined();
  });

  it("drops points recorded in a different unit from the latest one", () => {
    const trends = buildTrends([
      { date: "2026-01-01", keyMarkers: { Glucose: { value: 140, unit: "mg/dL" } } },
      { date: "2026-03-01", keyMarkers: { Glucose: { value: 7.1, unit: "mmol/L" } } },
      { date: "2026-06-01", keyMarkers: { Glucose: { value: 6.5, unit: "mmol/L" } } },
    ]);
    expect(trends[0].points.map((p) => p.value)).toEqual([7.1, 6.5]);
  });
});
