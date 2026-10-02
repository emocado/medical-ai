"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, MessageCircle, Stethoscope, Camera, FlaskConical, Siren, ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { useT } from "@/components/LanguageProvider";
import { TodayDoses } from "@/components/medicines/TodayDoses";
import { getAllMedications, getAllReports } from "@/lib/db";
import { needsUrgentAttention } from "@/lib/red-flags";
import type { StringKey } from "@/lib/i18n";
import type { MedicationEntry, ReportRecord } from "@/types";

const OUT_OF_RANGE = ["high", "low", "abnormal", "critical"];

function greetingKey(hour: number): StringKey {
  if (hour < 12) return "today.greeting.morning";
  if (hour < 18) return "today.greeting.afternoon";
  return "today.greeting.evening";
}

function ActionCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof FileText;
  title: string;
  description?: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white p-4 rounded-2xl border-2 border-slate-300 shadow-sm flex items-center gap-3 min-h-[72px] hover:border-blue-700"
    >
      <span className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-6 h-6 text-blue-800" aria-hidden="true" />
      </span>
      <span className="flex-1">
        <span className="block text-lg font-bold text-slate-900">{title}</span>
        {description && <span className="block text-base text-slate-600">{description}</span>}
      </span>
      <ChevronRight className="w-6 h-6 text-slate-400" aria-hidden="true" />
    </Link>
  );
}

/** Home screen: what needs doing today, in one place. */
export default function TodayPage() {
  const t = useT();
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [medications, setMedications] = useState<MedicationEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [hour, setHour] = useState(12);

  useEffect(() => {
    setHour(new Date().getHours());
    Promise.all([getAllReports(), getAllMedications()])
      .then(([r, m]) => {
        setReports(r);
        setMedications(m);
      })
      .catch((err) => console.error("Failed to load today data:", err))
      .finally(() => setLoaded(true));
  }, []);

  const latest = reports[0];
  const outOfRange = latest
    ? Object.entries(latest.keyMarkers).filter(([, m]) => OUT_OF_RANGE.includes(m.status ?? ""))
    : [];
  const isNewUser = loaded && reports.length === 0 && medications.length === 0;

  return (
    <div className="space-y-5">
      <Header title={t("title.today")} />
      <h2 className="text-2xl font-black text-slate-900">{t(greetingKey(hour))}</h2>

      {latest && needsUrgentAttention(latest) && (
        <Link
          href="/reports"
          role="alert"
          className="block p-4 rounded-2xl border-4 border-red-600 bg-red-50 text-red-950 space-y-1"
        >
          <span className="text-lg font-black flex items-center gap-2">
            <Siren className="w-6 h-6 text-red-700" aria-hidden="true" />
            {t("urgent.title")}
          </span>
          <span className="block text-base font-semibold underline">{t("today.urgentLink")}</span>
        </Link>
      )}

      {isNewUser && (
        <section className="space-y-3">
          <p className="text-lg font-semibold text-slate-800">{t("today.welcome")}</p>
          <ActionCard href="/reports" icon={FileText} title={t("today.start.report")} />
          <ActionCard href="/pills" icon={Camera} title={t("meds.scan")} />
          <ActionCard href="/samples" icon={FlaskConical} title={t("today.start.samples")} />
        </section>
      )}

      <TodayDoses medications={medications} />

      {latest && (
        <Link
          href="/reports"
          className="block bg-white p-5 rounded-2xl border-2 border-slate-300 shadow-sm space-y-2 hover:border-blue-700"
        >
          <span className="flex items-center justify-between gap-2">
            <span className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-800" aria-hidden="true" />
              {t("today.latestReport")}
            </span>
            <span className="text-base font-medium text-slate-600 whitespace-nowrap">{latest.date}</span>
          </span>
          <span
            className={`block text-lg font-bold ${outOfRange.length ? "text-amber-900" : "text-emerald-800"}`}
          >
            {outOfRange.length ? t("today.outOfRange", { count: outOfRange.length }) : t("today.allNormal")}
          </span>
          {outOfRange.length > 0 && (
            <span className="flex flex-wrap gap-2">
              {outOfRange.slice(0, 4).map(([name, m]) => (
                <span key={name} className="px-2.5 py-1 rounded-lg text-base font-semibold bg-amber-50 border border-amber-300 text-amber-950">
                  {name}: {m.value} {m.unit}
                </span>
              ))}
            </span>
          )}
          <span className="block text-base font-bold text-blue-800">{t("today.seeReport")} →</span>
        </Link>
      )}

      {!isNewUser && (
        <section className="space-y-3">
          <ActionCard href="/reports#chat" icon={MessageCircle} title={t("today.ask")} description={t("today.askDesc")} />
          <ActionCard href="/visit" icon={Stethoscope} title={t("today.visit")} description={t("today.visitDesc")} />
        </section>
      )}
    </div>
  );
}
