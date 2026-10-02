"use client";

import React from "react";
import { useT } from "./LanguageProvider";

/** Colour-coded 0–100 meal suitability, or a neutral "not scored" chip. */
export function MealScoreChip({ score }: { score: number | null }) {
  const t = useT();

  if (score === null) {
    return (
      <span className="px-3 py-1.5 rounded-full text-base font-bold bg-slate-100 text-slate-700 border border-slate-300 whitespace-nowrap">
        {t("meal.notScored")}
      </span>
    );
  }

  const tone =
    score >= 70
      ? "bg-emerald-100 text-emerald-950 border-emerald-300"
      : score >= 50
      ? "bg-amber-100 text-amber-950 border-amber-300"
      : "bg-red-100 text-red-950 border-red-300";

  return (
    <span className={`px-3 py-1.5 rounded-full text-base font-black border whitespace-nowrap ${tone}`}>
      {t("meal.score", { score })}
    </span>
  );
}
