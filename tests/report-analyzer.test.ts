import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseReportResponse, normalizeMarkerStatus, analyzeReportWithGemini } from "@/lib/report-analyzer";
import { MEDICAL_DISCLAIMER } from "@/lib/prompts";
import * as geminiModule from "@/lib/gemini";

describe("Report Analyzer Logic", () => {
  it("parses valid JSON response into report structure with 4 languages", () => {
    const rawJson = JSON.stringify({
      date: "2026-09-15",
      summary: {
        en: "Your blood test is generally good with slightly elevated cholesterol.",
        bm: "Ujian darah anda secara amnya baik dengan sedikit peningkatan kolesterol.",
        zh: "您的验血结果总体良好，胆固醇略有偏高。",
        ta: "உங்கள் இரத்தப் பரிசோதனை கொழுப்பின் சிறிய அதிகரிப்புடன் பொதுவாக நன்றாக உள்ளது.",
      },
      keyMarkers: [
        { name: "Total Cholesterol", value: "5.8", unit: "mmol/L", status: "high" },
        { name: "Fasting Glucose", value: "5.1", unit: "mmol/L", status: "normal" },
      ],
    });

    const parsed = parseReportResponse(rawJson, "blood-test.pdf", "application/pdf");

    expect(parsed.fileName).toBe("blood-test.pdf");
    expect(parsed.fileType).toBe("application/pdf");
    expect(parsed.date).toBe("2026-09-15");
    expect(parsed.summary.en).toContain("elevated cholesterol");
    expect(parsed.summary.bm).toContain("kolesterol");
    expect(parsed.summary.zh).toContain("胆固醇");
    expect(parsed.summary.ta).toContain("இரத்தப் பரிசோதனை");
    // Disclaimer check
    expect(parsed.summary.en).toContain(MEDICAL_DISCLAIMER);
    expect(parsed.keyMarkers["Total Cholesterol"]).toEqual({
      value: "5.8",
      unit: "mmol/L",
      status: "high",
    });
    expect(parsed.keyMarkers["Fasting Glucose"]).toEqual({
      value: "5.1",
      unit: "mmol/L",
      status: "normal",
    });
  });

  it("handles markdown code fencing around JSON string", () => {
    const rawMarkdown = "```json\n" + JSON.stringify({
      summary: {
        en: "Normal scan report.",
        bm: "Laporan imbasan normal.",
        zh: "正常扫描报告。",
        ta: "சாதாரண ஸ்கேன் அறிக்கை.",
      },
      keyMarkers: [],
    }) + "\n```";

    const parsed = parseReportResponse(rawMarkdown, "xray.png", "image/png");
    expect(parsed.summary.en).toContain("Normal scan report.");
    expect(parsed.summary.en).toContain(MEDICAL_DISCLAIMER);
  });

  it("calls Gemini with inlineData and produces a complete ReportRecord", async () => {
    const mockGenerateContent = vi.fn().mockResolvedValue({
      text: JSON.stringify({
        date: "2026-09-20",
        summary: {
          en: "All organs normal.",
          bm: "Semua organ normal.",
          zh: "所有器官正常。",
          ta: "அனைத்து உறுப்புகளும் சாதாரணமாக உள்ளன.",
        },
        keyMarkers: [{ name: "BP", value: "120/80", unit: "mmHg", status: "normal" }],
      }),
    });

    vi.spyOn(geminiModule, "getGeminiClient").mockReturnValue({
      models: {
        generateContent: mockGenerateContent,
      },
    } as any);

    const result = await analyzeReportWithGemini({
      fileBase64: "dGVzdC1kYXRh",
      mimeType: "image/jpeg",
      fileName: "ultrasound.jpg",
    });

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(result.fileName).toBe("ultrasound.jpg");
    expect(result.summary.en).toContain("All organs normal.");
    expect(result.keyMarkers["BP"].value).toBe("120/80");
  });
});

describe("Marker status safety", () => {
  it("never defaults a missing or unrecognised status to normal", () => {
    const report = parseReportResponse(
      JSON.stringify({
        summary: { en: "x" },
        keyMarkers: [
          { name: "Vitamin D", value: "18", unit: "ng/mL" },
          { name: "Ferritin", value: "40", status: "Borderline" },
          { name: "Potassium", value: "6.4", status: "CRITICAL", referenceRange: "3.5 - 5.1" },
        ],
      }),
      "r.png",
      "image/png"
    );
    expect(report.keyMarkers["Vitamin D"].status).toBe("unknown");
    expect(report.keyMarkers["Ferritin"].status).toBe("unknown");
    expect(report.keyMarkers["Potassium"].status).toBe("critical");
    expect(report.keyMarkers["Potassium"].referenceRange).toBe("3.5 - 5.1");
  });

  it("normalizes status casing and whitespace", () => {
    expect(normalizeMarkerStatus(" High ")).toBe("high");
    expect(normalizeMarkerStatus(undefined)).toBe("unknown");
  });
});
