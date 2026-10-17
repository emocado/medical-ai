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
      className="fixed inset-0 z-40 flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm p-3 pb-24 sm:p-6 sm:pb-28"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl mx-auto bg-white rounded-3xl shadow-2xl border-2 border-blue-900 overflow-hidden flex flex-col transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Character bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-900 via-blue-800 to-teal-900 text-white">
          <div className="flex items-center space-x-3">
            <DrAishaAvatar
              size="sm"
              expression={expression}
              isPulsing={isPlayingAudio}
            />
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-lg text-white">Dr. Aisha</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-200 border border-teal-400/30">
                  <Sparkles className="w-3 h-3 mr-1 text-teal-300" />
                  {translate(language, "guide.aiBadge")}
                </span>
              </div>
              <p className="text-xs text-blue-200">
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
              <div className="flex items-center px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                <Volume2 className="w-4 h-4 mr-1 animate-pulse" />
                <span>Speaking</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full min-h-[48px] min-w-[48px] flex items-center justify-center transition-colors"
              aria-label="Close dialogue"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Visual Novel Caption Subtitle Box */}
        <div className="p-4 sm:p-5 bg-slate-950 text-white border-y border-blue-950">
          <div
            role="log"
            aria-live="polite"
            className="text-lg sm:text-xl font-medium leading-relaxed text-slate-100 min-h-[70px] flex items-center"
          >
            <p>"{spokenText}"</p>
          </div>
        </div>

        {/* Interactive Option Chips */}
        {choices.length > 0 && (
          <div className="p-4 bg-slate-50 flex flex-col gap-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
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
                  className={`text-left px-4 py-3 min-h-[48px] rounded-xl font-semibold text-base transition-all flex items-center justify-between border ${
                    choice.isGlobal
                      ? "bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100"
                      : "bg-white text-blue-950 border-blue-200 hover:border-blue-400 hover:bg-blue-50/60 shadow-sm"
                  }`}
                >
                  <span>{choice.label}</span>
                  <span className="text-blue-500 text-sm ml-2">→</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
