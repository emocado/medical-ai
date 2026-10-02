import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { Clock, FileText, HeartPulse, House, Pill } from "lucide-react";
import { c, font, SCREEN } from "./theme";

export type Lang = "en" | "bm" | "zh" | "ta";
export type Tab = "today" | "reports" | "medicines" | "timeline";

const ease = Easing.bezier(0.22, 1, 0.36, 1);

/** Opacity + upward slide starting at `start`. */
export function fadeUp(frame: number, start: number, dur = 14, dist = 22): React.CSSProperties {
  const t = interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  return { opacity: t, transform: `translateY(${(1 - t) * dist}px)` };
}

export function fadeOut(frame: number, start: number, dur = 10): number {
  return interpolate(frame, [start, start + dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
}

export function useSpringAt(start: number, damping = 14) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - start, fps, config: { damping, mass: 0.7 } });
}

export function ramp(frame: number, a: number, b: number, from = 0, to = 1) {
  return interpolate(frame, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
}

const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "bm", label: "BM" },
  { code: "zh", label: "中文" },
  { code: "ta", label: "தமிழ்" },
];

function StatusBar({ dark }: { dark?: boolean }) {
  const col = dark ? c.white : c.slate900;
  return (
    <div
      style={{
        height: 40,
        padding: "0 26px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: font.body,
        fontWeight: 700,
        fontSize: 15,
        color: col,
        background: c.blue900,
      }}
    >
      <span style={{ color: c.white }}>9:41</span>
      <span style={{ display: "flex", gap: 5, alignItems: "flex-end" }}>
        {[6, 9, 12, 15].map((h) => (
          <span key={h} style={{ width: 3.5, height: h, background: c.white, borderRadius: 1 }} />
        ))}
        <span style={{ width: 24, height: 12, border: `1.5px solid ${c.white}`, borderRadius: 3, marginLeft: 6, padding: 1.5 }}>
          <span style={{ display: "block", width: "75%", height: "100%", background: c.white, borderRadius: 1 }} />
        </span>
      </span>
    </div>
  );
}

export function AppHeader({ title, lang = "en" }: { title: string; lang?: Lang }) {
  return (
    <div
      style={{
        background: c.blue900,
        color: c.white,
        padding: "8px 14px 12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 6,
        boxShadow: "0 2px 6px rgba(15,23,42,.25)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
        <HeartPulse size={26} color={c.red300} />
        <span style={{ fontFamily: font.body, fontWeight: 700, fontSize: 19, whiteSpace: "nowrap" }}>{title}</span>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {LANGS.map((l) => {
          const on = l.code === lang;
          return (
            <span
              key={l.code}
              style={{
                minWidth: 40,
                height: 40,
                padding: "0 6px",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: font.body,
                fontWeight: 700,
                fontSize: l.code === "ta" ? 12 : 15,
                background: on ? c.white : c.blue800,
                color: on ? c.blue950 : c.white,
                boxShadow: on ? "0 1px 3px rgba(0,0,0,.25)" : undefined,
              }}
            >
              {l.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

const NAV_LABELS: Record<Lang, Record<Tab, string>> = {
  en: { today: "Today", reports: "Reports & Chat", medicines: "Medicines", timeline: "Timeline" },
  bm: { today: "Hari Ini", reports: "Laporan & Sembang", medicines: "Ubat", timeline: "Garis Masa" },
  zh: { today: "今天", reports: "报告与问答", medicines: "药物", timeline: "时间线" },
  ta: { today: "இன்று", reports: "அறிக்கை", medicines: "மருந்து", timeline: "வரலாறு" },
};

export function BottomNav({ active, lang = "en" }: { active: Tab; lang?: Lang }) {
  const tabs: { id: Tab; Icon: typeof House }[] = [
    { id: "today", Icon: House },
    { id: "reports", Icon: FileText },
    { id: "medicines", Icon: Pill },
    { id: "timeline", Icon: Clock },
  ];
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        background: c.white,
        borderTop: `2px solid ${c.slate300}`,
        padding: "4px 0 18px",
        display: "flex",
        boxShadow: "0 -4px 12px rgba(15,23,42,.08)",
      }}
    >
      {tabs.map(({ id, Icon }) => {
        const on = id === active;
        return (
          <div
            key={id}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px 0 6px",
              borderRadius: 8,
              background: on ? c.blue100 : "transparent",
              borderBottom: on ? `4px solid ${c.blue900}` : "4px solid transparent",
              color: on ? c.blue900 : c.slate700,
              fontFamily: font.body,
              fontWeight: on ? 700 : 500,
              fontSize: 14,
              margin: "0 2px",
            }}
          >
            <Icon size={26} strokeWidth={on ? 2.5 : 2} />
            <span style={{ marginTop: 3, whiteSpace: "nowrap" }}>{NAV_LABELS[lang][id]}</span>
          </div>
        );
      })}
    </div>
  );
}

/** One phone screen at the app's real 390px width. */
export function Screen({
  title,
  lang = "en",
  tab,
  scrollY = 0,
  children,
  overlay,
}: {
  title: string;
  lang?: Lang;
  tab: Tab;
  scrollY?: number;
  children: React.ReactNode;
  overlay?: React.ReactNode;
}) {
  return (
    <div
      style={{
        width: SCREEN.w,
        height: SCREEN.h,
        position: "relative",
        overflow: "hidden",
        background: c.slate50,
        fontFamily: font.body,
        color: c.slate900,
      }}
    >
      <div style={{ position: "relative", zIndex: 2 }}>
        <StatusBar dark />
        <AppHeader title={title} lang={lang} />
      </div>
      <div style={{ position: "absolute", top: 104, left: 0, right: 0, bottom: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "18px 16px 120px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            transform: `translateY(${-scrollY}px)`,
          }}
        >
          {children}
        </div>
      </div>
      <BottomNav active={tab} lang={lang} />
      {overlay}
    </div>
  );
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: c.white,
        border: `2px solid ${c.slate300}`,
        borderRadius: 16,
        padding: 16,
        boxShadow: "0 1px 2px rgba(15,23,42,.06)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export type Status = "high" | "low" | "normal" | "critical" | "unknown";

const STATUS_STYLE: Record<Status, { bg: string; fg: string; border: string }> = {
  high: { bg: c.amber50, fg: c.amber950, border: c.amber300 },
  low: { bg: c.amber50, fg: c.amber950, border: c.amber300 },
  normal: { bg: c.emerald50, fg: c.emerald950, border: "#6ee7b7" },
  critical: { bg: c.red50, fg: c.red950, border: c.red600 },
  unknown: { bg: c.slate100, fg: c.slate800, border: c.slate300 },
};

export const STATUS_LABEL: Record<Lang, Record<Status, string>> = {
  en: { high: "HIGH", low: "LOW", normal: "NORMAL", critical: "URGENT", unknown: "ASK DOCTOR" },
  bm: { high: "TINGGI", low: "RENDAH", normal: "NORMAL", critical: "SEGERA", unknown: "TANYA DOKTOR" },
  zh: { high: "偏高", low: "偏低", normal: "正常", critical: "危急", unknown: "请问医生" },
  ta: { high: "அதிகம்", low: "குறைவு", normal: "இயல்பு", critical: "அவசரம்", unknown: "மருத்துவரிடம் கேளுங்கள்" },
};

export function Chip({
  status,
  children,
  style,
}: {
  status: Status;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const s = STATUS_STYLE[status];
  return (
    <span
      style={{
        padding: "3px 10px",
        borderRadius: 999,
        background: s.bg,
        color: s.fg,
        border: `2px solid ${s.border}`,
        fontWeight: 800,
        fontSize: 14,
        letterSpacing: 0.4,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/** A finger-tap ripple at (x, y) in screen coordinates. */
export function Tap({ x, y, at }: { x: number; y: number; at: number }) {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < -8 || t > 22) return null;
  const press = interpolate(t, [-8, 0, 6], [0, 1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ring = interpolate(t, [0, 22], [0.6, 2.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ringOpacity = interpolate(t, [0, 22], [0.7, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dotOpacity = interpolate(t, [-8, 0, 12, 22], [0, 0.85, 0.85, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: x - 26, top: y - 26, width: 52, height: 52, zIndex: 50, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: `3px solid ${c.blue700}`,
          transform: `scale(${ring})`,
          opacity: t >= 0 ? ringOpacity : 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 6,
          borderRadius: "50%",
          background: "rgba(30,64,175,.35)",
          border: `2px solid rgba(255,255,255,.9)`,
          transform: `scale(${0.6 + press * 0.4})`,
          opacity: dotOpacity,
        }}
      />
    </div>
  );
}

/** Renders a 390×844 screen at 2× into the portrait composition. */
export function PhoneCanvas({ children }: { children: React.ReactNode }) {
  return (
    <AbsoluteFill style={{ background: c.slate50 }}>
      <div style={{ width: SCREEN.w, height: SCREEN.h, transform: "scale(2)", transformOrigin: "top left" }}>{children}</div>
    </AbsoluteFill>
  );
}

/** Animated three-dot "working" indicator. */
export function Dots({ color = c.blue800 }: { color?: string }) {
  const frame = useCurrentFrame();
  return (
    <span style={{ display: "inline-flex", gap: 5, marginLeft: 8 }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: color,
            opacity: 0.3 + 0.7 * Math.max(0, Math.sin((frame - i * 5) / 5)),
          }}
        />
      ))}
    </span>
  );
}
