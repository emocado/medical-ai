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
      className="bg-red-50 border-4 border-red-600 rounded-2xl p-5 space-y-3"
    >
      <h3 id="urgent-alert-title" className="text-xl font-black text-red-900 flex items-start gap-2">
        <Siren className="w-7 h-7 text-red-700 flex-shrink-0" aria-hidden="true" />
        {t("urgent.title")}
      </h3>
      <p className="text-lg font-bold text-red-950 leading-relaxed">{t("urgent.body")}</p>

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
        className="w-full py-3 px-5 rounded-xl min-h-[56px] text-lg font-black flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 text-white"
      >
        <Phone className="w-6 h-6" aria-hidden="true" />
        {t("urgent.call")}
      </a>
    </section>
  );
}
