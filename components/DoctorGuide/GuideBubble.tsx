"use client";

import React from "react";
import { DrAishaAvatar } from "./DrAishaAvatar";
import { HelpCircle, Sparkles } from "lucide-react";
import type { Language, DrAishaExpression } from "@/types";

interface GuideBubbleProps {
  language: Language;
  expression: DrAishaExpression;
  isPulsing?: boolean;
  isVisible?: boolean;
  onClick: () => void;
}

export function GuideBubble({
  language,
  expression = "neutral",
  isPulsing = false,
  isVisible = true,
  onClick,
}: GuideBubbleProps) {
  if (!isVisible) return null;

  return (
    <aside
      aria-label="Doctor Guide Assistant"
      className="fixed bottom-20 right-4 sm:right-6 z-40 flex items-center select-none print:hidden"
    >
      <button
        onClick={onClick}
        aria-label="Ask Dr. Aisha for help"
        className={`group relative flex items-center justify-center p-1 rounded-full bg-white shadow-xl border-2 border-blue-600 hover:scale-105 active:scale-95 transition-transform min-h-[56px] min-w-[56px] ${
          isPulsing ? "ring-4 ring-emerald-400 ring-opacity-80 animate-bounce" : ""
        }`}
      >
        <DrAishaAvatar
          size="md"
          expression={expression}
          isPulsing={isPulsing}
        />

        {/* Small badge */}
        <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-700 text-white shadow-md border-2 border-white">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        </span>
      </button>
    </aside>
  );
}
