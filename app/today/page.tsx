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
    <Link href={href} className="card-interactive p-4 pr-3 flex items-center gap-4 min-h-[80px]">
      <span className="w-12 h-12 rounded-[14px] bg-accent-soft flex items-center justify-center flex-shrink-0">
        <Icon className="w-6 h-6 text-accent" aria-hidden="true" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-lg font-semibold text-ink">{title}</span>
        {description && <span className="block text-base text-ink-tertiary">{description}</span>}
      </span>
      <ChevronRight className="w-6 h-6 text-[#c7c7cc] flex-shrink-0" aria-hidden="true" />
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
    <div className="space-y-6">
      <Header title={t("title.today")} />
      <h2 className="text-2xl lg:text-3xl font-bold text-ink">{t(greetingKey(hour))}</h2>

      {latest && needsUrgentAttention(latest) && (
        <Link
          href="/reports"
          role="alert"
          className="card-interactive block p-5 border-2 !border-red-600 !bg-red-50 text-red-950 space-y-1"
        >
          <span className="text-lg font-bold flex items-center gap-2">
            <Siren className="w-6 h-6 text-red-700" aria-hidden="true" />
            {t("urgent.title")}
          </span>
          <span className="block text-base font-semibold underline underline-offset-4">{t("today.urgentLink")}</span>
        </Link>
      )}

      {isNewUser && (
        <section className="space-y-3">
          <p className="text-lg font-medium text-ink-secondary">{t("today.welcome")}</p>
          <div className="grid gap-3 lg:grid-cols-3">
            <ActionCard href="/reports" icon={FileText} title={t("today.start.report")} />
            <ActionCard href="/pills" icon={Camera} title={t("meds.scan")} />
            <ActionCard href="/samples" icon={FlaskConical} title={t("today.start.samples")} />
          </div>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-2 xl:items-start">
        <TodayDoses medications={medications} />

        {latest && (
          <Link href="/reports" className="card-interactive block p-5 sm:p-6 space-y-3">
            <span className="flex items-center justify-between gap-2">
              <span className="text-xl font-bold text-ink flex items-center gap-2">
                <FileText className="w-6 h-6 text-accent" aria-hidden="true" />
                {t("today.latestReport")}
              </span>
              <span className="text-base font-medium text-ink-tertiary whitespace-nowrap tabular">{latest.date}</span>
            </span>
            <span
              className={`block text-lg font-semibold ${outOfRange.length ? "text-amber-800" : "text-emerald-700"}`}
            >
              {outOfRange.length ? t("today.outOfRange", { count: outOfRange.length }) : t("today.allNormal")}
            </span>
            {outOfRange.length > 0 && (
              <span className="flex flex-wrap gap-2">
                {outOfRange.slice(0, 4).map(([name, m]) => (
                  <span key={name} className="chip bg-amber-50 text-amber-950 ring-1 ring-inset ring-amber-300 tabular">
                    {name}: {m.value} {m.unit}
                  </span>
                ))}
              </span>
            )}
            <span className="flex items-center gap-1 text-base font-semibold text-accent">
              {t("today.seeReport")}
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </span>
          </Link>
        )}
      </div>

      {!isNewUser && (
        <section className="grid gap-3 lg:grid-cols-2">
          <ActionCard href="/reports#chat" icon={MessageCircle} title={t("today.ask")} description={t("today.askDesc")} />
          <ActionCard href="/visit" icon={Stethoscope} title={t("today.visit")} description={t("today.visitDesc")} />
        </section>
      )}
    </div>
  );
}
