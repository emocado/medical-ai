"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { MedicalDisclaimer } from "@/components/Disclaimer";
import { MealAdvisorModal } from "@/components/MealAdvisorModal";
import { getAllReports, getAllMealRecords, getAllPillRecords } from "@/lib/db";
import {
  Clock,
  FileText,
  Utensils,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  AlertCircle,
  ArrowRight,
  GitCompare,
  Plus,
} from "lucide-react";
import type { Language, ReportRecord, MealRecord, PillRecord } from "@/types";
import type { DeltaComparisonResult } from "@/lib/delta-comparator";

type TimelineItem =
  | { type: "report"; item: ReportRecord; timestamp: number }
  | { type: "meal"; item: MealRecord; timestamp: number };

export default function TimelinePage() {
  const [lang, setLang] = useState<Language>("en");
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [knownPills, setKnownPills] = useState<PillRecord[]>([]);
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [deltaResult, setDeltaResult] = useState<DeltaComparisonResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);

  useEffect(() => {
    loadTimelineData();
  }, []);

  async function loadTimelineData() {
    try {
      const [allReports, allMeals, allPills] = await Promise.all([
        getAllReports(),
        getAllMealRecords(),
        getAllPillRecords(),
      ]);
      setReports(allReports);
      setMeals(allMeals);
      setKnownPills(allPills);
    } catch (err) {
      console.error("Failed to load timeline items:", err);
    }
  }

  function handleMealSaved(newMeal: MealRecord) {
    setMeals((prev) => [newMeal, ...prev]);
  }

  function toggleReportSelection(id: string) {
    setSelectedReportIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((rId) => rId !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  }

  async function handleCompare() {
    if (selectedReportIds.length !== 2) return;
    const rA = reports.find((r) => r.id === selectedReportIds[0]);
    const rB = reports.find((r) => r.id === selectedReportIds[1]);
    if (!rA || !rB) return;

    setIsComparing(true);
    setErrorMessage(null);
    setDeltaResult(null);

    try {
      const res = await fetch("/api/timeline/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportA: rA,
          reportB: rB,
          language: lang,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${res.status}`);
      }

      const result: DeltaComparisonResult = await res.json();
      setDeltaResult(result);
    } catch (err: any) {
      console.error("Comparison failed:", err);
      setErrorMessage(err.message || "Failed to compare reports. Please try again.");
    } finally {
      setIsComparing(false);
    }
  }

  const timelineItems: TimelineItem[] = [
    ...reports.map((r): TimelineItem => ({
      type: "report",
      item: r,
      timestamp: r.createdAt || new Date(r.date).getTime(),
    })),
    ...meals.map((m): TimelineItem => ({
      type: "meal",
      item: m,
      timestamp: m.createdAt || new Date(m.date).getTime(),
    })),
  ].sort((a, b) => b.timestamp - a.timestamp);

  const latestReport = reports.length > 0 ? reports[0] : null;

  return (
    <div className="space-y-6">
      <Header currentLang={lang} onLanguageChange={setLang} title="Health Timeline" />

      {/* Overview & Actions */}
      <section className="bg-white p-5 rounded-2xl border-2 border-slate-300 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-800" aria-hidden="true" />
            Your Health Journey
          </h2>
          <button
            onClick={() => setIsMealModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-base min-h-[48px] flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-5 h-5" />
            <Utensils className="w-5 h-5" />
            <span>Log Meal</span>
          </button>
        </div>

        <p className="text-base text-slate-700 leading-relaxed">
          Track your past medical reports and meals. Select any <strong>two reports</strong> to compare lab markers and track your health progression over time.
        </p>

        {reports.length >= 2 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <span className="text-base font-bold text-blue-950">
              {selectedReportIds.length} of 2 reports selected for comparison
            </span>
            <button
              onClick={handleCompare}
              disabled={selectedReportIds.length !== 2 || isComparing}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl min-h-[48px] font-bold text-base flex items-center justify-center space-x-2 transition-colors ${
                selectedReportIds.length === 2 && !isComparing
                  ? "bg-blue-800 text-white hover:bg-blue-900 shadow-sm"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              {isComparing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                  <span>Comparing reports...</span>
                </>
              ) : (
                <>
                  <GitCompare className="w-5 h-5" aria-hidden="true" />
                  <span>Compare Progression</span>
                </>
              )}
            </button>
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-red-50 border-2 border-red-300 text-red-900 flex items-start space-x-2"
          >
            <AlertCircle className="w-6 h-6 text-red-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span className="text-base font-medium">{errorMessage}</span>
          </div>
        )}
      </section>

      {/* Delta Comparison Result Display */}
      {deltaResult && (
        <section
          aria-label="Report Comparison Result"
          className="bg-white rounded-2xl border-2 border-blue-400 p-5 shadow-md space-y-4 animate-in fade-in duration-300"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-7 h-7 text-blue-800" aria-hidden="true" />
              Progression Comparison
            </h3>

            <span
              className={`px-3 py-1.5 rounded-full text-base font-black flex items-center gap-1.5 ${
                deltaResult.progression === "improving"
                  ? "bg-emerald-100 text-emerald-950 border border-emerald-300"
                  : deltaResult.progression === "declining"
                  ? "bg-red-100 text-red-950 border border-red-300"
                  : deltaResult.progression === "mixed"
                  ? "bg-purple-100 text-purple-950 border border-purple-300"
                  : "bg-blue-100 text-blue-950 border border-blue-300"
              }`}
            >
              {deltaResult.progression === "improving" && <TrendingUp className="w-5 h-5 text-emerald-700" />}
              {deltaResult.progression === "declining" && <TrendingDown className="w-5 h-5 text-red-700" />}
              {deltaResult.progression === "stable" && <Minus className="w-5 h-5 text-blue-700" />}
              {deltaResult.progression.toUpperCase()}
            </span>
          </div>

          <div className="text-lg text-slate-800 leading-relaxed whitespace-pre-line bg-blue-50/50 p-4 rounded-xl border border-blue-200 font-medium">
            {deltaResult.summary}
          </div>

          {deltaResult.markerDeltas && deltaResult.markerDeltas.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-lg font-bold text-slate-900">Marker Changes</h4>
              <div className="space-y-2.5">
                {deltaResult.markerDeltas.map((delta, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl border-2 border-slate-200 bg-slate-50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-slate-900">{delta.markerName}</span>
                      <span className="text-base font-semibold px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-950">
                        {delta.statusChange}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-base font-semibold text-slate-700">
                      <span>Previous: {delta.previousValue}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
                      <span className="text-blue-900 font-bold">Latest: {delta.currentValue}</span>
                    </div>
                    {delta.interpretation && (
                      <p className="text-base text-slate-600 leading-snug">
                        {delta.interpretation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <MedicalDisclaimer />
        </section>
      )}

      {/* Timeline Entries List */}
      <section aria-label="Timeline History" className="space-y-4">
        {timelineItems.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white rounded-2xl border-2 border-dashed border-slate-300">
            <p className="text-lg font-medium text-slate-600">
              Your timeline is empty. Reports and meal logs will appear here automatically.
            </p>
          </div>
        ) : (
          timelineItems.map((entry) => {
            if (entry.type === "report") {
              const r = entry.item;
              const isSelected = selectedReportIds.includes(r.id);
              const summarySnippet =
                (r.summary[lang] || r.summary.en).slice(0, 140) + "...";

              return (
                <article
                  key={r.id}
                  className={`bg-white rounded-2xl border-2 p-5 shadow-sm space-y-3 transition-colors ${
                    isSelected ? "border-blue-800 bg-blue-50/40 ring-2 ring-blue-800" : "border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-6 h-6 text-blue-800 flex-shrink-0" aria-hidden="true" />
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{r.fileName}</h3>
                        <time className="text-sm font-semibold text-slate-500" dateTime={r.date}>
                          {r.date}
                        </time>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleReportSelection(r.id)}
                      aria-pressed={isSelected}
                      className={`px-4 py-2 rounded-xl text-base font-bold min-h-[48px] border-2 transition-colors flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-blue-800 text-white border-blue-800 shadow"
                          : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      <CheckCircle2
                        className={`w-5 h-5 ${isSelected ? "text-white" : "text-slate-400"}`}
                        aria-hidden="true"
                      />
                      <span>{isSelected ? "Selected" : "Select to Compare"}</span>
                    </button>
                  </div>

                  <p className="text-base text-slate-700 leading-relaxed">{summarySnippet}</p>

                  {r.keyMarkers && Object.keys(r.keyMarkers).length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {Object.entries(r.keyMarkers).slice(0, 4).map(([name, marker]) => (
                        <span
                          key={name}
                          className="text-sm font-medium bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200"
                        >
                          {name}: {marker.value} {marker.unit || ""}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              );
            } else {
              const m = entry.item;
              return (
                <article
                  key={m.id}
                  className="bg-white rounded-2xl border-2 border-slate-300 p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <Utensils className="w-6 h-6 text-amber-700 flex-shrink-0" aria-hidden="true" />
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">
                          Meal: {m.analysis.dishes.join(", ") || "Hawker Dish"}
                        </h3>
                        <time className="text-sm font-semibold text-slate-500" dateTime={m.date}>
                          {m.date}
                        </time>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-base font-black ${
                        m.analysis.healthScore >= 70
                          ? "bg-emerald-100 text-emerald-950"
                          : m.analysis.healthScore >= 50
                          ? "bg-amber-100 text-amber-950"
                          : "bg-red-100 text-red-950"
                      }`}
                    >
                      Score: {m.analysis.healthScore}/100
                    </span>
                  </div>

                  <p className="text-base text-slate-700 leading-relaxed whitespace-pre-line">
                    {m.analysis.advice}
                  </p>
                </article>
              );
            }
          })
        )}
      </section>

      {/* Meal Advisor Modal */}
      <MealAdvisorModal
        isOpen={isMealModalOpen}
        onClose={() => setIsMealModalOpen(false)}
        language={lang}
        latestReport={latestReport}
        knownPills={knownPills}
        onMealSaved={handleMealSaved}
      />
    </div>
  );
}
