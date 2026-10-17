"use client";

import React, { useState, useRef } from "react";
import {
  Utensils,
  Camera,
  Type,
  Loader2,
  AlertCircle,
  X,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { MedicalDisclaimer } from "./Disclaimer";
import { useT } from "./LanguageProvider";
import { saveMealRecord } from "@/lib/db";
import { errorMessageKey, fileToBase64, postJson } from "@/lib/api-client";
import { loadSampleFile, SAMPLE_MEAL_TEXTS, type SampleFile } from "@/lib/samples";
import { SampleChips } from "./SampleChips";
import { MealScoreChip } from "./MealScoreChip";
import type { Language, MealRecord, MedicationEntry, PillRecord, ReportRecord } from "@/types";

interface MealAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  latestReport?: ReportRecord | null;
  knownPills?: PillRecord[] | null;
  medications?: MedicationEntry[] | null;
  onMealSaved: (record: MealRecord) => void;
}

export function MealAdvisorModal({
  isOpen,
  onClose,
  language,
  latestReport,
  knownPills,
  medications,
  onMealSaved,
}: MealAdvisorModalProps) {
  const t = useT();
  const [inputType, setInputType] = useState<"photo" | "text">("photo");
  const [textInput, setTextInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<MealRecord | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  async function analyze(input: Record<string, unknown>): Promise<boolean> {
    setErrorMessage(null);
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const mealRecord = await postJson<MealRecord>("/api/meals/analyze", {
        ...input,
        latestReport,
        knownPills,
        medications,
        language,
      });
      await saveMealRecord(mealRecord);
      setAnalysisResult(mealRecord);
      onMealSaved(mealRecord);
      return true;
    } catch (err) {
      console.error("Meal analysis failed:", err);
      setErrorMessage(t(errorMessageKey(err, "meal.error")));
      return false;
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    await analyze({
      inputType: "photo",
      imageBase64: await fileToBase64(file),
      mimeType: file.type || "image/jpeg",
    });
  }

  async function handleSamplePhoto(sample: SampleFile) {
    try {
      const file = await loadSampleFile(sample);
      await analyze({ inputType: "photo", imageBase64: await fileToBase64(file), mimeType: file.type });
    } catch {
      setErrorMessage(t("samples.loadError"));
    }
  }

  async function handleTextSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = textInput.trim();
    if (!trimmed || isAnalyzing) return;

    if (await analyze({ inputType: "text", textInput: trimmed })) {
      setTextInput("");
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="meal-modal-title"
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center scrim p-0 sm:p-6 overflow-y-auto overscroll-contain lg:pl-[calc(var(--sidebar-width)+1.5rem)]"
    >
      <div className="sheet rounded-b-none sm:rounded-[28px] max-w-lg w-full p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-6 space-y-5 max-h-[92vh] overflow-y-auto">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-[14px] bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Utensils className="w-6 h-6 text-amber-700" aria-hidden="true" />
            </span>
            <h3 id="meal-modal-title" className="text-xl font-bold text-ink">
              {t("meal.title")}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label={t("common.close")}
            className="press p-2 rounded-full bg-black/[0.06] text-ink-secondary hover:bg-black/[0.09] min-h-[48px] min-w-[48px] flex items-center justify-center"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        {latestReport && (
          <div className="flex items-center gap-2 text-sm font-semibold bg-accent-soft text-accent-ink px-4 py-2 rounded-2xl">
            <Sparkles className="w-4 h-4 text-accent flex-shrink-0" aria-hidden="true" />
            <span>{t("meal.personalized")}</span>
          </div>
        )}

        {/* Input Mode Toggle */}
        <div className="flex rounded-full bg-black/[0.06] p-1" role="tablist">
          <button
            role="tab"
            aria-selected={inputType === "photo"}
            onClick={() => setInputType("photo")}
            className={`press flex-1 py-2.5 rounded-full text-base font-semibold min-h-[48px] flex items-center justify-center gap-2 ${
              inputType === "photo"
                ? "bg-white text-ink shadow-[0_1px_3px_rgb(0_0_0/0.12),0_0_0_0.5px_rgb(0_0_0/0.04)]"
                : "text-ink-secondary hover:text-ink"
            }`}
          >
            <Camera className="w-5 h-5" aria-hidden="true" />
            <span>{t("meal.photoTab")}</span>
          </button>
          <button
            role="tab"
            aria-selected={inputType === "text"}
            onClick={() => setInputType("text")}
            className={`press flex-1 py-2.5 rounded-full text-base font-semibold min-h-[48px] flex items-center justify-center gap-2 ${
              inputType === "text"
                ? "bg-white text-ink shadow-[0_1px_3px_rgb(0_0_0/0.12),0_0_0_0.5px_rgb(0_0_0/0.04)]"
                : "text-ink-secondary hover:text-ink"
            }`}
          >
            <Type className="w-5 h-5" aria-hidden="true" />
            <span>{t("meal.textTab")}</span>
          </button>
        </div>

        {/* Photo Input Area */}
        {inputType === "photo" && (
          <div className="space-y-4">
            <p className="text-base text-ink-secondary">{t("meal.photoDesc")}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoSelect}
              className="hidden"
              id="meal-photo-input"
              disabled={isAnalyzing}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
              className="btn btn-primary w-full min-h-[56px]"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" aria-hidden="true" />
                  <span>{t("meal.analyzingPhoto")}</span>
                </>
              ) : (
                <>
                  <Camera className="w-6 h-6" aria-hidden="true" />
                  <span>{t("meal.photoButton")}</span>
                </>
              )}
            </button>
            <SampleChips kind="meal" onPick={handleSamplePhoto} disabled={isAnalyzing} />
          </div>
        )}

        {/* Text Input Area */}
        {inputType === "text" && (
          <form onSubmit={handleTextSubmit} className="space-y-4">
            <p className="text-base text-ink-secondary">{t("meal.textDesc")}</p>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={t("meal.textPlaceholder")}
              disabled={isAnalyzing}
              rows={3}
              className="field p-4"
            />
            <div className="flex flex-wrap gap-2">
              {SAMPLE_MEAL_TEXTS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTextInput(t(key))}
                  disabled={isAnalyzing}
                  className="press px-4 py-2 rounded-2xl min-h-[48px] text-base font-semibold bg-violet-50 text-violet-950 ring-1 ring-inset ring-violet-200 hover:bg-violet-100 text-left disabled:opacity-50"
                >
                  {t(key)}
                </button>
              ))}
            </div>
            <button
              type="submit"
              disabled={isAnalyzing || !textInput.trim()}
              className="btn btn-primary w-full min-h-[56px]"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" aria-hidden="true" />
                  <span>{t("meal.analyzingText")}</span>
                </>
              ) : (
                <span>{t("meal.submit")}</span>
              )}
            </button>
          </form>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-red-50 ring-1 ring-inset ring-red-300 text-red-900 flex items-start gap-2"
          >
            <AlertCircle className="w-6 h-6 text-red-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span className="text-base font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Analysis Result */}
        {analysisResult && (
          <div className="well p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-lg font-bold text-ink">
                {t("meal.dishes", { dishes: analysisResult.analysis.dishes.join(", ") })}
              </h4>
              <MealScoreChip score={analysisResult.analysis.healthScore} />
            </div>

            <div className="text-lg text-ink leading-relaxed bg-white p-4 rounded-xl shadow-card whitespace-pre-line">
              {analysisResult.analysis.advice}
            </div>

            <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-base">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              <span>{t("meal.saved")}</span>
            </div>

            <MedicalDisclaimer />
          </div>
        )}
      </div>
    </div>
  );
}
