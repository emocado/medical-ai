import "fake-indexeddb/auto";
import { describe, it, expect } from "vitest";
import { createBackup, parseBackup } from "@/lib/backup";
import { exportAllData, importAllData, getReport } from "@/lib/db";
import type { ReportRecord } from "@/types";

const report: ReportRecord = {
  id: "backup-report",
  date: "2026-03-15",
  fileName: "march.pdf",
  fileType: "application/pdf",
  summary: { en: "a", bm: "b", zh: "c", ta: "d" },
  keyMarkers: { HbA1c: { value: 7.9, unit: "%", status: "high" } },
  createdAt: 1,
};

describe("Backup and restore", () => {
  it("round-trips records through a backup file", async () => {
    const text = JSON.stringify(createBackup({ reports: [report], pills: [], meals: [] }));
    const count = await importAllData(parseBackup(text));
    expect(count).toBe(1);
    expect((await getReport("backup-report"))?.keyMarkers.HbA1c.value).toBe(7.9);
    expect((await exportAllData()).reports.some((r) => r.id === "backup-report")).toBe(true);
  });

  it("rejects files that are not HealthMate backups and drops records without ids", () => {
    expect(() => parseBackup("not json")).toThrow();
    expect(() => parseBackup(JSON.stringify({ reports: [] }))).toThrow(/HealthMate/);
    expect(() => parseBackup(JSON.stringify({ format: "healthmate-backup", version: 99 }))).toThrow(/newer/);
    const parsed = parseBackup(JSON.stringify({ format: "healthmate-backup", version: 1, reports: [{ date: "x" }, report] }));
    expect(parsed.reports.map((r) => r.id)).toEqual(["backup-report"]);
    expect(parsed.pills).toEqual([]);
  });
});
