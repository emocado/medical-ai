"use client";

import React from "react";
import { Languages, Loader2, RotateCcw } from "lucide-react";
import { useT } from "./LanguageProvider";

interface TranslationStatusProps {
  status: "idle" | "translating" | "error";
  onRetry: () => void;
}

/** Small inline notice shown while saved AI content is translated into the current language. */
export function TranslationStatus({ status, onRetry }: TranslationStatusProps) {
  const t = useT();
  if (status === "idle") return null;

  if (status === "translating") {
    return (
      <div
        role="status"
        className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-accent-soft text-accent-ink text-base font-semibold"
      >
        <Loader2 className="w-5 h-5 animate-spin text-accent" aria-hidden="true" />
        <span>{t("translate.working")}</span>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-2 p-3 pl-4 rounded-2xl bg-amber-50 ring-1 ring-inset ring-amber-300 text-amber-950 text-base"
    >
      <span className="flex items-center gap-2 font-semibold">
        <Languages className="w-5 h-5 text-amber-700" aria-hidden="true" />
        {t("translate.error")}
      </span>
      <button
        onClick={onRetry}
        className="btn !min-h-[48px] !px-5 !text-base bg-amber-700 hover:bg-amber-800 text-white shadow-button"
      >
        <RotateCcw className="w-5 h-5" aria-hidden="true" />
        {t("translate.retry")}
      </button>
    </div>
  );
}
