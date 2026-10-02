import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { CircleCheck, Circle, FileText, Phone, Siren, Sunrise } from "lucide-react";
import { c, font } from "../theme";
import { Card, Chip, fadeUp, ramp, Screen, Tap, useSpringAt } from "../ui";

export const URGENT_DURATION = 300;
const CUT = 104;

function TodayView() {
  const frame = useCurrentFrame();
  const drop = useSpringAt(28, 11);
  const pulse = 0.5 + 0.5 * Math.sin(frame / 4);
  return (
    <Screen title="Today" tab="today" overlay={<Tap x={195} y={262} at={88} />}>
      <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, ...fadeUp(frame, 0, 10) }}>Good morning</h2>
      <div
        style={{
          transform: `translateY(${(1 - drop) * -40}px)`,
          opacity: Math.min(1, drop * 1.4),
          border: `4px solid ${c.red600}`,
          boxShadow: `0 0 0 ${pulse * 6}px rgba(220,38,38,${0.25 * pulse})`,
          background: c.red50,
          color: c.red950,
          borderRadius: 16,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <span style={{ fontSize: 20, fontWeight: 800, display: "flex", gap: 8, alignItems: "flex-start" }}>
          <Siren size={26} color={c.red700} style={{ flexShrink: 0, marginTop: 2 }} />
          Some results need medical attention soon
        </span>
        <span style={{ fontSize: 18, fontWeight: 700, textDecoration: "underline" }}>See the urgent result</span>
      </div>
      <Card style={fadeUp(frame, 6)}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 22, fontWeight: 700 }}>Today&apos;s medicines</span>
          <span style={{ background: c.blue100, color: c.blue950, borderRadius: 999, padding: "3px 12px", fontWeight: 700, fontSize: 16 }}>
            1 of 4 taken
          </span>
        </div>
        <span style={{ fontSize: 19, fontWeight: 700, color: c.slate800, display: "flex", gap: 8, alignItems: "center" }}>
          <Sunrise size={20} color={c.amber600} /> Morning
        </span>
        {[
          { name: "Metformin 500 mg", taken: true },
          { name: "Amlodipine 5 mg", taken: false },
        ].map((m) => (
          <div
            key={m.name}
            style={{
              border: `2px solid ${m.taken ? c.emerald500 : c.slate300}`,
              background: m.taken ? c.emerald50 : c.white,
              borderRadius: 12,
              padding: 12,
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            {m.taken ? <CircleCheck size={30} color={c.emerald600} /> : <Circle size={30} color={c.slate400} />}
            {m.name}
          </div>
        ))}
      </Card>
    </Screen>
  );
}

function ReportView() {
  const frame = useCurrentFrame();
  const local = frame - CUT;
  const shake = local > 6 && local < 26 ? Math.sin(local * 2.2) * interpolate(local, [6, 26], [7, 0]) : 0;
  const glow = local > 120 ? 0.5 + 0.5 * Math.sin(local / 5) : 0;
  return (
    <Screen title="Reports & Chat" tab="reports" overlay={<Tap x={195} y={735} at={CUT + 150} />}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", ...fadeUp(local, 0, 10) }}>
        <span style={{ fontSize: 22, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
          <FileText size={24} color={c.blue800} /> Lab report
        </span>
        <span style={{ fontSize: 17, color: c.slate600 }}>22 Sep 2026</span>
      </div>
      <section
        style={{
          ...fadeUp(local, 4, 12, 30),
          transform: `translateX(${shake}px) ${fadeUp(local, 4, 12, 30).transform}`,
          background: c.red50,
          border: `4px solid ${c.red600}`,
          borderRadius: 16,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: c.red900, display: "flex", gap: 8, alignItems: "flex-start" }}>
          <Siren size={28} color={c.red700} style={{ flexShrink: 0 }} />
          Some results need medical attention soon
        </h3>
        <p style={{ margin: 0, fontSize: 19, fontWeight: 700, color: c.red950, lineHeight: 1.45 }}>
          Please contact your doctor or clinic today and show them this report.
        </p>
        <div style={{ ...fadeUp(local, 26) }}>
          <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: c.red900 }}>Results that need attention:</p>
          <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 700, color: c.red950, fontFamily: font.body }}>
            • Potassium: <span style={{ fontFamily: font.mono }}>6.4 mmol/L</span>
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 700, color: c.red950 }}>
            • Glucose: <span style={{ fontFamily: font.mono }}>18.5 mmol/L</span>
          </p>
        </div>
        <p style={{ margin: 0, fontSize: 16, color: c.red950, lineHeight: 1.45, ...fadeUp(local, 40) }}>
          If you feel very unwell (chest pain, trouble breathing, confusion, weakness or fainting), call 999 or go to the
          nearest emergency department now.
        </p>
        <div
          style={{
            ...fadeUp(local, 52),
            background: c.red700,
            color: c.white,
            borderRadius: 12,
            minHeight: 58,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            fontSize: 21,
            fontWeight: 800,
            boxShadow: `0 0 0 ${glow * 8}px rgba(185,28,28,${0.3 * glow})`,
          }}
        >
          <Phone size={24} /> Call 999 (Emergency)
        </div>
      </section>
      <div
        style={{
          ...fadeUp(local, 64),
          background: c.white,
          border: `2px solid ${c.slate300}`,
          borderRadius: 14,
          padding: "10px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 19, fontWeight: 700 }}>
          Potassium <span style={{ fontFamily: font.mono }}>6.4</span>
        </span>
        <Chip status="critical">URGENT</Chip>
      </div>
    </Screen>
  );
}

/** A dangerous result is caught on the home screen and escalated with a call button. */
export function UrgentScene() {
  const frame = useCurrentFrame();
  const slide = ramp(frame, CUT - 6, CUT + 8);
  return (
    <div style={{ position: "relative", width: 390, height: 844, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${-slide * 30}%)`, opacity: 1 - slide }}>
        <TodayView />
      </div>
      {frame >= CUT - 6 && (
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${(1 - slide) * 100}%)` }}>
          <ReportView />
        </div>
      )}
    </div>
  );
}
