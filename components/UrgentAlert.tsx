"use client";

import React from "react";
import { Phone, Siren } from "lucide-react";
import { useT } from "./LanguageProvider";
import type { UrgentFinding } from "@/lib/red-flags";

interface UrgentAlertProps {
  findings: UrgentFinding[];
}

/**
 * Same-day escalation banner. It is driven by fixed rules plus the AI's own
 * flag, and sits above the AI summary so a worrying result is never only
 * described in gentle prose.
 */
export function UrgentAlert({ findings }: UrgentAlertProps) {
  const t = useT();

  return (
    <section
      role="alert"
      aria-labelledby="urgent-alert-title"
      className="bg-red-50 border-[3px] border-red-600 rounded-3xl p-5 sm:p-6 space-y-3 shadow-[0_8px_24px_-8px_rgb(220_38_38/0.35)]"
    >
      <h3 id="urgent-alert-title" className="text-xl font-bold text-red-900 flex items-start gap-2">
        <Siren className="w-7 h-7 text-red-700 flex-shrink-0" aria-hidden="true" />
        {t("urgent.title")}
      </h3>
      <p className="text-lg font-semibold text-red-950 leading-relaxed">{t("urgent.body")}</p>

      {findings.length > 0 && (
        <div>
          <p className="text-base font-bold text-red-900">{t("urgent.flagged")}</p>
          <ul className="mt-1 space-y-1">
            {findings.map((f) => (
              <li key={f.marker} className="text-base font-semibold text-red-950">
                • {f.marker}: {f.value}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-base text-red-950 leading-relaxed">{t("urgent.emergency")}</p>
      <a
        href="tel:999"
        className="btn btn-danger w-full sm:w-auto sm:px-8 min-h-[56px] !text-lg !font-bold !bg-red-700 hover:!bg-red-800"
      >
        <Phone className="w-6 h-6" aria-hidden="true" />
        {t("urgent.call")}
      </a>
    </section>
  );
}
