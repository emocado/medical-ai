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
import { saveMealRecord } from "@/lib/db";
import type { Language, MealRecord, PillRecord, ReportRecord } from "@/types";

interface MealAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  latestReport?: ReportRecord | null;
  knownPills?: PillRecord[] | null;
  onMealSaved: (record: MealRecord) => void;
}

export function MealAdvisorModal({
  isOpen,
  onClose,
  language,
  latestReport,
  knownPills,
  onMealSaved,
}: MealAdvisorModalProps) {
  const [inputType, setInputType] = useState<"photo" | "text">("photo");
  const [textInput, setTextInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<MealRecord | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";
    setErrorMessage(null);
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const base64 = await fileToBase64(file);
      const res = await fetch("/api/meals/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputType: "photo",
          imageBase64: base64,
          mimeType: file.type || "image/jpeg",
          latestReport,
          knownPills,
          language,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${res.status}`);
      }

      const mealRecord: MealRecord = await res.json();
      await saveMealRecord(mealRecord);
      setAnalysisResult(mealRecord);
      onMealSaved(mealRecord);
    } catch (err: any) {
      console.error("Meal photo analysis failed:", err);
      setErrorMessage(err.message || "Failed to analyze meal photo. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleTextSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = textInput.trim();
    if (!trimmed || isAnalyzing) return;

    setErrorMessage(null);
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const res = await fetch("/api/meals/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputType: "text",
          textInput: trimmed,
          latestReport,
          knownPills,
          language,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${res.status}`);
      }

      const mealRecord: MealRecord = await res.json();
      await saveMealRecord(mealRecord);
      setAnalysisResult(mealRecord);
      onMealSaved(mealRecord);
      setTextInput("");
    } catch (err: any) {
      console.error("Meal text analysis failed:", err);
      setErrorMessage(err.message || "Failed to analyze meal text. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="meal-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-2 sm:p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border-2 border-slate-300 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            <Utensils className="w-7 h-7 text-amber-600" aria-hidden="true" />
            <h3 id="meal-modal-title" className="text-xl font-bold text-slate-900">
              Dietary Meal Advisor
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 min-h-[48px] min-w-[48px] flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {latestReport && (
          <div className="flex items-center gap-1.5 text-sm font-semibold bg-blue-50 text-blue-900 px-3 py-1.5 rounded-xl border border-blue-200">
            <Sparkles className="w-4 h-4 text-blue-700 flex-shrink-0" />
            <span>Personalized with your recent health report &amp; pills</span>
          </div>
        )}

        {/* Input Mode Toggle */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-300" role="tablist">
          <button
            role="tab"
            aria-selected={inputType === "photo"}
            onClick={() => setInputType("photo")}
            className={`flex-1 py-2.5 rounded-lg text-base font-bold min-h-[48px] flex items-center justify-center gap-2 transition-colors ${
              inputType === "photo"
                ? "bg-white text-blue-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Camera className="w-5 h-5" />
            <span>Photograph Meal</span>
          </button>
          <button
            role="tab"
            aria-selected={inputType === "text"}
            onClick={() => setInputType("text")}
            className={`flex-1 py-2.5 rounded-lg text-base font-bold min-h-[48px] flex items-center justify-center gap-2 transition-colors ${
              inputType === "text"
                ? "bg-white text-blue-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Type className="w-5 h-5" />
            <span>Type Meal</span>
          </button>
        </div>

        {/* Photo Input Area */}
        {inputType === "photo" && (
          <div className="space-y-4">
            <p className="text-base text-slate-700">
              Snap a photo of your food, hawker meal, or plate. Gemini will identify the dishes and check suitability.
            </p>
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
              className="w-full py-4 px-6 rounded-xl min-h-[56px] text-lg font-bold flex items-center justify-center space-x-3 bg-blue-800 hover:bg-blue-900 text-white shadow-sm"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Analyzing meal ingredients...</span>
                </>
              ) : (
                <>
                  <Camera className="w-6 h-6" />
                  <span>Take Photo or Upload Dish</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Text Input Area */}
        {inputType === "text" && (
          <form onSubmit={handleTextSubmit} className="space-y-4">
            <p className="text-base text-slate-700">
              Describe what you are eating (e.g. &ldquo;Chicken rice with chili, soup, and barley water&rdquo;):
            </p>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="e.g. Nasi lemak with fried egg and sambal, teh tarik..."
              disabled={isAnalyzing}
              rows={3}
              className="w-full p-4 border-2 border-slate-300 rounded-xl text-lg text-slate-900 focus:outline-none focus:border-blue-800 bg-slate-50 focus:bg-white"
            />
            <button
              type="submit"
              disabled={isAnalyzing || !textInput.trim()}
              className={`w-full py-4 px-6 rounded-xl min-h-[56px] text-lg font-bold flex items-center justify-center space-x-3 transition-colors ${
                isAnalyzing || !textInput.trim()
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-blue-800 hover:bg-blue-900 text-white shadow-sm"
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Evaluating nutrition for you...</span>
                </>
              ) : (
                <span>Analyze Meal Advice</span>
              )}
            </button>
          </form>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-red-50 border-2 border-red-300 text-red-900 flex items-start space-x-2"
          >
            <AlertCircle className="w-6 h-6 text-red-700 flex-shrink-0 mt-0.5" />
            <span className="text-base font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Analysis Result */}
        {analysisResult && (
          <div className="bg-slate-50 border-2 border-slate-300 rounded-2xl p-4 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-slate-900">
                Dishes: {analysisResult.analysis.dishes.join(", ")}
              </h4>
              <span
                className={`px-3 py-1.5 rounded-full text-base font-black ${
                  analysisResult.analysis.healthScore >= 70
                    ? "bg-emerald-100 text-emerald-950 border border-emerald-300"
                    : analysisResult.analysis.healthScore >= 50
                    ? "bg-amber-100 text-amber-950 border border-amber-300"
                    : "bg-red-100 text-red-950 border border-red-300"
                }`}
              >
                Score: {analysisResult.analysis.healthScore}/100
              </span>
            </div>

            <div className="text-lg text-slate-800 leading-relaxed bg-white p-4 rounded-xl border border-slate-200 whitespace-pre-line font-medium">
              {analysisResult.analysis.advice}
            </div>

            <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-base">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Saved to your Health Timeline!</span>
            </div>

            <MedicalDisclaimer />
          </div>
        )}
      </div>
    </div>
  );
}
