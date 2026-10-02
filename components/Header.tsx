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

export function Header({ title = "HealthMate" }: HeaderProps) {
  const { language, setLanguage } = useLanguage();
  const t = useT();

  return (
    <header className="sticky top-0 z-40 bg-blue-900 text-white shadow-md">
      <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <HeartPulse className="w-8 h-8 text-red-300" aria-hidden="true" />
          <h1 className="text-xl font-bold tracking-tight text-white">{title}</h1>
        </div>

        <div className="flex items-center space-x-1" role="group" aria-label={t("header.languageSelection")}>
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              aria-pressed={language === l.code}
              className={`px-3 py-1.5 rounded-lg text-base font-bold min-h-[48px] min-w-[48px] flex items-center justify-center transition-colors ${
                language === l.code
                  ? "bg-white text-blue-950 shadow"
                  : "bg-blue-800 text-white hover:bg-blue-700"
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
