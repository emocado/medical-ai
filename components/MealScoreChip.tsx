"use client";

import React from "react";
import { useT } from "./LanguageProvider";

/** Colour-coded 0–100 meal suitability, or a neutral "not scored" chip. */
export function MealScoreChip({ score }: { score: number | null }) {
  const t = useT();

  if (score === null) {
    return (
      <span className="chip whitespace-nowrap bg-black/[0.06] text-ink-secondary">
        {t("meal.notScored")}
      </span>
    );
  }

  const tone =
    score >= 70
      ? "bg-emerald-100 text-emerald-950 ring-emerald-300"
      : score >= 50
      ? "bg-amber-100 text-amber-950 ring-amber-300"
      : "bg-red-100 text-red-950 ring-red-300";

  return (
    <span className={`chip tabular font-bold whitespace-nowrap ring-1 ring-inset ${tone}`}>
      {t("meal.score", { score })}
    </span>
  );
}
