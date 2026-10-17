"use client";

import React, { useMemo, useState } from "react";
import { LineChart } from "lucide-react";
import { useT } from "./LanguageProvider";
import { parseReferenceRange } from "@/lib/markers";
import type { MarkerTrend } from "@/lib/trends";
import type { StringKey } from "@/lib/i18n";

const WIDTH = 340;
const HEIGHT = 180;
const PAD = { top: 24, right: 44, bottom: 30, left: 40 };

const STATUS_TEXT: Record<string, string> = {
  high: "text-amber-800",
  low: "text-amber-800",
  abnormal: "text-amber-800",
  critical: "text-red-700",
};

function shortDate(date: string): string {
  const d = new Date(date);
  return Number.isNaN(d.getTime())
    ? date
    : d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
}

/** One marker's values across reports, with the printed normal range shaded. */
function TrendChart({ trend }: { trend: MarkerTrend }) {
  const t = useT();
  const range = parseReferenceRange(trend.referenceRange);
  const values = trend.points.map((p) => p.value);
  const candidates = [...values, range?.low, range?.high].filter((v): v is number => v !== undefined);
  let min = Math.min(...candidates);
  let max = Math.max(...candidates);
  const pad = (max - min || Math.abs(max) || 1) * 0.15;
  min -= pad;
  max += pad;

  const plotW = WIDTH - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (trend.points.length === 1 ? plotW / 2 : (i / (trend.points.length - 1)) * plotW);
  const y = (v: number) => PAD.top + (1 - (v - min) / (max - min)) * plotH;
  const path = trend.points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");

  const bandTop = range ? y(range.high ?? max) : 0;
  const bandBottom = range ? y(range.low ?? min) : 0;
  const last = trend.points.length - 1;

  return (
    <figure className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-x-8 lg:gap-y-2 lg:items-start">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto lg:col-start-1 lg:row-start-1"
        role="img"
        aria-label={t("trends.chartAria", { name: trend.name })}
      >
        {range && (
          <rect
            x={PAD.left}
            y={bandTop}
            width={plotW}
            height={Math.max(0, bandBottom - bandTop)}
            className="fill-emerald-100/70"
            rx={6}
          />
        )}
        {/* Recessive baseline */}
        <line x1={PAD.left} x2={WIDTH - PAD.right} y1={HEIGHT - PAD.bottom} y2={HEIGHT - PAD.bottom} className="stroke-black/10" strokeWidth={1} />
        <path d={path} fill="none" className="stroke-accent" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {trend.points.map((p, i) => (
          <g key={`${p.date}-${i}`}>
            <title>{`${p.date}: ${p.label} ${trend.unit}`}</title>
            {/* Larger invisible hit target for touch and hover */}
            <circle cx={x(i)} cy={y(p.value)} r={14} fill="transparent" />
            <circle cx={x(i)} cy={y(p.value)} r={5} className="fill-accent stroke-white" strokeWidth={2.5} />
            <text x={x(i)} y={HEIGHT - 10} textAnchor="middle" className="fill-ink-tertiary tabular" fontSize={12}>
              {shortDate(p.date)}
            </text>
            {(i === 0 || i === last) && (
              <text
                x={x(i)}
                y={y(p.value) - 10}
                textAnchor={i === 0 && last > 0 ? "start" : i === last && last > 0 ? "end" : "middle"}
                className="fill-ink font-semibold tabular"
                fontSize={13}
              >
                {p.label}
              </text>
            )}
          </g>
        ))}
      </svg>
      {range && (
        <figcaption className="text-sm font-medium text-ink-tertiary flex items-center gap-2 lg:col-start-1 lg:row-start-2">
          <span className="inline-block w-4 h-3 rounded bg-emerald-100 ring-1 ring-inset ring-emerald-300" aria-hidden="true" />
          {t("trends.normalBand")} ({trend.referenceRange})
        </figcaption>
      )}

      {/* Table view: the accessible, exact-value companion to the chart */}
      <table className="w-full text-base tabular lg:col-start-2 lg:row-start-1 lg:row-span-2">
        <thead>
          <tr className="text-left text-ink-tertiary border-b border-black/[0.08]">
            <th className="py-1.5 font-semibold">{t("trends.date")}</th>
            <th className="py-1.5 font-semibold">{t("trends.value")}</th>
          </tr>
        </thead>
        <tbody>
          {trend.points.map((p, i) => (
            <tr key={`${p.date}-${i}`} className="border-b border-black/[0.05] last:border-0">
              <td className="py-2 pr-3 text-ink-secondary whitespace-nowrap align-top">{p.date}</td>
              <td className={`py-2 font-semibold ${STATUS_TEXT[p.status ?? ""] ?? "text-ink"}`}>
                {p.label} {trend.unit}
                {p.status && p.status !== "normal" && p.status !== "unknown" && (
                  <span className="ml-2 text-sm font-semibold">({t(`status.${p.status}` as StringKey)})</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

/** Lets the patient pick a test and see how it has moved across their reports. */
export function MarkerTrends({ trends }: { trends: MarkerTrend[] }) {
  const t = useT();
  // Start on a result that is out of range in the latest report, if any.
  const initial = useMemo(() => {
    const flagged = trends.find((tr) => {
      const s = tr.points[tr.points.length - 1].status;
      return s === "high" || s === "low" || s === "critical";
    });
    return (flagged ?? trends[0])?.key ?? null;
  }, [trends]);
  const [selected, setSelected] = useState<string | null>(null);
  const active = trends.find((tr) => tr.key === (selected ?? initial));
  if (!active) return null;

  return (
    <section className="card p-5 sm:p-6 space-y-4">
      <h2 className="text-xl font-bold text-ink flex items-center gap-2">
        <LineChart className="w-6 h-6 text-accent" aria-hidden="true" />
        {t("trends.title")}
      </h2>
      {/* A native select keeps a long list of tests compact and easy to use on a phone. */}
      <label className="block space-y-2 lg:max-w-md">
        <span className="text-base font-medium text-ink-secondary">{t("trends.pick")}</span>
        <select
          value={active.key}
          onChange={(e) => setSelected(e.target.value)}
          className="field min-h-[56px] font-semibold"
        >
          {trends.map((tr) => (
            <option key={tr.key} value={tr.key}>
              {tr.name}
              {tr.unit ? ` (${tr.unit})` : ""}
            </option>
          ))}
        </select>
      </label>
      <TrendChart trend={active} />
    </section>
  );
}
