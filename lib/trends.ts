import {
  canonicalMarkerId,
  HIGHER_IS_BETTER,
  normalizeMarkerName,
  numericValue,
  parseBloodPressure,
  toStandardUnit,
  type MarkerId,
} from "./markers";
import type { KeyMarker, MarkerStatus, ReportRecord } from "@/types";

export type ChangeVerdict = "better" | "worse" | "same" | "unknown";

export interface MarkerComparison {
  /** Canonical id, or the normalised name for markers outside the catalog. */
  key: string;
  name: string;
  previous: KeyMarker;
  current: KeyMarker;
  direction: "up" | "down" | "same" | "unknown";
  change: ChangeVerdict;
}

const ABNORMAL: MarkerStatus[] = ["high", "low", "abnormal", "critical"];

function markerKey(name: string): string {
  return canonicalMarkerId(name) ?? `name:${normalizeMarkerName(name)}`;
}

/** Comparable number for a marker; blood pressure uses systolic. */
function comparableValue(key: string, marker: KeyMarker): number | null {
  if (key === "blood_pressure") return parseBloodPressure(marker.value)?.systolic ?? null;
  const raw = numericValue(marker.value);
  if (raw === null) return null;
  return key.startsWith("name:") ? raw : toStandardUnit(key as MarkerId, raw, marker.unit);
}

function directionOf(previous: number | null, current: number | null): MarkerComparison["direction"] {
  if (previous === null || current === null) return "unknown";
  const tolerance = Math.max(Math.abs(previous) * 0.02, 1e-9);
  if (Math.abs(current - previous) <= tolerance) return "same";
  return current > previous ? "up" : "down";
}

/**
 * Better or worse, judged from the lab's own flags first, then from the
 * direction of travel relative to the side of the range the value sits on.
 */
export function judgeChange(
  key: string,
  previous: KeyMarker,
  current: KeyMarker,
  direction: MarkerComparison["direction"]
): ChangeVerdict {
  const prevAbnormal = ABNORMAL.includes(previous.status ?? "unknown");
  const currAbnormal = ABNORMAL.includes(current.status ?? "unknown");

  if (prevAbnormal && current.status === "normal") return "better";
  if (previous.status === "normal" && currAbnormal) return "worse";
  if (previous.status === "normal" && current.status === "normal") return "same";
  if (direction === "unknown") return "unknown";
  if (direction === "same") return "same";

  // Still out of range (or unflagged): which way is the bad way?
  const sideStatus = current.status === "high" || current.status === "low" ? current.status : previous.status;
  let upIsBad: boolean;
  if (sideStatus === "high") upIsBad = true;
  else if (sideStatus === "low") upIsBad = false;
  else if (!key.startsWith("name:")) upIsBad = !HIGHER_IS_BETTER.has(key as MarkerId);
  else return "unknown";

  return (direction === "up") === upIsBad ? "worse" : "better";
}

/** Pairs up the markers two reports share (by canonical id) and judges each change. */
export function compareMarkers(
  older: Pick<ReportRecord, "keyMarkers">,
  newer: Pick<ReportRecord, "keyMarkers">
): MarkerComparison[] {
  const olderByKey = new Map<string, [string, KeyMarker]>();
  for (const [name, marker] of Object.entries(older.keyMarkers || {})) {
    olderByKey.set(markerKey(name), [name, marker]);
  }

  const comparisons: MarkerComparison[] = [];
  for (const [name, current] of Object.entries(newer.keyMarkers || {})) {
    const key = markerKey(name);
    const match = olderByKey.get(key);
    if (!match) continue;
    const previous = match[1];
    const direction = directionOf(comparableValue(key, previous), comparableValue(key, current));
    comparisons.push({ key, name, previous, current, direction, change: judgeChange(key, previous, current, direction) });
  }
  return comparisons;
}

export type Progression = "improving" | "stable" | "declining" | "mixed";

export function overallProgression(comparisons: MarkerComparison[]): Progression {
  const better = comparisons.filter((c) => c.change === "better").length;
  const worse = comparisons.filter((c) => c.change === "worse").length;
  if (better && worse) return "mixed";
  if (better) return "improving";
  if (worse) return "declining";
  return "stable";
}

export interface TrendPoint {
  date: string;
  value: number;
  label: string;
  unit: string;
  status?: MarkerStatus;
}

export interface MarkerTrend {
  key: string;
  name: string;
  unit: string;
  referenceRange?: string;
  points: TrendPoint[];
}

/**
 * One series per marker that appears in at least two reports, oldest first.
 * Only points in the same unit as the latest report are kept, so a chart
 * never mixes mg/dL with mmol/L.
 */
export function buildTrends(reports: Pick<ReportRecord, "date" | "keyMarkers">[]): MarkerTrend[] {
  const chronological = [...reports].sort((a, b) => a.date.localeCompare(b.date));
  const series = new Map<string, MarkerTrend>();

  for (const report of chronological) {
    for (const [name, marker] of Object.entries(report.keyMarkers || {})) {
      const key = markerKey(name);
      const value = comparableValue(key, marker);
      if (value === null) continue;
      const trend = series.get(key) ?? { key, name, unit: marker.unit || "", points: [] };
      trend.name = name;
      trend.unit = marker.unit || trend.unit;
      trend.referenceRange = marker.referenceRange || trend.referenceRange;
      trend.points.push({
        date: report.date,
        value: key === "blood_pressure" ? value : numericValue(marker.value) ?? value,
        label: `${marker.value}`,
        unit: (marker.unit || "").trim().toLowerCase(),
        status: marker.status,
      });
      series.set(key, trend);
    }
  }

  return Array.from(series.values())
    .map((trend) => {
      const latestUnit = trend.points[trend.points.length - 1].unit;
      return { ...trend, points: trend.points.filter((p) => p.unit === latestUnit) };
    })
    .filter((t) => t.points.length >= 2);
}
