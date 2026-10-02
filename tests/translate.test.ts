import { describe, it, expect } from "vitest";
import { mergeTranslatedStrings } from "@/lib/translate";
import { localizedAnalysis } from "@/components/useAutoTranslate";

describe("Translating saved AI content", () => {
  it("takes translated strings but keeps the original shape, numbers and array lengths", () => {
    const original = { dishes: ["Nasi lemak", "Teh tarik"], advice: "Less sambal.", healthScore: 55 };
    const translated = { dishes: ["椰浆饭"], advice: "少吃参巴酱。", healthScore: "fifty", extra: "x" };

    expect(mergeTranslatedStrings(original, translated)).toEqual({
      dishes: ["椰浆饭", "Teh tarik"],
      advice: "少吃参巴酱。",
      healthScore: 55,
    });
  });

  it("falls back to the original when the translation is malformed", () => {
    const original = [{ name: "Metformin", sideEffects: ["Nausea"] }];
    expect(mergeTranslatedStrings(original, "not json")).toEqual(original);
    expect(mergeTranslatedStrings(original, [{ name: "", sideEffects: null }])).toEqual(original);
  });

  it("picks the cached translation for the current language", () => {
    const record = {
      id: "1",
      language: "en" as const,
      analysis: { advice: "Eat less rice." },
      translations: { bm: { advice: "Kurangkan nasi." } },
    };
    expect(localizedAnalysis(record, "en")).toEqual({ advice: "Eat less rice." });
    expect(localizedAnalysis(record, "bm")).toEqual({ advice: "Kurangkan nasi." });
    expect(localizedAnalysis(record, "zh")).toBeNull();
    // Older records with no language are treated as English.
    expect(localizedAnalysis({ id: "2", analysis: { advice: "x" } }, "en")).toEqual({ advice: "x" });
  });
});
