"use client";

import React from "react";
import type { Language, ReportRecord } from "@/types";
import { MedicalDisclaimer } from "./Disclaimer";
import { FileText, Calendar, CheckCircle2, AlertTriangle } from "lucide-react";

interface ReportViewProps {
  report: ReportRecord;
  language: Language;
}

export function ReportView({ report, language }: ReportViewProps) {
  const summaryText = report.summary[language] || report.summary.en;
  const keyMarkerEntries = Object.entries(report.keyMarkers || {});

  return (
    <article
      aria-label={`Report Summary for ${report.fileName}`}
      className="bg-white rounded-2xl border-2 border-slate-300 p-5 shadow-sm space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <FileText className="w-6 h-6 text-blue-800" aria-hidden="true" />
          <h3 className="text-xl font-bold text-slate-900 break-all">{report.fileName}</h3>
        </div>
        <div className="flex items-center text-slate-700 text-base font-medium space-x-1">
          <Calendar className="w-5 h-5 text-slate-500" aria-hidden="true" />
          <time dateTime={report.date}>{report.date}</time>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-lg font-bold text-slate-900">Summary</h4>
        <div className="text-slate-800 text-lg leading-relaxed whitespace-pre-line bg-blue-50/40 p-4 rounded-xl border border-blue-200">
          {summaryText}
        </div>
      </div>

      {keyMarkerEntries.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-bold text-slate-900">Key Health Markers</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {keyMarkerEntries.map(([name, marker]) => {
              const isAbnormal =
                marker.status === "high" ||
                marker.status === "low" ||
                marker.status === "abnormal";

              return (
                <div
                  key={name}
                  className={`p-3 rounded-xl border-2 flex items-start justify-between ${
                    isAbnormal
                      ? "border-amber-400 bg-amber-50/60"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div>
                    <span className="text-base font-bold text-slate-900 block">{name}</span>
                    <span className="text-lg font-extrabold text-blue-950">
                      {marker.value} {marker.unit || ""}
                    </span>
                  </div>
                  {isAbnormal ? (
                    <span className="inline-flex items-center text-sm font-bold text-amber-900 bg-amber-200 px-2.5 py-1 rounded-full">
                      <AlertTriangle className="w-4 h-4 mr-1 text-amber-800" />
                      {marker.status ? marker.status.toUpperCase() : "CHECK"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-sm font-bold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-700" />
                      NORMAL
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <MedicalDisclaimer />
    </article>
  );
}
