"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Header } from "@/components/Header";
import { useLanguage, useT } from "@/components/LanguageProvider";
import { errorMessageKey, fileToBase64, postJson } from "@/lib/api-client";
import { MedicalDisclaimer } from "@/components/Disclaimer";
import { TranslationStatus } from "@/components/TranslationStatus";
import { localizedAnalysis, useAutoTranslate } from "@/components/useAutoTranslate";
import { getAllPillRecords, savePillRecord, getAllReports } from "@/lib/db";
import {
  Pill,
  Camera,
  Loader2,
  AlertTriangle,
  Info,
  Utensils,
  History,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import type { Language, PillRecord, ReportRecord } from "@/types";

export default function PillsPage() {
  const { language: lang } = useLanguage();
  const t = useT();
  const [pillRecords, setPillRecords] = useState<PillRecord[]>([]);
  const [latestReport, setLatestReport] = useState<ReportRecord | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [records, reports] = await Promise.all([
        getAllPillRecords(),
        getAllReports(),
      ]);
      setPillRecords(records);
      if (reports.length > 0) {
        setLatestReport(reports[0]);
      }
      if (records.length > 0 && !selectedRecordId) {
        setSelectedRecordId(records[0].id);
      }
    } catch (err) {
      console.error("Failed to load records from IndexedDB:", err);
    }
  }

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";
    setErrorMessage(null);
    setIsAnalyzing(true);

    try {
      const base64 = await fileToBase64(file);
      const analyzedRecord = await postJson<PillRecord>("/api/pills/analyze", {
        imageBase64: base64,
        mimeType: file.type || "image/jpeg",
        latestReport,
        language: lang,
      });
      await savePillRecord(analyzedRecord);

      setPillRecords((prev) => [analyzedRecord, ...prev]);
      setSelectedRecordId(analyzedRecord.id);
    } catch (err) {
      console.error("Pill analysis failed:", err);
      setErrorMessage(t(errorMessageKey(err, "pills.error")));
    } finally {
      setIsAnalyzing(false);
    }
  }

  const activeRecord = pillRecords.find((r) => r.id === selectedRecordId) || pillRecords[0];
  const visibleRecords = useMemo(() => (activeRecord ? [activeRecord] : []), [activeRecord]);
  const translation = useAutoTranslate(visibleRecords, lang, savePillRecord, (updated) =>
    setPillRecords((prev) => prev.map((r) => updated.find((u) => u.id === r.id) ?? r))
  );
  const analysis = activeRecord ? localizedAnalysis(activeRecord, lang) ?? activeRecord.analysis : null;

  return (
    <div className="space-y-6">
      <Header title={t("title.pills")} />

      {/* Upload / Capture Section */}
      <section className="bg-white p-5 rounded-2xl border-2 border-slate-300 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Pill className="w-6 h-6 text-blue-800" aria-hidden="true" />
            {t("pills.check.title")}
          </h2>
          {latestReport && (
            <span className="text-sm font-semibold bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              {t("pills.reportSynced")}
            </span>
          )}
        </div>

        <p className="text-base text-slate-700 leading-relaxed">
          {t("pills.desc")}
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageSelect}
          className="hidden"
          id="pill-camera-input"
          disabled={isAnalyzing}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isAnalyzing}
          className={`w-full py-4 px-6 rounded-xl min-h-[56px] text-lg font-bold flex items-center justify-center space-x-3 transition-colors shadow-sm ${
            isAnalyzing
              ? "bg-slate-200 text-slate-500 cursor-not-allowed"
              : "bg-blue-800 hover:bg-blue-900 text-white active:bg-blue-950"
          }`}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin text-blue-900" aria-hidden="true" />
              <span>{t("pills.analyzing")}</span>
            </>
          ) : (
            <>
              <Camera className="w-6 h-6" aria-hidden="true" />
              <span>{t("pills.button")}</span>
            </>
          )}
        </button>

        {errorMessage && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-red-50 border-2 border-red-300 text-red-900 flex items-start space-x-2"
          >
            <AlertTriangle className="w-6 h-6 text-red-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span className="text-base font-medium">{errorMessage}</span>
          </div>
        )}
      </section>

      {/* Pill Record History Selector */}
      {pillRecords.length > 1 && (
        <section
          aria-label={t("pills.history.aria")}
          className="bg-white p-4 rounded-2xl border-2 border-slate-200 space-y-2"
        >
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-base mb-1">
            <History className="w-5 h-5 text-blue-800" aria-hidden="true" />
            <span>{t("pills.history.label")}</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
            {pillRecords.map((r) => (
              <button
                key={r.id}
                role="tab"
                aria-selected={r.id === activeRecord?.id}
                onClick={() => setSelectedRecordId(r.id)}
                className={`px-4 py-2 rounded-xl text-base font-semibold whitespace-nowrap min-h-[48px] border-2 transition-colors ${
                  r.id === activeRecord?.id
                    ? "border-blue-800 bg-blue-100 text-blue-950"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {r.analysis.pills.length === 1
                  ? t("pills.scanLabelOne", { date: r.date })
                  : t("pills.scanLabel", { date: r.date, count: r.analysis.pills.length })}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Active Pill Analysis Display */}
      {activeRecord && analysis ? (
        <div className="space-y-5">
          <TranslationStatus status={translation.status} onRetry={translation.retry} />
          {/* Cross-reference alert */}
          {analysis.crossRefWithReports && (
            <div className="bg-blue-50 border-2 border-blue-400 p-4 rounded-2xl space-y-1">
              <div className="flex items-center space-x-2 text-blue-950 font-bold text-lg">
                <Sparkles className="w-5 h-5 text-blue-700" />
                <span>{t("pills.connection")}</span>
              </div>
              <p className="text-base text-slate-800 leading-relaxed font-medium">
                {analysis.crossRefWithReports}
              </p>
            </div>
          )}

          {/* Cards for each identified pill */}
          <div className="space-y-4">
            {analysis.pills.map((pill, idx) => (
              <article
                key={idx}
                className="bg-white rounded-2xl border-2 border-slate-300 p-5 shadow-sm space-y-4"
              >
                <div className="border-b border-slate-200 pb-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-2xl font-black text-blue-950">{pill.name}</h3>
                    {pill.genericName && (
                      <span className="text-base font-medium text-slate-600 italic">
                        ({pill.genericName})
                      </span>
                    )}
                  </div>
                </div>

                {/* Purpose */}
                <div className="space-y-1">
                  <span className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <Info className="w-5 h-5 text-blue-700" />
                    {t("pills.purpose")}
                  </span>
                  <p className="text-lg text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                    {pill.purpose}
                  </p>
                </div>

                {/* Dosage */}
                <div className="space-y-1">
                  <span className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <Pill className="w-5 h-5 text-blue-700" />
                    {t("pills.howToTake")}
                  </span>
                  <p className="text-lg font-semibold text-blue-950 bg-blue-50 p-3 rounded-xl border border-blue-200 leading-relaxed">
                    {pill.dosage}
                  </p>
                </div>

                {/* Side Effects */}
                {pill.sideEffects && pill.sideEffects.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      {t("pills.sideEffects")}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {pill.sideEffects.map((side, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 rounded-lg text-base font-semibold bg-amber-100 text-amber-950 border border-amber-300"
                        >
                          {side}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Food Interactions */}
                {pill.foodInteractions && pill.foodInteractions.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                      <Utensils className="w-5 h-5 text-red-600" />
                      {t("pills.foodInteractions")}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {pill.foodInteractions.map((food, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 rounded-lg text-base font-semibold bg-red-50 text-red-950 border border-red-200"
                        >
                          {t("pills.avoid", { item: food })}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Drug Interactions */}
                {pill.drugInteractions && pill.drugInteractions.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldAlert className="w-5 h-5 text-slate-700" />
                      {t("pills.drugInteractions")}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {pill.drugInteractions.map((drug, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 rounded-lg text-base font-medium bg-slate-100 text-slate-900 border border-slate-300"
                        >
                          {drug}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>

          <MedicalDisclaimer />
        </div>
      ) : (
        !isAnalyzing && (
          <div className="text-center py-10 px-4 bg-white rounded-2xl border-2 border-dashed border-slate-300">
            <p className="text-lg font-medium text-slate-600">
              {t("pills.empty")}
            </p>
          </div>
        )
      )}
    </div>
  );
}
