import { describe, it, expect, vi } from "vitest";
import { parsePillResponse, analyzePillImage } from "@/lib/pill-analyzer";
import { MEDICAL_DISCLAIMER } from "@/lib/prompts";
import * as geminiModule from "@/lib/gemini";

describe("Pill Analyzer Logic", () => {
  it("parses valid JSON response into PillRecord matching required shape", () => {
    const rawJson = JSON.stringify({
      pills: [
        {
          name: "Lipitor",
          genericName: "Atorvastatin",
          purpose: "Lowers bad cholesterol and protects heart",
          dosage: "20mg once daily at bedtime",
          sideEffects: ["Mild muscle aches", "Digestive upset"],
          foodInteractions: ["Grapefruit or grapefruit juice"],
          drugInteractions: ["Certain antifungals", "Clarithromycin"],
        },
      ],
      crossRefWithReports: "Matches the high cholesterol noted in your recent blood test.",
    });

    const record = parsePillResponse(rawJson, "mock-base64-data");

    expect(record.id).toBeDefined();
    expect(record.imageBase64).toBe("mock-base64-data");
    expect(record.analysis.pills.length).toBe(1);
    const pill = record.analysis.pills[0];
    expect(pill.name).toBe("Lipitor");
    expect(pill.genericName).toBe("Atorvastatin");
    expect(pill.dosage).toBe("20mg once daily at bedtime");
    expect(pill.sideEffects).toContain("Mild muscle aches");
    expect(pill.foodInteractions).toContain("Grapefruit or grapefruit juice");
    expect(record.analysis.crossRefWithReports).toContain("high cholesterol");
  });

  it("handles markdown code blocks and defaults gracefully", () => {
    const rawMarkdown = "```json\n" + JSON.stringify({
      pills: [
        {
          name: "Panadol",
          genericName: "Paracetamol",
          purpose: "Pain and fever relief",
          dosage: "500mg-1000mg as needed",
          sideEffects: [],
          foodInteractions: [],
          drugInteractions: [],
        },
      ],
    }) + "\n```";

    const record = parsePillResponse(rawMarkdown);
    expect(record.analysis.pills[0].name).toBe("Panadol");
    expect(record.analysis.pills[0].sideEffects).toEqual([]);
  });

  it("calls Gemini with image data and health context", async () => {
    const mockGenerateContent = vi.fn().mockResolvedValue({
      text: JSON.stringify({
        pills: [
          {
            name: "Metformin",
            genericName: "Metformin Hydrochloride",
            purpose: "Controls blood sugar",
            dosage: "500mg with breakfast and dinner",
            sideEffects: ["Nausea"],
            foodInteractions: [],
            drugInteractions: [],
          },
        ],
        crossRefWithReports: "Matches your fasting glucose report.",
      }),
    });

    vi.spyOn(geminiModule, "getGeminiClient").mockReturnValue({
      models: {
        generateContent: mockGenerateContent,
      },
    } as any);

    const result = await analyzePillImage({
      imageBase64: "dGVzdC1waWxs",
      mimeType: "image/jpeg",
      latestReport: {
        id: "rep-1",
        date: "2026-09-20",
        fileName: "test.pdf",
        fileType: "application/pdf",
        summary: { en: "High blood glucose", bm: "", zh: "", ta: "" },
        keyMarkers: {},
        createdAt: Date.now(),
      },
    });

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(result.analysis.pills[0].name).toBe("Metformin");
    expect(result.analysis.crossRefWithReports).toContain("fasting glucose");
  });
});

describe("Pill dosage comes only from the label", () => {
  it("drops any dose when the model says none was visible", () => {
    const record = parsePillResponse(
      JSON.stringify({
        pills: [{ name: "Amlodipine", dosage: "5mg once daily", dosageSource: "not-visible", confidence: "low" }],
      })
    );
    expect(record.analysis.pills[0].dosage).toBe("");
    expect(record.analysis.pills[0].dosageSource).toBe("not-visible");
    expect(record.analysis.pills[0].confidence).toBe("low");
  });

  it("keeps label text and defaults unknown confidence to low", () => {
    const record = parsePillResponse(
      JSON.stringify({ pills: [{ name: "Metformin", dosage: "Take 1 tablet twice daily", dosageSource: "label" }] }),
      undefined,
      "bm"
    );
    expect(record.analysis.pills[0]).toMatchObject({ dosage: "Take 1 tablet twice daily", dosageSource: "label", confidence: "low" });
    expect(record.language).toBe("bm");
  });

  it("treats an empty dose as not visible", () => {
    const record = parsePillResponse(JSON.stringify({ pills: [{ name: "X", dosage: "" }] }));
    expect(record.analysis.pills[0].dosageSource).toBe("not-visible");
  });
});
