"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Pill, Clock } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const isReportsActive = pathname === "/" || pathname.startsWith("/reports");
  const isPillsActive = pathname.startsWith("/pills");
  const isTimelineActive = pathname.startsWith("/timeline");

  const tabs = [
    {
      href: "/reports",
      label: "Reports & Chat",
      icon: FileText,
      active: isReportsActive,
      ariaLabel: "Reports and conversational chat",
    },
    {
      href: "/pills",
      label: "Pill Analyzer",
      icon: Pill,
      active: isPillsActive,
      ariaLabel: "Pill identification and safety analysis",
    },
    {
      href: "/timeline",
      label: "Timeline",
      icon: Clock,
      active: isTimelineActive,
      ariaLabel: "Health history timeline and report comparison",
    },
  ];

  return (
    <nav
      aria-label="Main Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-slate-300 shadow-lg px-2 py-1 safe-area-bottom"
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
              className={`flex flex-col items-center justify-center flex-1 py-2 px-1 min-h-[56px] min-w-[48px] rounded-lg transition-colors font-medium ${
                tab.active
                  ? "text-blue-900 bg-blue-100 font-bold border-b-4 border-blue-900"
                  : "text-slate-700 hover:text-blue-800 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-7 h-7 mb-1" strokeWidth={tab.active ? 2.5 : 2} />
              <span className="text-base text-center leading-tight">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
