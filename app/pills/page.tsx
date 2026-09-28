"use client";

import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { MedicalDisclaimer } from "@/components/Disclaimer";
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
  const [lang, setLang] = useState<Language>("en");
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
      const res = await fetch("/api/pills/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: file.type || "image/jpeg",
          latestReport,
          language: lang,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${res.status}`);
      }

      const analyzedRecord: PillRecord = await res.json();
      await savePillRecord(analyzedRecord);

      setPillRecords((prev) => [analyzedRecord, ...prev]);
      setSelectedRecordId(analyzedRecord.id);
    } catch (err: any) {
      console.error("Pill analysis failed:", err);
      setErrorMessage(err.message || "Failed to analyze pills. Please take a clearer photo and try again.");
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

  const activeRecord = pillRecords.find((r) => r.id === selectedRecordId) || pillRecords[0];

  return (
    <div className="space-y-6">
      <Header currentLang={lang} onLanguageChange={setLang} title="Pill Analyzer" />

      {/* Upload / Capture Section */}
      <section className="bg-white p-5 rounded-2xl border-2 border-slate-300 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Pill className="w-6 h-6 text-blue-800" aria-hidden="true" />
            Check Your Medications
          </h2>
          {latestReport && (
            <span className="text-sm font-semibold bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              Report Synced
            </span>
          )}
        </div>

        <p className="text-base text-slate-700 leading-relaxed">
          Take a photo of your pills, blister packs, or prescription boxes. We will identify each pill, explain how to take it, and check for safety interactions.
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
              <span>Analyzing medication carefully...</span>
            </>
          ) : (
            <>
              <Camera className="w-6 h-6" aria-hidden="true" />
              <span>Take Photo or Upload Medication</span>
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
          aria-label="Previous Medication Scans"
          className="bg-white p-4 rounded-2xl border-2 border-slate-200 space-y-2"
        >
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-base mb-1">
            <History className="w-5 h-5 text-blue-800" aria-hidden="true" />
            <span>Past Pill Scans:</span>
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
                Scan on {r.date} ({r.analysis.pills.length} {r.analysis.pills.length === 1 ? "pill" : "pills"})
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Active Pill Analysis Display */}
      {activeRecord ? (
        <div className="space-y-5">
          {/* Cross-reference alert */}
          {activeRecord.analysis.crossRefWithReports && (
            <div className="bg-blue-50 border-2 border-blue-400 p-4 rounded-2xl space-y-1">
              <div className="flex items-center space-x-2 text-blue-950 font-bold text-lg">
                <Sparkles className="w-5 h-5 text-blue-700" />
                <span>Personalized Health Connection</span>
              </div>
              <p className="text-base text-slate-800 leading-relaxed font-medium">
                {activeRecord.analysis.crossRefWithReports}
              </p>
            </div>
          )}

          {/* Cards for each identified pill */}
          <div className="space-y-4">
            {activeRecord.analysis.pills.map((pill, idx) => (
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
                    What It Is For
                  </span>
                  <p className="text-lg text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                    {pill.purpose}
                  </p>
                </div>

                {/* Dosage */}
                <div className="space-y-1">
                  <span className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <Pill className="w-5 h-5 text-blue-700" />
                    How to Take It
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
                      Side Effects to Watch Out For
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
                      Food &amp; Drink Interactions
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {pill.foodInteractions.map((food, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 rounded-lg text-base font-semibold bg-red-50 text-red-950 border border-red-200"
                        >
                          Avoid: {food}
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
                      Medication Interactions
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
              No medications analyzed yet. Take or upload a photo above to identify your pills.
            </p>
          </div>
        )
      )}
    </div>
  );
}
