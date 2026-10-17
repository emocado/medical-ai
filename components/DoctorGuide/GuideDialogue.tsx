"use client";

import React, { useEffect } from "react";
import { DrAishaAvatar } from "./DrAishaAvatar";
import { X, Volume2, Sparkles } from "lucide-react";
import type { Language, DrAishaExpression, GuideChoice } from "@/types";
import { translate } from "@/lib/i18n";

interface GuideDialogueProps {
  language: Language;
  expression: DrAishaExpression;
  spokenText: string;
  choices: GuideChoice[];
  isPlayingAudio: boolean;
  onSelectChoice: (choice: GuideChoice) => void;
  onClose: () => void;
}

export function GuideDialogue({
  language,
  expression,
  spokenText,
  choices,
  isPlayingAudio,
  onSelectChoice,
  onClose,
}: GuideDialogueProps) {
  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Dr. Aisha Health Guidance"
      className="fixed inset-0 z-40 flex flex-col justify-end scrim p-3 pb-24 sm:p-6 sm:pb-28 lg:pb-8 lg:pl-[var(--sidebar-width)] overscroll-contain"
      onClick={onClose}
    >
      <div
        className="sheet w-full max-w-xl mx-auto overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Character bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.06]">
          <div className="flex items-center space-x-3">
            <DrAishaAvatar
              size="sm"
              expression={expression}
              isPulsing={isPlayingAudio}
            />
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-lg text-ink">Dr. Aisha</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800">
                  <Sparkles className="w-3 h-3 mr-1 text-teal-600" aria-hidden="true" />
                  {translate(language, "guide.aiBadge")}
                </span>
              </div>
              <p className="text-xs text-ink-tertiary">
                {language === "zh"
                  ? "您的贴心健康伙伴"
                  : language === "bm"
                  ? "Rakan Kesihatan Anda"
                  : language === "ta"
                  ? "உங்கள் நலத் தோழி"
                  : "Personal Health Guide"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {isPlayingAudio && (
              <div className="flex items-center px-2 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold">
                <Volume2 className="w-4 h-4 mr-1 motion-safe:animate-pulse" aria-hidden="true" />
                <span>Speaking</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="press p-2 text-ink-secondary bg-black/[0.05] hover:bg-black/[0.09] hover:text-ink rounded-full min-h-[48px] min-w-[48px] flex items-center justify-center"
              aria-label="Close dialogue"
            >
              <X className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Visual Novel Caption Subtitle Box */}
        <div className="p-4 sm:p-5">
          <div
            role="log"
            aria-live="polite"
            className="well px-5 py-4 text-lg sm:text-xl font-medium leading-relaxed text-ink min-h-[70px] flex items-center"
          >
            <p>"{spokenText}"</p>
          </div>
        </div>

        {/* Interactive Option Chips */}
        {choices.length > 0 && (
          <div className="px-4 pb-4 sm:px-5 sm:pb-5 flex flex-col gap-2.5 max-h-[45vh] overflow-y-auto overscroll-contain">
            <span className="eyebrow px-1">
              {language === "zh"
                ? "您可以选择想了解的内容："
                : language === "bm"
                ? "Pilih topik bantuan:"
                : language === "ta"
                ? "விருப்பத்தைத் தேர்ந்தெடுக்கவும்:"
                : "Choose what you would like help with:"}
            </span>
            <div className="flex flex-col gap-2">
              {choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => onSelectChoice(choice)}
                  className={`press text-left px-4 py-3 min-h-[52px] rounded-2xl font-semibold text-base flex items-center justify-between ${
                    choice.isGlobal
                      ? "bg-amber-50 text-amber-950 hover:bg-amber-100"
                      : "bg-accent-soft text-accent-ink hover:bg-[#dceafa]"
                  }`}
                >
                  <span>{choice.label}</span>
                  <span className="text-sm ml-2 opacity-70" aria-hidden="true">→</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
