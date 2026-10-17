"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Pill, Clock, Home, HeartPulse } from "lucide-react";
import { useT } from "./LanguageProvider";

function useNavTabs() {
  const pathname = usePathname();
  const t = useT();

  return [
    {
      href: "/today",
      label: t("nav.today"),
      icon: Home,
      active: pathname === "/" || pathname.startsWith("/today") || pathname.startsWith("/visit"),
      ariaLabel: t("nav.today.aria"),
    },
    {
      href: "/reports",
      label: t("nav.reports"),
      icon: FileText,
      active: pathname.startsWith("/reports"),
      ariaLabel: t("nav.reports.aria"),
    },
    {
      href: "/medicines",
      label: t("nav.medicines"),
      icon: Pill,
      active: pathname.startsWith("/medicines") || pathname.startsWith("/pills"),
      ariaLabel: t("nav.medicines.aria"),
    },
    {
      href: "/timeline",
      label: t("nav.timeline"),
      icon: Clock,
      active: pathname.startsWith("/timeline"),
      ariaLabel: t("nav.timeline.aria"),
    },
  ];
}

/** Phone and tablet: translucent tab bar pinned to the bottom edge. */
export function BottomNav() {
  const t = useT();
  const tabs = useNavTabs();

  return (
    <nav
      aria-label={t("nav.main.aria")}
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 material border-t border-black/10 pb-safe print:hidden"
    >
      <div className="max-w-xl mx-auto flex justify-around items-stretch px-1 pt-1.5 pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.ariaLabel}
              aria-current={tab.active ? "page" : undefined}
              className={`group flex flex-col items-center justify-center gap-0.5 flex-1 basis-0 min-w-0 min-h-[60px] px-0.5 rounded-2xl transition-colors duration-150 ${
                tab.active ? "text-accent font-semibold" : "text-ink-secondary font-medium"
              }`}
            >
              <span
                className={`flex items-center justify-center w-16 h-8 rounded-full transition-colors duration-150 ${
                  tab.active ? "bg-accent-soft" : "group-hover:bg-black/5"
                }`}
              >
                <Icon className="w-6 h-6" strokeWidth={tab.active ? 2.4 : 1.9} aria-hidden="true" />
              </span>
              <span className="text-sm text-center leading-tight break-words max-w-full">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** Desktop: a fixed sidebar replaces the bottom tab bar. */
export function Sidebar() {
  const t = useT();
  const tabs = useNavTabs();

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-[var(--sidebar-width)] flex-col material border-r border-black/[0.08] print:hidden">
      <Link
        href="/today"
        className="flex items-center gap-3 px-6 pt-8 pb-6 rounded-2xl"
        aria-label="HealthMate"
      >
        <span className="flex items-center justify-center w-11 h-11 rounded-[14px] bg-gradient-to-b from-[#ff6b6b] to-[#e5383b] shadow-button">
          <HeartPulse className="w-6 h-6 text-white" strokeWidth={2.2} aria-hidden="true" />
        </span>
        <span className="text-xl font-bold text-ink tracking-tight">HealthMate</span>
      </Link>

      <nav aria-label={t("nav.main.aria")} className="flex-1 px-3">
        <ul className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  aria-label={tab.ariaLabel}
                  aria-current={tab.active ? "page" : undefined}
                  className={`flex items-center gap-3 min-h-[52px] px-4 rounded-xl text-lg transition-colors duration-150 ${
                    tab.active
                      ? "bg-accent-soft text-accent-ink font-semibold"
                      : "text-ink-secondary font-medium hover:bg-black/5 hover:text-ink"
                  }`}
                >
                  <Icon className="w-6 h-6 flex-shrink-0" strokeWidth={tab.active ? 2.4 : 1.9} aria-hidden="true" />
                  <span className="truncate">{tab.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
