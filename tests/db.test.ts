import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach } from "vitest";
import {
  initDB,
  saveReport,
  getReport,
  getAllReports,
  savePillRecord,
  getPillRecord,
  getAllPillRecords,
  saveMealRecord,
  getMealRecord,
  getAllMealRecords,
} from "@/lib/db";
import type { ReportRecord, PillRecord, MealRecord } from "@/types";

describe("IndexedDB Storage Layer", () => {
  beforeEach(async () => {
    // Re-init or ensure stores are ready
    await initDB();
  });

  it("saves and retrieves a report record", async () => {
    const report: ReportRecord = {
      id: "report-1",
      date: "2026-09-28",
      fileName: "blood-test.pdf",
      fileType: "application/pdf",
      summary: {
        en: "Blood test shows normal glucose levels.",
        bm: "Ujian darah menunjukkan tahap glukosa normal.",
        zh: "验血显示血糖水平正常。",
        ta: "இரத்தப் பரிசோதனை சாதாரண குளுக்கோஸ் அளவைக் காட்டுகிறது.",
      },
      keyMarkers: {
        glucose: { value: 5.2, unit: "mmol/L", status: "normal" },
      },
      createdAt: Date.now(),
    };

    await saveReport(report);
    const retrieved = await getReport("report-1");

    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe("report-1");
    expect(retrieved?.summary.en).toBe("Blood test shows normal glucose levels.");
    expect(retrieved?.keyMarkers.glucose.value).toBe(5.2);

    const all = await getAllReports();
    expect(all.length).toBeGreaterThanOrEqual(1);
    expect(all.some((r) => r.id === "report-1")).toBe(true);
  });

  it("saves and retrieves a pill record", async () => {
    const pillRec: PillRecord = {
      id: "pill-1",
      date: "2026-09-28",
      analysis: {
        pills: [
          {
            name: "Metformin",
            genericName: "Metformin Hydrochloride",
            purpose: "Controls blood sugar",
            dosage: "500mg twice daily with meals",
            sideEffects: ["Nausea", "Stomach upset"],
            foodInteractions: ["Avoid excess alcohol"],
            drugInteractions: ["Contrast dyes"],
          },
        ],
        crossRefWithReports: "Matches glucose management in blood test.",
      },
      createdAt: Date.now(),
    };

    await savePillRecord(pillRec);
    const retrieved = await getPillRecord("pill-1");

    expect(retrieved).toBeDefined();
    expect(retrieved?.analysis.pills[0].name).toBe("Metformin");

    const all = await getAllPillRecords();
    expect(all.length).toBeGreaterThanOrEqual(1);
  });

  it("saves and retrieves a meal record", async () => {
    const mealRec: MealRecord = {
      id: "meal-1",
      date: "2026-09-28",
      inputType: "text",
      textInput: "Nasi lemak with fried chicken",
      analysis: {
        dishes: ["Nasi Lemak", "Ayam Goreng"],
        advice: "High in saturated fat and sodium. Portion control recommended.",
        healthScore: 55,
      },
      createdAt: Date.now(),
    };

    await saveMealRecord(mealRec);
    const retrieved = await getMealRecord("meal-1");

    expect(retrieved).toBeDefined();
    expect(retrieved?.analysis.healthScore).toBe(55);

    const all = await getAllMealRecords();
    expect(all.length).toBeGreaterThanOrEqual(1);
  });
});
