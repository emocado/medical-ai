"use client";

import React, { useState } from "react";
import { ShieldAlert, ShieldCheck, Loader2, AlertTriangle, AlertCircle } from "lucide-react";
import { useLanguage, useT } from "@/components/LanguageProvider";
import { errorMessageKey, postJson } from "@/lib/api-client";
import { findKnownInteractions } from "@/lib/medications";
import { ensureDisclaimer } from "@/lib/prompts";
import type { InteractionCheckResult, InteractionSeverity } from "@/lib/interaction-checker";
import type { MedicationEntry, ReportRecord } from "@/types";

const SEVERITY_STYLE: Record<InteractionSeverity, string> = {
  serious: "border-red-500 bg-red-50",
  moderate: "border-amber-400 bg-amber-50",
  minor: "border-slate-200 bg-slate-50",
};

/**
 * Checks the whole regimen at once. Well-known dangerous pairs are flagged
 * immediately from a fixed table; the AI review adds anything else, including
 * problems with the patient's conditions.
 */
export function InteractionCheck({
  medications,
  latestReport,
}: {
  medications: MedicationEntry[];
  latestReport: ReportRecord | null;
}) {
  const { language } = useLanguage();
  const t = useT();
  const active = medications.filter((m) => m.active);
  const known = findKnownInteractions(active);
  const [result, setResult] = useState<InteractionCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (active.length < 2) return null;

  async function runCheck() {
    setIsChecking(true);
    setError(null);
    try {
      const res = await postJson<InteractionCheckResult>("/api/medicines/interactions", {
        medications: active,
        latestReport,
        language,
      });
      setResult({ ...res, summary: res.summary ? ensureDisclaimer(res.summary, language) : "" });
    } catch (err) {
      setError(t(errorMessageKey(err, "meds.checkError")));
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <section className="bg-white p-5 rounded-2xl border-2 border-slate-300 shadow-sm space-y-4">
      {known.map((k) => (
        <div key={k.medicines.join("+")} role="alert" className="p-4 rounded-xl border-2 border-red-500 bg-red-50 space-y-1">
          <p className="text-base font-black text-red-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-700" aria-hidden="true" />
            {t("meds.knownWarning")}: {k.medicines.join(" + ")}
          </p>
          <p className="text-base text-red-950 leading-relaxed">{t(k.adviceKey)}</p>
        </div>
      ))}

      <button
        type="button"
        onClick={runCheck}
        disabled={isChecking}
        className="w-full py-4 px-6 rounded-xl min-h-[56px] text-lg font-bold flex items-center justify-center gap-2 bg-blue-800 hover:bg-blue-900 text-white disabled:bg-slate-200 disabled:text-slate-500"
      >
        {isChecking ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" aria-hidden="true" />
            {t("meds.checking")}
          </>
        ) : (
          <>
            <ShieldCheck className="w-6 h-6" aria-hidden="true" />
            {t("meds.check")}
          </>
        )}
      </button>
      <p className="text-sm font-medium text-slate-600">{t("meds.checkHint")}</p>

      {error && (
        <p role="alert" className="text-base font-semibold text-red-800 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" aria-hidden="true" />
          {error}
        </p>
      )}

      {result && (
        <div className="space-y-3" aria-live="polite">
          {result.findings.length === 0 && known.length === 0 && (
            <p className="p-4 rounded-xl border-2 border-emerald-300 bg-emerald-50 text-base font-semibold text-emerald-950">
              {t("meds.noProblems")}
            </p>
          )}
          {result.findings.map((f, i) => (
            <div key={i} className={`p-4 rounded-xl border-2 space-y-1 ${SEVERITY_STYLE[f.severity]}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-base font-bold text-slate-900">{f.medicines.join(" + ")}</p>
                <span className="text-sm font-bold px-2.5 py-1 rounded-full bg-white border border-slate-300 flex items-center gap-1">
                  {f.severity === "serious" && <AlertTriangle className="w-4 h-4 text-red-700" aria-hidden="true" />}
                  {t(`severity.${f.severity}`)}
                </span>
              </div>
              <p className="text-base text-slate-800">{f.explanation}</p>
              <p className="text-base font-semibold text-slate-900">{f.advice}</p>
            </div>
          ))}
          {result.summary && <p className="text-base text-slate-700 leading-relaxed whitespace-pre-line">{result.summary}</p>}
        </div>
      )}
    </section>
  );
}
