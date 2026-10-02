"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Pill, Clock, Home } from "lucide-react";
import { useT } from "./LanguageProvider";

export function BottomNav() {
  const pathname = usePathname();
  const t = useT();

  const isTodayActive = pathname === "/" || pathname.startsWith("/today") || pathname.startsWith("/visit");
  const isReportsActive = pathname.startsWith("/reports");
  const isMedicinesActive = pathname.startsWith("/medicines") || pathname.startsWith("/pills");
  const isTimelineActive = pathname.startsWith("/timeline");

  const tabs = [
    {
      href: "/today",
      label: t("nav.today"),
      icon: Home,
      active: isTodayActive,
      ariaLabel: t("nav.today.aria"),
    },
    {
      href: "/reports",
      label: t("nav.reports"),
      icon: FileText,
      active: isReportsActive,
      ariaLabel: t("nav.reports.aria"),
    },
    {
      href: "/medicines",
      label: t("nav.medicines"),
      icon: Pill,
      active: isMedicinesActive,
      ariaLabel: t("nav.medicines.aria"),
    },
    {
      href: "/timeline",
      label: t("nav.timeline"),
      icon: Clock,
      active: isTimelineActive,
      ariaLabel: t("nav.timeline.aria"),
    },
  ];

  return (
    <nav
      aria-label={t("nav.main.aria")}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-slate-300 shadow-lg px-0 py-1 safe-area-bottom print:hidden"
    >
      <div className="max-w-xl mx-auto flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.ariaLabel}
              aria-current={tab.active ? "page" : undefined}
              className={`flex flex-col items-center justify-center flex-1 basis-0 min-w-0 py-2 px-0 min-h-[56px] rounded-lg transition-colors font-medium ${
                tab.active
                  ? "text-blue-900 bg-blue-100 font-bold border-b-4 border-blue-900"
                  : "text-slate-700 hover:text-blue-800 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-7 h-7 mb-1" strokeWidth={tab.active ? 2.5 : 2} />
              <span className="text-sm text-center leading-tight break-words max-w-full">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
