"use client";

import React, { useRef, useState } from "react";
import { DatabaseBackup, Download, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { useT } from "./LanguageProvider";
import { exportAllData, importAllData } from "@/lib/db";
import { createBackup, parseBackup } from "@/lib/backup";

/** Records live only in this browser, so offer a file the patient can keep. */
export function BackupSection({ onRestored }: { onRestored: () => void }) {
  const t = useT();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleExport() {
    const backup = createBackup(await exportAllData());
    const blob = new Blob([JSON.stringify(backup)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `healthmate-backup-${backup.exportedAt.slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const count = await importAllData(parseBackup(await file.text()));
      setMessage({ ok: true, text: t("backup.imported", { count }) });
      onRestored();
    } catch (err) {
      console.error("Backup restore failed:", err);
      setMessage({ ok: false, text: t("backup.invalid") });
    }
  }

  return (
    <section className="card p-5 sm:p-6 space-y-3">
      <h2 className="text-xl font-bold text-ink flex items-center gap-2">
        <DatabaseBackup className="w-6 h-6 text-accent" aria-hidden="true" />
        {t("backup.title")}
      </h2>
      <p className="text-base text-ink-secondary leading-relaxed">{t("backup.desc")}</p>
      <p className="text-sm font-medium text-ink-tertiary">{t("backup.privacy")}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <button
          type="button"
          onClick={handleExport}
          className="btn btn-primary min-h-[56px]"
        >
          <Download className="w-6 h-6" aria-hidden="true" />
          {t("backup.export")}
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="btn btn-tinted min-h-[56px]"
        >
          <Upload className="w-6 h-6" aria-hidden="true" />
          {t("backup.import")}
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" onChange={handleImport} className="hidden" />
      </div>

      {message && (
        <p
          role={message.ok ? "status" : "alert"}
          className={`text-base font-semibold flex items-center gap-2 ${message.ok ? "text-emerald-700" : "text-red-700"}`}
        >
          {message.ok ? (
            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
          ) : (
            <AlertCircle className="w-5 h-5" aria-hidden="true" />
          )}
          {message.text}
        </p>
      )}
    </section>
  );
}
