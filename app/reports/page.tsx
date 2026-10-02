"use client";

import { useEffect, useState, useRef } from "react";
import { Header } from "@/components/Header";
import { useLanguage, useT } from "@/components/LanguageProvider";
import { ReportView } from "@/components/ReportView";
import { ChatInterface } from "@/components/ChatInterface";
import { getAllReports, saveReport, getAllPillRecords } from "@/lib/db";
import { errorMessageKey, fileToBase64, postJson } from "@/lib/api-client";
import { FileUp, Loader2, Plus, AlertCircle, History } from "lucide-react";
import type { ReportRecord, PillRecord } from "@/types";

export default function ReportsPage() {
  const { language: lang } = useLanguage();
  const t = useT();
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [knownPills, setKnownPills] = useState<PillRecord[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [reportRecords, pillRecords] = await Promise.all([
        getAllReports(),
        getAllPillRecords(),
      ]);
      setReports(reportRecords);
      setKnownPills(pillRecords);
      if (reportRecords.length > 0 && !selectedReportId) {
        setSelectedReportId(reportRecords[0].id);
      }
    } catch (err) {
      console.error("Failed to load initial data from IndexedDB:", err);
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";
    setErrorMessage(null);
    setIsUploading(true);

    try {
      const base64 = await fileToBase64(file);
      const analyzedReport = await postJson<ReportRecord>("/api/reports/analyze", {
        fileBase64: base64,
        mimeType: file.type || "application/octet-stream",
        fileName: file.name,
      });
      await saveReport(analyzedReport);

      setReports((prev) => [analyzedReport, ...prev]);
      setSelectedReportId(analyzedReport.id);
    } catch (err) {
      console.error("Upload/analysis failed:", err);
      setErrorMessage(t(errorMessageKey(err, "reports.upload.error")));
    } finally {
      setIsUploading(false);
    }
  }

  const activeReport = reports.find((r) => r.id === selectedReportId) || reports[0];

  return (
    <div className="space-y-6">
      <Header title={t("title.reports")} />

      {/* Upload Action */}
      <section className="bg-white p-5 rounded-2xl border-2 border-slate-300 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileUp className="w-6 h-6 text-blue-800" aria-hidden="true" />
            {t("reports.upload.title")}
          </h2>
          <span className="text-base text-slate-600 font-medium">{t("reports.upload.formats")}</span>
        </div>

        <p className="text-base text-slate-700 leading-relaxed">{t("reports.upload.desc")}</p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
          id="report-file-input"
          disabled={isUploading}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={`w-full py-4 px-6 rounded-xl min-h-[56px] text-lg font-bold flex items-center justify-center space-x-3 transition-colors shadow-sm ${
            isUploading
              ? "bg-slate-200 text-slate-500 cursor-not-allowed"
              : "bg-blue-800 hover:bg-blue-900 text-white active:bg-blue-950"
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin text-blue-900" aria-hidden="true" />
              <span>{t("reports.upload.analyzing")}</span>
            </>
          ) : (
            <>
              <Plus className="w-6 h-6" aria-hidden="true" />
              <span>{t("reports.upload.button")}</span>
            </>
          )}
        </button>

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

      {/* Report History / Selector if multiple reports exist */}
      {reports.length > 1 && (
        <section
          aria-label={t("reports.history.aria")}
          className="bg-white p-4 rounded-2xl border-2 border-slate-200 space-y-2"
        >
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-base mb-1">
            <History className="w-5 h-5 text-blue-800" aria-hidden="true" />
            <span>{t("reports.history.label")}</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
            {reports.map((r) => (
              <button
                key={r.id}
                role="tab"
                aria-selected={r.id === activeReport?.id}
                onClick={() => setSelectedReportId(r.id)}
                className={`px-4 py-2 rounded-xl text-base font-semibold whitespace-nowrap min-h-[48px] border-2 transition-colors ${
                  r.id === activeReport?.id
                    ? "border-blue-800 bg-blue-100 text-blue-950"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {r.fileName.length > 18 ? `${r.fileName.slice(0, 16)}...` : r.fileName} ({r.date})
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Display Active Report */}
      {activeReport ? (
        <ReportView report={activeReport} language={lang} />
      ) : (
        !isUploading && (
          <div className="text-center py-8 px-4 bg-white rounded-2xl border-2 border-dashed border-slate-300">
            <p className="text-lg font-medium text-slate-600">{t("reports.empty")}</p>
          </div>
        )
      )}

      {/* Chat Interface (with injected report + pills context) */}
      <ChatInterface
        language={lang}
        latestReport={activeReport || null}
        knownPills={knownPills}
      />
    </div>
  );
}
