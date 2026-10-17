"use client";

import React, { useState, useEffect } from "react";
import { DrAishaAvatar } from "./DrAishaAvatar";
import { ONBOARDING_STEPS } from "@/lib/guide-scripts";
import { advanceOnboardingStep } from "@/lib/guide-controller";
import { setCompletedOnboarding } from "@/lib/db";
import { playGuideAudio, stopGuideAudio } from "@/lib/guide-audio";
import { Volume2, VolumeX, ArrowRight, Check, X } from "lucide-react";
import type { Language, DrAishaExpression } from "@/types";

interface OnboardingOverlayProps {
  language: Language;
  onComplete: () => void;
}

export function OnboardingOverlay({ language, onComplete }: OnboardingOverlayProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentExpression, setCurrentExpression] = useState<DrAishaExpression>("smiling");

  const currentStep = ONBOARDING_STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === ONBOARDING_STEPS.length - 1;

  const titleText = currentStep.title[language] || currentStep.title.en;
  const speechText = currentStep.speech[language] || currentStep.speech.en;

  useEffect(() => {
    // Set expression for step
    setCurrentExpression(currentStep.expression);

    if (!isMuted) {
      setIsPlayingAudio(true);
      setCurrentExpression("speaking");

      playGuideAudio(
        speechText,
        language,
        () => {
          setIsPlayingAudio(false);
          setCurrentExpression(currentStep.expression);
        },
        () => {
          setIsPlayingAudio(false);
          setCurrentExpression(currentStep.expression);
        }
      );
    }

    return () => {
      stopGuideAudio();
    };
  }, [currentStepIndex, language, isMuted, speechText]);

  async function handleNext() {
    stopGuideAudio();
    const result = advanceOnboardingStep(currentStepIndex, ONBOARDING_STEPS.length);

    if (result.isComplete) {
      await handleFinish();
    } else {
      setCurrentStepIndex(result.nextStep);
    }
  }

  async function handleFinish() {
    stopGuideAudio();
    try {
      await setCompletedOnboarding(true);
    } catch (e) {
      console.error("Failed saving onboarding state to DB:", e);
    }
    onComplete();
  }

  function toggleMute() {
    if (!isMuted) {
      stopGuideAudio();
      setIsPlayingAudio(false);
      setCurrentExpression(currentStep.expression);
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome walkthrough with Dr. Aisha"
      className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center scrim p-3 sm:p-6 overflow-y-auto overscroll-contain"
    >
      <div className="sheet relative w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header bar with step indicators & mute / skip controls */}
        <div className="flex items-center justify-between pl-6 pr-3 pt-3 pb-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-ink-tertiary tabular">
              {language === "zh"
                ? `步骤 ${currentStepIndex + 1} / 4`
                : language === "bm"
                ? `Langkah ${currentStepIndex + 1} / 4`
                : language === "ta"
                ? `படி ${currentStepIndex + 1} / 4`
                : `Step ${currentStepIndex + 1} of 4`}
            </span>
            <div className="flex space-x-1.5 ml-2" aria-hidden="true">
              {ONBOARDING_STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-[width,background-color] duration-300 ease-fluid ${
                    idx === currentStepIndex
                      ? "w-6 bg-accent"
                      : idx < currentStepIndex
                      ? "w-2 bg-accent/40"
                      : "w-2 bg-black/10"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={toggleMute}
              className="press p-2 text-ink-secondary min-h-[48px] min-w-[48px] flex items-center justify-center rounded-full hover:bg-black/5"
              aria-label={isMuted ? "Unmute voice" : "Mute voice"}
            >
              {isMuted ? (
                <VolumeX className="w-6 h-6 text-ink-tertiary" />
              ) : (
                <Volume2 className={`w-6 h-6 ${isPlayingAudio ? "text-emerald-600 motion-safe:animate-pulse" : "text-accent"}`} />
              )}
            </button>
            <button
              onClick={handleFinish}
              className="press px-3 py-1.5 text-sm font-semibold text-ink-tertiary hover:text-ink min-h-[48px] flex items-center justify-center rounded-full hover:bg-black/5"
              aria-label="Skip walkthrough"
            >
              <span className="mr-1">{language === "zh" ? "跳过" : language === "bm" ? "Langkau" : language === "ta" ? "தவிர்" : "Skip"}</span>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Character Portrait & Stage */}
        <div className="flex flex-col items-center pt-2 pb-2 px-6">
          <DrAishaAvatar
            size="xl"
            expression={currentExpression}
            isPulsing={isPlayingAudio}
            className="shadow-float mb-4"
          />

          <h2 className="text-xl sm:text-2xl font-bold text-ink text-center">
            {titleText}
          </h2>
        </div>

        {/* Visual Novel Text Box (Subtitles) */}
        <div className="px-6 py-4">
          <div
            role="log"
            aria-live="polite"
            className="well p-5 text-lg sm:text-xl leading-relaxed min-h-[120px] flex items-center"
          >
            <p className="font-medium text-ink">
              "{speechText}"
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="px-6 pt-2 pb-6 flex items-center justify-between gap-3">
          <button
            onClick={handleFinish}
            className="btn btn-secondary text-base min-h-[56px]"
          >
            {language === "zh" ? "稍后再说" : language === "bm" ? "Tutup" : language === "ta" ? "மூடு" : "Close"}
          </button>

          <button
            onClick={handleNext}
            className="btn btn-primary flex-1 min-h-[56px]"
          >
            <span>
              {isLastStep
                ? language === "zh"
                  ? "开始使用"
                  : language === "bm"
                  ? "Mula Sekarang"
                  : language === "ta"
                  ? "தொடங்கவும்"
                  : "Get Started"
                : language === "zh"
                ? "下一步"
                : language === "bm"
                ? "Seterusnya"
                : language === "ta"
                ? "அடுத்தது"
                : "Next"}
            </span>
            {isLastStep ? <Check className="w-6 h-6 ml-1" /> : <ArrowRight className="w-6 h-6 ml-1" />}
          </button>
        </div>
      </div>
    </div>
  );
}
