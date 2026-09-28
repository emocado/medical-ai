"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { initDB } from "@/lib/db";
import { FileUp, MessageSquare } from "lucide-react";
import type { Language } from "@/types";

export default function ReportsPage() {
  const [lang, setLang] = useState<Language>("en");
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    initDB().then(() => setIsDbReady(true)).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <Header currentLang={lang} onLanguageChange={setLang} title="Reports & Chat" />

      <section className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FileUp className="w-6 h-6 text-blue-700" />
          Upload Medical Report
        </h2>
        <p className="text-base text-slate-700 leading-relaxed">
          Upload a photo or PDF of your doctor&apos;s report or blood test. We will explain it in simple words.
        </p>
        <div className="border-3 border-dashed border-blue-300 rounded-xl p-8 text-center bg-blue-50/50">
          <p className="text-base font-semibold text-blue-900">
            Report upload ready
          </p>
        </div>
      </section>

      <section className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-blue-700" />
          Health Assistant Chat
        </h2>
        <p className="text-base text-slate-700">
          Ask questions about your health and medical reports.
        </p>
      </section>

      <div className="text-sm text-slate-500 text-center">
        {isDbReady ? "Local database active (IndexedDB)" : "Initializing local database..."}
      </div>
    </div>
  );
}
