import { translate, type StringKey } from "./i18n";
import { findKnownInteractions, type KnownInteraction } from "./medications";
import { findUrgentFindings, type UrgentFinding } from "./red-flags";
import { compareMarkers, type MarkerComparison } from "./trends";
import type { KeyMarker, Language, MedicationEntry, ReportRecord } from "@/types";

const OUT_OF_RANGE = ["high", "low", "abnormal", "critical"];

export interface VisitSummary {
  latestReport: ReportRecord | null;
  previousReport: ReportRecord | null;
  outOfRange: [string, KeyMarker][];
  urgent: UrgentFinding[];
  changes: MarkerComparison[];
  medications: MedicationEntry[];
  interactions: KnownInteraction[];
}

/**
 * Collects what a doctor needs at a glance. Everything here is computed from
 * stored records; nothing is generated, so the sheet can be checked line by
 * line against the original reports.
 * `reports` must be newest first (as returned by getAllReports).
 */
export function buildVisitSummary(reports: ReportRecord[], medications: MedicationEntry[]): VisitSummary {
  const [latestReport = null, previousReport = null] = reports;
  const active = medications.filter((m) => m.active);
  return {
    latestReport,
    previousReport,
    outOfRange: latestReport
      ? Object.entries(latestReport.keyMarkers).filter(([, m]) => OUT_OF_RANGE.includes(m.status ?? ""))
      : [],
    urgent: latestReport ? findUrgentFindings(latestReport) : [],
    changes:
      latestReport && previousReport
        ? compareMarkers(previousReport, latestReport).filter((c) => c.change === "better" || c.change === "worse")
        : [],
    medications: active,
    interactions: findKnownInteractions(active),
  };
}

const formatValue = (m: KeyMarker) => `${m.value}${m.unit ? ` ${m.unit}` : ""}`;

/** Up to six questions for the visit, most important first. */
export function visitQuestions(summary: VisitSummary, lang: Language): string[] {
  const t = (key: StringKey, vars?: Record<string, string | number>) => translate(lang, key, vars);
  const questions: string[] = [];

  for (const k of summary.interactions) {
    questions.push(t("visit.q.interaction", { a: k.medicines[0], b: k.medicines[1] }));
  }
  for (const c of summary.changes.filter((c) => c.change === "worse")) {
    questions.push(t("visit.q.worse", { marker: c.name, from: formatValue(c.previous), to: formatValue(c.current) }));
  }
  const alreadyAsked = new Set(summary.changes.filter((c) => c.change === "worse").map((c) => c.name));
  for (const [name, marker] of summary.outOfRange) {
    if (alreadyAsked.has(name)) continue;
    questions.push(
      t("visit.q.abnormal", {
        marker: name,
        status: t(`statusWord.${marker.status}` as StringKey),
        value: formatValue(marker),
      })
    );
  }
  for (const med of summary.medications.filter((m) => !m.analysis.dosage)) {
    questions.push(t("visit.q.noDose", { name: med.name }));
  }
  if (summary.latestReport) questions.push(t("visit.q.general"));
  return questions.slice(0, 6);
}

/** Plain-text version for sharing by message (WhatsApp, SMS, email). */
export function visitSummaryText(summary: VisitSummary, lang: Language, notes = ""): string {
  const t = (key: StringKey, vars?: Record<string, string | number>) => translate(lang, key, vars);
  const lines: string[] = [`${t("visit.heading")}`, ""];

  if (summary.urgent.length > 0) {
    lines.push(`⚠ ${t("visit.urgent")}:`, ...summary.urgent.map((u) => `- ${u.marker}: ${u.value}`), "");
  }

  lines.push(`${t("visit.medicines")}:`);
  if (summary.medications.length === 0) lines.push(`- ${t("visit.noMedicines")}`);
  for (const m of summary.medications) {
    const times = m.schedule.map((s) => t(`slot.${s}` as StringKey)).join(", ");
    lines.push(`- ${m.name} (${m.genericName}): ${m.analysis.dosage || t("visit.doseUnknown")}${times ? `; ${times}` : ""}`);
  }
  lines.push("");

  if (summary.latestReport) {
    lines.push(`${t("visit.results", { date: summary.latestReport.date })}:`);
    if (summary.outOfRange.length === 0) lines.push(`- ${t("today.allNormal")}`);
    for (const [name, m] of summary.outOfRange) {
      const range = m.referenceRange ? ` (${t("report.normalRange", { range: m.referenceRange })})` : "";
      lines.push(`- ${name}: ${formatValue(m)} ${t(`status.${m.status}` as StringKey)}${range}`);
    }
    lines.push("");
  }

  if (summary.previousReport && summary.changes.length > 0) {
    lines.push(`${t("visit.changes", { date: summary.previousReport.date })}:`);
    for (const c of summary.changes) {
      lines.push(`- ${c.name}: ${formatValue(c.previous)} → ${formatValue(c.current)} (${t(`change.${c.change}` as StringKey)})`);
    }
    lines.push("");
  }

  if (summary.interactions.length > 0) {
    lines.push(`${t("visit.interactions")}:`, ...summary.interactions.map((k) => `- ${k.medicines.join(" + ")}`), "");
  }

  const questions = visitQuestions(summary, lang);
  if (questions.length > 0) {
    lines.push(`${t("visit.questions")}:`, ...questions.map((q, i) => `${i + 1}. ${q}`), "");
  }
  if (notes.trim()) lines.push(`${t("visit.myNotes")}:`, notes.trim(), "");

  lines.push(t("visit.prepared", { date: new Date().toISOString().slice(0, 10) }));
  return lines.join("\n");
}
