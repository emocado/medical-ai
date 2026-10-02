import {
  canonicalMarkerId,
  numericValue,
  parseBloodPressure,
  toStandardUnit,
  type MarkerId,
} from "./markers";
import type { KeyMarker, ReportRecord } from "@/types";

/**
 * Deterministic "contact your clinic today" thresholds for adults. These are
 * deliberately conservative screening values, not diagnoses; they exist so an
 * alarming result is never presented only in the AI's reassuring prose.
 */
const CRITICAL_LIMITS: Partial<Record<MarkerId, { low?: number; high?: number }>> = {
  potassium: { low: 2.8, high: 6.0 }, // mmol/L
  sodium: { low: 120, high: 155 }, // mmol/L
  fasting_glucose: { low: 3.0, high: 16.7 }, // mmol/L
  random_glucose: { low: 3.0, high: 16.7 },
  glucose: { low: 3.0, high: 16.7 },
  haemoglobin: { low: 7.0 }, // g/dL
  egfr: { low: 15 }, // mL/min/1.73m²
  platelets: { low: 50 }, // x10^9/L
};

const BP_CRISIS = { systolic: 180, diastolic: 120 };

export interface UrgentFinding {
  marker: string;
  value: string;
  reason: "lab-critical" | "very-high" | "very-low";
}

export function assessMarker(name: string, marker: KeyMarker): UrgentFinding | null {
  const value = `${marker.value}${marker.unit ? ` ${marker.unit}` : ""}`;
  if (marker.status === "critical") return { marker: name, value, reason: "lab-critical" };

  const id = canonicalMarkerId(name);
  if (!id) return null;

  if (id === "blood_pressure") {
    const bp = parseBloodPressure(marker.value);
    if (bp && (bp.systolic >= BP_CRISIS.systolic || bp.diastolic >= BP_CRISIS.diastolic)) {
      return { marker: name, value, reason: "very-high" };
    }
    return null;
  }

  const limits = CRITICAL_LIMITS[id];
  const raw = numericValue(marker.value);
  if (!limits || raw === null) return null;

  const standard = toStandardUnit(id, raw, marker.unit);
  if (limits.high !== undefined && standard >= limits.high) return { marker: name, value, reason: "very-high" };
  if (limits.low !== undefined && standard <= limits.low) return { marker: name, value, reason: "very-low" };
  return null;
}

/** Every marker on the report that should prompt same-day medical contact. */
export function findUrgentFindings(report: Pick<ReportRecord, "keyMarkers">): UrgentFinding[] {
  return Object.entries(report.keyMarkers || {})
    .map(([name, marker]) => assessMarker(name, marker))
    .filter((f): f is UrgentFinding => f !== null);
}

export function needsUrgentAttention(report: Pick<ReportRecord, "keyMarkers" | "urgent">): boolean {
  return Boolean(report.urgent) || findUrgentFindings(report).length > 0;
}
