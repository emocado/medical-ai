import "fake-indexeddb/auto";
import { describe, it, expect } from "vitest";
import {
  initDB,
  saveReport,
  savePillRecord,
  saveMealRecord,
  getAllReports,
  getAllPillRecords,
  getAllMealRecords,
} from "@/lib/db";
import { formatChatPrompt } from "@/lib/chat";
import { buildLiveSessionConfig } from "@/lib/voice-session";
import { buildHealthMatePrompt, MEDICAL_DISCLAIMER } from "@/lib/prompts";
import { parseDeltaResponse } from "@/lib/delta-comparator";
import { parseMealResponse } from "@/lib/meal-advisor";
import { parsePillResponse } from "@/lib/pill-analyzer";
import { parseReportResponse } from "@/lib/report-analyzer";
import tailwindConfig from "@/tailwind.config";

describe("Accessibility & Cross-Feature Integration Audit", () => {
  describe("Accessibility Design Tokens", () => {
    it("enforces elderly-safe base font sizes (sm >= 1.125rem / 18px)", () => {
      const extend = tailwindConfig.theme?.extend;
      const fontSize = extend?.fontSize as Record<string, [string, any]>;
      expect(fontSize).toBeDefined();

      // Check sm is 1.125rem (18px)
      expect(fontSize.sm[0]).toBe("1.125rem");
      // Check base is 1.25rem (20px)
      expect(fontSize.base[0]).toBe("1.25rem");

      // Check tap targets are >= 48px
      const minHeight = extend?.minHeight as Record<string, string>;
      expect(minHeight?.tap).toBe("48px");
    });
  });

  describe("Cross-Feature Context Propagation", () => {
    it("persists report, pill, and meal records and propagates context across all features", async () => {
      await initDB();

      // 1. User uploads a report
      const testReport = parseReportResponse(
        JSON.stringify({
          date: "2026-09-01",
          summary: {
            en: "HbA1c is 7.2%, indicating elevated diabetic levels.",
            bm: "HbA1c ialah 7.2%, menunjukkan tahap diabetes yang tinggi.",
            zh: "HbA1c为7.2%，表明糖尿病水平偏高。",
            ta: "HbA1c 7.2% ஆக உள்ளது.",
          },
          keyMarkers: [{ name: "HbA1c", value: "7.2", unit: "%", status: "high" }],
        }),
        "diabetes-check.pdf",
        "application/pdf"
      );
      await saveReport(testReport);

      // 2. User photographs pills
      const testPill = parsePillResponse(
        JSON.stringify({
          pills: [
            {
              name: "Metformin",
              genericName: "Metformin HCl",
              purpose: "Blood glucose management",
              dosage: "500mg BID",
              sideEffects: ["Nausea"],
              foodInteractions: ["Alcohol"],
              drugInteractions: [],
            },
          ],
          crossRefWithReports: "Prescribed to control the 7.2% HbA1c from your diabetes check.",
        })
      );
      await savePillRecord(testPill);

      // 3. User logs a meal
      const testMeal = parseMealResponse(
        JSON.stringify({
          dishes: ["Curry Laksa"],
          healthScore: 45,
          advice: "The rich coconut curry gravy has excess saturated fat and sodium.",
        }),
        "text",
        { textInput: "Curry Laksa" }
      );
      await saveMealRecord(testMeal);

      // Verify all 3 stores are loaded
      const allReports = await getAllReports();
      const allPills = await getAllPillRecords();
      const allMeals = await getAllMealRecords();

      expect(allReports.length).toBeGreaterThanOrEqual(1);
      expect(allPills.length).toBeGreaterThanOrEqual(1);
      expect(allMeals.length).toBeGreaterThanOrEqual(1);

      const latestReport = allReports[0];

      // 4. Test Text Chat Assistant Context Injection
      const chatPrompt = formatChatPrompt({
        language: "en",
        latestReport,
        knownPills: allPills,
      });
      expect(chatPrompt).toContain("elevated diabetic levels");
      expect(chatPrompt).toContain("Metformin");
      expect(chatPrompt).toContain(MEDICAL_DISCLAIMER);

      // 5. Test Voice Chat Session Context Injection
      const voiceConfig = buildLiveSessionConfig({
        language: "en",
        latestReport,
        knownPills: allPills,
      });
      expect(voiceConfig.systemPrompt).toContain("elevated diabetic levels");
      expect(voiceConfig.systemPrompt).toContain("Metformin");
      expect(voiceConfig.systemPrompt).toContain(MEDICAL_DISCLAIMER);

      // 6. Test Meal Advisor Context Injection
      const mealPrompt = buildHealthMatePrompt({
        language: "en",
        latestReport,
        knownPills: allPills,
      });
      expect(mealPrompt).toContain("HbA1c is 7.2%");
      expect(mealPrompt).toContain("Metformin");
      expect(mealPrompt).toContain(MEDICAL_DISCLAIMER);

      // 7. Test Report Delta Comparison Parsing
      const deltaResult = parseDeltaResponse(
        JSON.stringify({
          progression: "improving",
          summary: "Your HbA1c decreased towards target range.",
          markerDeltas: [
            {
              markerName: "HbA1c",
              previousValue: "7.8%",
              currentValue: "7.2%",
              statusChange: "High to Improved",
              interpretation: "Good response to Metformin treatment.",
            },
          ],
        })
      );
      expect(deltaResult.progression).toBe("improving");
      expect(deltaResult.summary).toContain(MEDICAL_DISCLAIMER);
    });
  });

  describe("Medical Disclaimer Everywhere", () => {
    it("ensures disclaimer is present in every parser and prompt builder", () => {
      const report = parseReportResponse(
        JSON.stringify({ summary: { en: "Test" } }),
        "t.png",
        "image/png"
      );
      expect(report.summary.en).toContain(MEDICAL_DISCLAIMER);

      const meal = parseMealResponse(
        JSON.stringify({ dishes: ["Porridge"], advice: "Gentle on stomach." }),
        "text"
      );
      expect(meal.analysis.advice).toContain(MEDICAL_DISCLAIMER);

      const delta = parseDeltaResponse(
        JSON.stringify({ progression: "stable", summary: "Stable check." })
      );
      expect(delta.summary).toContain(MEDICAL_DISCLAIMER);

      const sysPrompt = buildHealthMatePrompt();
      expect(sysPrompt).toContain(MEDICAL_DISCLAIMER);
    });
  });
});
