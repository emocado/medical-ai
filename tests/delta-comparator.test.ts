import { describe, it, expect, vi } from "vitest";
import { parseDeltaResponse, compareReportsWithGemini } from "@/lib/delta-comparator";
import { MEDICAL_DISCLAIMER } from "@/lib/prompts";
import * as geminiModule from "@/lib/gemini";
import type { ReportRecord } from "@/types";

describe("Delta Comparator Logic", () => {
  it("parses valid JSON response into DeltaComparisonResult", () => {
    const rawJson = JSON.stringify({
      progression: "improving",
      summary: "Your fasting blood glucose dropped from 6.8 to 5.4, indicating improved sugar control.",
      markerDeltas: [
        {
          markerName: "Fasting Blood Glucose",
          previousValue: "6.8 mmol/L",
          currentValue: "5.4 mmol/L",
          statusChange: "High to Normal",
          interpretation: "Significant improvement in diabetes control.",
        },
      ],
    });

    const result = parseDeltaResponse(rawJson);
    expect(result.progression).toBe("improving");
    expect(result.summary).toContain("improved sugar control");
    expect(result.summary).toContain(MEDICAL_DISCLAIMER);
    expect(result.markerDeltas.length).toBe(1);
    expect(result.markerDeltas[0].markerName).toBe("Fasting Blood Glucose");
  });

  it("calls Gemini with both reports and returns delta comparison", async () => {
    const mockGenerateContent = vi.fn().mockResolvedValue({
      text: JSON.stringify({
        progression: "stable",
        summary: "Cholesterol levels remained essentially unchanged between visits.",
        markerDeltas: [
          {
            markerName: "Total Cholesterol",
            previousValue: "5.2 mmol/L",
            currentValue: "5.3 mmol/L",
            statusChange: "Normal to Normal",
            interpretation: "Stable.",
          },
        ],
      }),
    });

    vi.spyOn(geminiModule, "getGeminiClient").mockReturnValue({
      models: {
        generateContent: mockGenerateContent,
      },
    } as any);

    const reportA: Partial<ReportRecord> = {
      id: "rep-1",
      date: "2026-06-01",
      fileName: "june-test.pdf",
      summary: { en: "Cholesterol 5.2", bm: "", zh: "", ta: "" },
      keyMarkers: { Cholesterol: { value: 5.2, unit: "mmol/L" } },
    };

    const reportB: Partial<ReportRecord> = {
      id: "rep-2",
      date: "2026-09-01",
      fileName: "sept-test.pdf",
      summary: { en: "Cholesterol 5.3", bm: "", zh: "", ta: "" },
      keyMarkers: { Cholesterol: { value: 5.3, unit: "mmol/L" } },
    };

    const result = await compareReportsWithGemini({
      reportA: reportA as ReportRecord,
      reportB: reportB as ReportRecord,
      language: "en",
    });

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(result.progression).toBe("stable");
    expect(result.summary).toContain("Cholesterol levels remained");
  });
});
