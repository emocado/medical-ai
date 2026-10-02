import { describe, it, expect } from "vitest";
import { STRINGS, translate, type StringKey } from "@/lib/i18n";

const LANGS = ["en", "bm", "zh", "ta"] as const;
const placeholders = (s: string) => (s.match(/\{\w+\}/g) || []).sort().join(",");

describe("Interface translations", () => {
  it("defines every string in all four languages with matching placeholders", () => {
    for (const [key, entry] of Object.entries(STRINGS)) {
      for (const lang of LANGS) {
        const text = (entry as Record<string, string>)[lang];
        expect(text, `${key}.${lang}`).toBeTruthy();
        expect(placeholders(text), `${key}.${lang} placeholders`).toBe(placeholders(entry.en));
      }
    }
  });

  it("fills placeholders and falls back to English", () => {
    expect(translate("zh", "meal.score", { score: 80 })).toBe("评分：80/100");
    expect(translate("en", "timeline.selectedCount", { count: 1 })).toBe(
      "1 of 2 reports selected for comparison"
    );
    expect(translate("ta", "status.high" as StringKey)).toBe("அதிகம்");
  });
});
