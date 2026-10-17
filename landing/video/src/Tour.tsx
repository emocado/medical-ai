import React from "react";
import { AbsoluteFill, Freeze, interpolate, Sequence, useCurrentFrame } from "remotion";
import { HeartPulse } from "lucide-react";
import { brand, font, SCREEN } from "./theme";
import { ramp } from "./ui";
import { ReportScene, REPORT_DURATION } from "./scenes/ReportScene";
import { UrgentScene, URGENT_DURATION } from "./scenes/UrgentScene";
import { MedsScene, MEDS_DURATION } from "./scenes/MedsScene";
import { TrendScene, TREND_DURATION } from "./scenes/TrendScene";
import { VoiceScene, VOICE_DURATION } from "./scenes/VoiceScene";
import { VisitScene, VISIT_DURATION } from "./scenes/VisitScene";

const INTRO = 105;
const OUTRO = 150;

type Step = {
  id: string;
  label: string;
  title: React.ReactNode;
  body: string;
  Scene: React.FC;
  duration: number;
};

const Mark = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{
      backgroundImage: `linear-gradient(transparent 58%, ${brand.highlight} 58%, ${brand.highlight} 92%, transparent 92%)`,
      padding: "0 4px",
      margin: "0 -4px",
    }}
  >
    {children}
  </span>
);

const STEPS: Step[] = [
  {
    id: "report",
    label: "Reports",
    title: (
      <>
        Snap the report. Read it in <Mark>your language.</Mark>
      </>
    ),
    body: "Every result keeps the lab’s own normal range. The summary comes in English, Bahasa Malaysia, 中文 and தமிழ்.",
    Scene: ReportScene,
    duration: REPORT_DURATION,
  },
  {
    id: "urgent",
    label: "Safety",
    title: (
      <>
        A worrying result is <Mark>never buried.</Mark>
      </>
    ),
    body: "Fixed rules for potassium, sodium, glucose and more raise a red alert on the home screen, with a one-tap call to 999.",
    Scene: UrgentScene,
    duration: URGENT_DURATION,
  },
  {
    id: "meds",
    label: "Medicines",
    title: (
      <>
        Doses come from the label. <Mark>Nothing is guessed.</Mark>
      </>
    ),
    body: "Each new medicine is checked against the ones you already take. Then you get a simple checklist for the day.",
    Scene: MedsScene,
    duration: MEDS_DURATION,
  },
  {
    id: "trend",
    label: "Timeline",
    title: (
      <>
        See if things are <Mark>getting better.</Mark>
      </>
    ),
    body: "Changes are worked out from the lab’s own numbers, across every report you have saved.",
    Scene: TrendScene,
    duration: TREND_DURATION,
  },
  {
    id: "voice",
    label: "Voice",
    title: (
      <>
        Just ask, <Mark>out loud.</Mark>
      </>
    ),
    body: "Speak naturally. HealthMate answers when you pause, using your latest report and medicines.",
    Scene: VoiceScene,
    duration: VOICE_DURATION,
  },
  {
    id: "visit",
    label: "Doctor visit",
    title: (
      <>
        Walk in with <Mark>one clear page.</Mark>
      </>
    ),
    body: "Medicines, results, changes and your own questions on one sheet to show, print or send to family.",
    Scene: VisitScene,
    duration: VISIT_DURATION,
  },
];

const starts = STEPS.reduce<number[]>((acc, s, i) => [...acc, i === 0 ? INTRO : acc[i - 1] + STEPS[i - 1].duration], []);
export const TOUR_DURATION = starts[starts.length - 1] + STEPS[STEPS.length - 1].duration + OUTRO;
const OUTRO_AT = TOUR_DURATION - OUTRO;

const PHONE_SCALE = 1.06;
const BEZEL = 13;

function Phone({ children, frame }: { children: React.ReactNode; frame: number }) {
  const enter = ramp(frame, 40, 80);
  const leave = ramp(frame, OUTRO_AT, OUTRO_AT + 24);
  const w = SCREEN.w * PHONE_SCALE + BEZEL * 2;
  const h = SCREEN.h * PHONE_SCALE + BEZEL * 2;
  return (
    <div
      style={{
        position: "absolute",
        left: 1170,
        top: (1080 - h) / 2,
        width: w,
        height: h,
        borderRadius: 66,
        background: "#0b1020",
        padding: BEZEL,
        boxShadow: "0 50px 90px -30px rgba(12,26,58,.55), 0 0 0 2px #2a3350 inset",
        transform: `translateY(${(1 - enter) * 120 + leave * 60}px) rotate(${(1 - enter) * 4}deg)`,
        opacity: enter * (1 - leave),
      }}
    >
      <div style={{ width: SCREEN.w * PHONE_SCALE, height: SCREEN.h * PHONE_SCALE, borderRadius: 53, overflow: "hidden", position: "relative" }}>
        <div style={{ width: SCREEN.w, height: SCREEN.h, transform: `scale(${PHONE_SCALE})`, transformOrigin: "top left" }}>{children}</div>
        <div
          style={{
            position: "absolute",
            top: 9,
            left: "50%",
            width: 104,
            height: 30,
            marginLeft: -52,
            borderRadius: 20,
            background: "#000",
          }}
        />
      </div>
    </div>
  );
}

function Background() {
  return (
    <AbsoluteFill
      style={{
        background: brand.paper,
        backgroundImage:
          "linear-gradient(rgba(29,78,216,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(29,78,216,.07) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }}
    />
  );
}

function Logo({ size = 40 }: { size?: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: size * 0.3, fontFamily: font.display, fontWeight: 800, fontSize: size, color: brand.ink }}>
      <HeartPulse size={size * 1.15} color="#dc2626" strokeWidth={2.4} />
      HealthMate
    </span>
  );
}

const HELLO = ["Your report, explained.", "Laporan anda, diterangkan.", "您的报告，讲清楚。", "உங்கள் அறிக்கை, விளக்கமாக."];

function Intro({ frame }: { frame: number }) {
  const out = ramp(frame, INTRO - 14, INTRO);
  const idx = Math.min(HELLO.length - 1, Math.floor(frame / 26));
  return (
    <div style={{ position: "absolute", left: 140, top: 300, width: 940, opacity: 1 - out }}>
      <div style={{ opacity: ramp(frame, 0, 12) }}>
        <Logo size={46} />
      </div>
      <div
        style={{
          marginTop: 40,
          fontFamily: font.display,
          fontWeight: 800,
          fontSize: 92,
          lineHeight: 1.02,
          letterSpacing: -2,
          color: brand.ink,
          opacity: ramp(frame, 6, 20),
        }}
      >
        A health companion for older adults.
      </div>
      <div style={{ marginTop: 36, fontFamily: font.body, fontSize: 40, color: brand.accent, fontWeight: 700, height: 56 }}>{HELLO[idx]}</div>
    </div>
  );
}

function Caption({ frame }: { frame: number }) {
  const active = STEPS.findIndex((_, i) => frame >= starts[i] && frame < starts[i] + STEPS[i].duration);
  if (active < 0) return null;
  const step = STEPS[active];
  const local = frame - starts[active];
  const inT = ramp(local, 0, 16);
  const outT = ramp(local, step.duration - 12, step.duration);
  return (
    <div
      style={{
        position: "absolute",
        left: 140,
        top: 250,
        width: 900,
        opacity: inT * (1 - outT),
        transform: `translateY(${(1 - inT) * 30}px)`,
      }}
    >
      <div
        style={{
          fontFamily: font.mono,
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: 3,
          color: brand.accent,
          textTransform: "uppercase",
        }}
      >
        {String(active + 1).padStart(2, "0")} / {STEPS.length} · {step.label}
      </div>
      <div
        style={{
          marginTop: 22,
          fontFamily: font.display,
          fontWeight: 800,
          fontSize: 84,
          lineHeight: 1.04,
          letterSpacing: -1.5,
          color: brand.ink,
        }}
      >
        {step.title}
      </div>
      <div style={{ marginTop: 30, fontFamily: font.body, fontSize: 36, lineHeight: 1.45, color: brand.inkSoft, maxWidth: 820 }}>{step.body}</div>
    </div>
  );
}

function Progress({ frame }: { frame: number }) {
  const show = ramp(frame, INTRO - 10, INTRO + 10) * (1 - ramp(frame, OUTRO_AT, OUTRO_AT + 16));
  return (
    <div style={{ position: "absolute", left: 140, bottom: 110, display: "flex", gap: 14, opacity: show }}>
      {STEPS.map((s, i) => {
        const p = interpolate(frame, [starts[i], starts[i] + s.duration], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const on = p > 0 && p < 1;
        return (
          <div key={s.id} style={{ width: 128, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ height: 6, borderRadius: 3, background: "rgba(12,26,58,.12)", overflow: "hidden" }}>
              <div style={{ width: `${p * 100}%`, height: "100%", background: brand.accent }} />
            </div>
            <span style={{ fontFamily: font.body, fontSize: 22, fontWeight: 700, color: on ? brand.ink : brand.inkSoft, opacity: on ? 1 : 0.7 }}>
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Outro({ frame }: { frame: number }) {
  const local = frame - OUTRO_AT;
  if (local < 0) return null;
  const t = ramp(local, 16, 36);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: t, textAlign: "center" }}>
      <Logo size={64} />
      <div
        style={{
          marginTop: 36,
          fontFamily: font.display,
          fontWeight: 800,
          fontSize: 78,
          lineHeight: 1.08,
          letterSpacing: -1.5,
          color: brand.ink,
          maxWidth: 1300,
        }}
      >
        Clear answers, in your language, with a <Mark>safe next step.</Mark>
      </div>
      <div style={{ marginTop: 40, fontFamily: font.body, fontSize: 28, color: brand.inkSoft }}>
        Research prototype · Not a medical device · Always check with your doctor
      </div>
    </AbsoluteFill>
  );
}

/** The full landscape walkthrough: captions on the left, the app on the right. */
export function Tour() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ fontFamily: font.body }}>
      <Background />
      {frame < INTRO && <Intro frame={frame} />}
      <Caption frame={frame} />
      <Progress frame={frame} />
      <Phone frame={frame}>
        {frame < INTRO && (
          <Freeze frame={0}>
            <ReportScene />
          </Freeze>
        )}
        {STEPS.map((s, i) => (
          <Sequence key={s.id} from={starts[i]} durationInFrames={i === STEPS.length - 1 ? s.duration + OUTRO : s.duration} layout="none">
            <div style={{ position: "absolute", inset: 0 }}>
              <s.Scene />
            </div>
          </Sequence>
        ))}
      </Phone>
      <Outro frame={frame} />
    </AbsoluteFill>
  );
}
