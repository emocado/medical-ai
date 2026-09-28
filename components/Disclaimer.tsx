import React from "react";
import { AlertCircle } from "lucide-react";
import { MEDICAL_DISCLAIMER } from "@/lib/prompts";

export function MedicalDisclaimer() {
  return (
    <div
      role="note"
      aria-label="Medical Disclaimer"
      className="bg-amber-50 border-2 border-amber-400 text-amber-950 p-4 rounded-xl flex items-start space-x-3 my-4 shadow-sm"
    >
      <AlertCircle className="w-6 h-6 text-amber-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <p className="text-base font-semibold leading-relaxed">
        {MEDICAL_DISCLAIMER}
      </p>
    </div>
  );
}
