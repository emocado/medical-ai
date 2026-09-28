"use client";

import { Header } from "@/components/Header";
import { Clock } from "lucide-react";

export default function TimelinePage() {
  return (
    <div className="space-y-6">
      <Header title="Health Timeline" />

      <section className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-700" />
          Health Progression History
        </h2>
        <p className="text-base text-slate-700 leading-relaxed">
          Track your past medical reports and meals over time. Compare two reports to see how your health is changing.
        </p>

        <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl">
          <p className="text-base">No reports recorded yet.</p>
        </div>
      </section>
    </div>
  );
}
