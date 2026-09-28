"use client";

import React from "react";
import { HeartPulse } from "lucide-react";
import type { Language } from "@/types";

interface HeaderProps {
  currentLang?: Language;
  onLanguageChange?: (lang: Language) => void;
  title?: string;
}

export function Header({
  currentLang = "en",
  onLanguageChange,
  title = "HealthMate",
}: HeaderProps) {
  const languages: { code: Language; label: string }[] = [
    { code: "en", label: "EN" },
    { code: "bm", label: "BM" },
    { code: "zh", label: "中文" },
    { code: "ta", label: "தமிழ்" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-blue-900 text-white shadow-md">
      <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <HeartPulse className="w-8 h-8 text-red-300" aria-hidden="true" />
          <h1 className="text-xl font-bold tracking-tight text-white">{title}</h1>
        </div>

        {onLanguageChange && (
          <div className="flex items-center space-x-1" role="group" aria-label="Language selection">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => onLanguageChange(l.code)}
                aria-pressed={currentLang === l.code}
                className={`px-3 py-1.5 rounded-lg text-base font-bold min-h-[48px] min-w-[48px] flex items-center justify-center transition-colors ${
                  currentLang === l.code
                    ? "bg-white text-blue-950 shadow"
                    : "bg-blue-800 text-white hover:bg-blue-700"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
