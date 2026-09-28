"use client";

import { Header } from "@/components/Header";
import { Pill, Camera } from "lucide-react";

export default function PillsPage() {
  return (
    <div className="space-y-6">
      <Header title="Pill Analyzer" />

      <section className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Pill className="w-6 h-6 text-blue-700" />
          Identify Your Medications
        </h2>
        <p className="text-base text-slate-700 leading-relaxed">
          Take a photo of your pills or medication box to learn what they are for, how to take them, and what side effects to watch for.
        </p>

        <div className="border-3 border-dashed border-blue-300 rounded-xl p-8 text-center bg-blue-50/50 flex flex-col items-center justify-center space-y-3">
          <Camera className="w-10 h-10 text-blue-600" />
          <p className="text-base font-semibold text-blue-900">
            Camera photo ready
          </p>
        </div>
      </section>
    </div>
  );
}
