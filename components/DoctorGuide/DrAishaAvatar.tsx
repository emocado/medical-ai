"use client";

import React from "react";
import type { DrAishaExpression } from "@/types";

interface DrAishaAvatarProps {
  expression?: DrAishaExpression;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  isPulsing?: boolean;
}

export function DrAishaAvatar({
  expression = "neutral",
  size = "md",
  className = "",
  isPulsing = false,
}: DrAishaAvatarProps) {
  const sizeMap = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-28 h-28",
    xl: "w-40 h-40",
  };

  return (
    <div
      role="img"
      aria-label={`Dr. Aisha avatar - ${expression} expression`}
      className={`relative inline-flex items-center justify-center rounded-full bg-gradient-to-b from-blue-100 to-teal-50 border-2 border-blue-600 shadow-md select-none shrink-0 overflow-hidden ${
        sizeMap[size]
      } ${isPulsing ? "ring-4 ring-blue-400 ring-opacity-75 animate-pulse" : ""} ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full transform transition-transform duration-300"
      >
        {/* Soft background aura */}
        <circle cx="50" cy="50" r="48" fill="#E6FFFA" />

        {/* Doctor Lab Coat / Shoulders */}
        <path
          d="M15 95 C 15 72, 35 68, 50 68 C 65 68, 85 72, 85 95 Z"
          fill="#FFFFFF"
          stroke="#0D9488"
          strokeWidth="2.5"
        />

        {/* Inner Medical Scrub Collar (Teal) */}
        <polygon points="40,68 60,68 50,84" fill="#0D9488" />
        <polygon points="43,68 57,68 50,78" fill="#14B8A6" />

        {/* Stethoscope */}
        <path
          d="M 33 68 C 33 80, 42 86, 50 86 C 58 86, 67 80, 67 68"
          stroke="#475569"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="50" cy="88" r="4.5" fill="#334155" stroke="#94A3B8" strokeWidth="1" />

        {/* Neck */}
        <rect x="44" y="52" width="12" height="18" fill="#E2A176" rx="3" />

        {/* Head / Face */}
        <ellipse cx="50" cy="42" rx="20" ry="22" fill="#F0B58D" />

        {/* Hair / Headscarf contour (Friendly modern medical cap/headwear) */}
        <path
          d="M 28 42 C 28 24, 38 18, 50 18 C 62 18, 72 24, 72 42 C 72 45, 71 52, 69 54 C 67 46, 64 30, 50 30 C 36 30, 33 46, 31 54 C 29 52, 28 45, 28 42 Z"
          fill="#1E293B"
        />

        {/* Eyebrows */}
        <path
          d={
            expression === "smiling"
              ? "M 38 33 Q 42 30 46 33"
              : "M 38 34 Q 42 32 46 34"
          }
          stroke="#0F172A"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={
            expression === "smiling"
              ? "M 54 33 Q 58 30 62 33"
              : "M 54 34 Q 58 32 62 34"
          }
          stroke="#0F172A"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Eyes */}
        {expression === "smiling" ? (
          // Happy arc eyes
          <>
            <path
              d="M 38 40 Q 42 36 46 40"
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 54 40 Q 58 36 62 40"
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          </>
        ) : (
          // Open warm eyes
          <>
            <circle cx="42" cy="39" r="2.8" fill="#0F172A" />
            <circle cx="43" cy="38" r="0.9" fill="#FFFFFF" />
            <circle cx="58" cy="39" r="2.8" fill="#0F172A" />
            <circle cx="59" cy="38" r="0.9" fill="#FFFFFF" />
          </>
        )}

        {/* Cheeks blush */}
        <ellipse cx="36" cy="44" rx="3.5" ry="2" fill="#FB7185" opacity="0.5" />
        <ellipse cx="64" cy="44" rx="3.5" ry="2" fill="#FB7185" opacity="0.5" />

        {/* Nose */}
        <path d="M 50 40 L 49 46 L 52 46" stroke="#D97746" strokeWidth="1.5" strokeLinecap="round" />

        {/* Mouth depending on expression */}
        {expression === "speaking" && (
          // Speaking animated mouth (rounded open O)
          <ellipse cx="50" cy="53" rx="4" ry="5" fill="#881337" stroke="#BE123C" strokeWidth="1">
            <animate
              attributeName="ry"
              values="3;6;3"
              dur="0.4s"
              repeatCount="indefinite"
            />
          </ellipse>
        )}

        {expression === "smiling" && (
          // Wide joyful smile with teeth
          <path
            d="M 42 51 Q 50 60 58 51 Z"
            fill="#FFFFFF"
            stroke="#BE123C"
            strokeWidth="1.8"
          />
        )}

        {expression === "neutral" && (
          // Gentle warm closed-lip smile
          <path
            d="M 43 52 Q 50 56 57 52"
            stroke="#BE123C"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Small subtle stethoscope icon badge on collar */}
        <circle cx="75" cy="80" r="7" fill="#0D9488" />
        <path
          d="M 72 80 L 78 80 M 75 77 L 75 83"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>

      {/* Speaking sound waves badge when actively speaking */}
      {expression === "speaking" && (
        <span className="absolute bottom-1 right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
      )}
    </div>
  );
}
