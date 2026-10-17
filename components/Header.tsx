"use client";

import React from "react";
import { HeartPulse } from "lucide-react";
import type { Language } from "@/types";
import { useLanguage, useT } from "@/components/LanguageProvider";

interface HeaderProps {
  title?: string;
}

const LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "bm", label: "BM" },
  { code: "zh", label: "中文" },
  { code: "ta", label: "தமிழ்" },
];

/** Large-title page header on a translucent bar, with the language switcher as a segmented control. */
export function Header({ title = "HealthMate" }: HeaderProps) {
  const { language, setLanguage } = useLanguage();
  const t = useT();

  return (
    <header className="sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10 pt-3 pb-3 lg:pt-8 lg:pb-4 material-canvas shadow-[0_1px_0_rgb(0_0_0/0.06)] print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="lg:hidden flex items-center justify-center w-9 h-9 rounded-[11px] bg-gradient-to-b from-[#ff6b6b] to-[#e5383b] shadow-button flex-shrink-0">
            <HeartPulse className="w-5 h-5 text-white" strokeWidth={2.2} aria-hidden="true" />
          </span>
          <h1 className="text-3xl lg:text-4xl font-bold text-ink truncate">{title}</h1>
        </div>

        <div
          className="flex items-center p-1 rounded-full bg-black/[0.06]"
          role="group"
          aria-label={t("header.languageSelection")}
        >
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              aria-pressed={language === l.code}
              className={`press px-3.5 rounded-full text-base font-semibold flex items-center justify-center ${
                language === l.code
                  ? "bg-white text-ink shadow-[0_1px_3px_rgb(0_0_0/0.12),0_0_0_0.5px_rgb(0_0_0/0.04)]"
                  : "text-ink-secondary hover:text-ink"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
