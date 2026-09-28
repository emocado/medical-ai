import { describe, it, expect, vi } from "vitest";
import { parseMealResponse, analyzeMealWithGemini } from "@/lib/meal-advisor";
import { MEDICAL_DISCLAIMER } from "@/lib/prompts";
import * as geminiModule from "@/lib/gemini";
import type { ReportRecord, PillRecord } from "@/types";

describe("Meal Advisor Logic", () => {
  it("parses valid JSON response into MealRecord", () => {
    const rawJson = JSON.stringify({
      dishes: ["Hainanese Chicken Rice", "Cucumber soup"],
      healthScore: 68,
      advice: "Chicken breast provides lean protein, but avoid drinking all the oily rice broth to keep sodium and saturated fat low for your cholesterol.",
    });

    const result = parseMealResponse(rawJson, "text", { textInput: "Chicken rice" });
    expect(result.id).toBeDefined();
    expect(result.inputType).toBe("text");
    expect(result.textInput).toBe("Chicken rice");
    expect(result.analysis.dishes).toContain("Hainanese Chicken Rice");
    expect(result.analysis.healthScore).toBe(68);
    expect(result.analysis.advice).toContain("lean protein");
    expect(result.analysis.advice).toContain(MEDICAL_DISCLAIMER);
  });

  it("handles markdown code fences in meal AI response", () => {
    const rawMarkdown = "```json\n" + JSON.stringify({
      dishes: ["Roti Canai with Dhal"],
      healthScore: 50,
      advice: "High in refined carbohydrates and ghee.",
    }) + "\n```";

    const result = parseMealResponse(rawMarkdown, "photo", { imageBase64: "img123" });
    expect(result.inputType).toBe("photo");
    expect(result.analysis.dishes[0]).toBe("Roti Canai with Dhal");
    expect(result.analysis.healthScore).toBe(50);
  });

  it("calls Gemini with multimodal photo or text and injects health context", async () => {
    const mockGenerateContent = vi.fn().mockResolvedValue({
      text: JSON.stringify({
        dishes: ["Fish Head Curry"],
        healthScore: 60,
        advice: "The fish is rich in omega-3, but the rich coconut milk gravy should be eaten sparingly due to your cholesterol test.",
      }),
    });

    vi.spyOn(geminiModule, "getGeminiClient").mockReturnValue({
      models: {
        generateContent: mockGenerateContent,
      },
    } as any);

    const report: Partial<ReportRecord> = {
      summary: { en: "High cholesterol noted", bm: "", zh: "", ta: "" },
      keyMarkers: { Cholesterol: { value: 6.0, unit: "mmol/L" } },
    };

    const pills: Partial<PillRecord>[] = [
      {
        analysis: {
          pills: [
            {
              name: "Atorvastatin",
              genericName: "Atorvastatin",
              purpose: "Cholesterol",
              dosage: "20mg",
              sideEffects: [],
              foodInteractions: ["Grapefruit"],
              drugInteractions: [],
            },
          ],
        },
      },
    ];

    const result = await analyzeMealWithGemini({
      inputType: "photo",
      imageBase64: "dGVzdC1tZWFs",
      mimeType: "image/jpeg",
      latestReport: report as ReportRecord,
      knownPills: pills as PillRecord[],
      language: "en",
    });

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(result.analysis.dishes[0]).toBe("Fish Head Curry");
    expect(result.analysis.advice).toContain("omega-3");
  });
});
