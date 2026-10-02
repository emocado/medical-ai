import React from "react";
import { useCurrentFrame } from "remotion";
import { Copy, Mail, MessageSquare, Printer, Share2 } from "lucide-react";
import { c, font } from "../theme";
import { ramp, Screen, Tap } from "../ui";

export const VISIT_DURATION = 330;
const SHARE_AT = 236;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, borderTop: `2px solid ${c.slate900}`, paddingTop: 10 }}>
      <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase", color: c.slate700 }}>{title}</span>
      {children}
    </div>
  );
}

const Row = ({ left, right }: { left: React.ReactNode; right: React.ReactNode }) => (
  <div style={{ display: "flex", flexDirection: "column", fontSize: 17, lineHeight: 1.35 }}>
    <span style={{ fontWeight: 700 }}>{left}</span>
    <span style={{ color: c.slate700 }}>{right}</span>
  </div>
);

const mono = (s: string) => <span style={{ fontFamily: font.mono }}>{s}</span>;

/** The one-page sheet to show, print or send before an appointment. */
export function VisitScene() {
  const frame = useCurrentFrame();
  const sheetUp = ramp(frame, SHARE_AT + 6, SHARE_AT + 22);

  return (
    <Screen
      title="For My Doctor"
      tab="today"
      scrollY={ramp(frame, 40, 170, 0, 640) - ramp(frame, 190, 222, 0, 640)}
      overlay={
        <>
          <Tap x={258} y={150} at={SHARE_AT} />
          {frame >= SHARE_AT && (
            <div style={{ position: "absolute", inset: 0, background: `rgba(15,23,42,${0.45 * sheetUp})`, zIndex: 30 }}>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: c.white,
                  borderRadius: "22px 22px 0 0",
                  padding: "14px 20px 34px",
                  transform: `translateY(${(1 - sheetUp) * 100}%)`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                <span style={{ width: 44, height: 5, borderRadius: 3, background: c.slate300, alignSelf: "center" }} />
                <span style={{ fontSize: 17, color: c.slate600 }}>Health summary · Lim Siew Lan · 2 Oct 2026</span>
                <div style={{ display: "flex", justifyContent: "space-around" }}>
                  {[
                    { Icon: MessageSquare, label: "Messages" },
                    { Icon: Mail, label: "Mail" },
                    { Icon: Copy, label: "Copy" },
                  ].map(({ Icon, label }) => (
                    <span key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, fontSize: 15 }}>
                      <span
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 16,
                          background: c.blue100,
                          color: c.blue900,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon size={28} />
                      </span>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      }
    >
      <div style={{ display: "flex", gap: 10 }}>
        {[
          { Icon: Printer, label: "Print", primary: false },
          { Icon: Share2, label: "Share with family or doctor", primary: true },
        ].map(({ Icon, label, primary }) => (
          <span
            key={label}
            style={{
              flex: primary ? 2 : 1,
              minHeight: 56,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              fontWeight: 800,
              fontSize: 16,
              lineHeight: 1.2,
              padding: "0 10px",
              textAlign: "center",
              background: primary ? c.blue800 : c.white,
              color: primary ? c.white : c.blue900,
              border: `2px solid ${c.blue800}`,
            }}
          >
            <Icon size={22} style={{ flexShrink: 0 }} /> {label}
          </span>
        ))}
      </div>

      <div
        style={{
          background: c.white,
          border: `1px solid ${c.slate300}`,
          boxShadow: "0 8px 24px rgba(15,23,42,.10)",
          borderRadius: 6,
          padding: "18px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div>
          <div style={{ fontSize: 26, fontWeight: 800 }}>Health summary</div>
          <div style={{ fontSize: 16, color: c.slate600 }}>Lim Siew Lan · prepared 2 Oct 2026</div>
        </div>
        <Section title="Current medicines">
          <Row left="Metformin 500 mg" right="1 tablet twice daily · morning, evening" />
          <Row left="Amlodipine 5 mg" right="1 tablet once daily · morning" />
          <Row left="Atorvastatin 20 mg" right="1 tablet at night · night" />
        </Section>
        <Section title="Latest results outside the normal range (10 Sep 2026)">
          <Row left="HbA1c" right={<>{mono("7.0 %")} · range {mono("4.0–6.0")}</>} />
          <Row left="Fasting glucose" right={<>{mono("6.4 mmol/L")} · {mono("3.9–6.0")}</>} />
          <Row left="LDL cholesterol" right={<>{mono("3.0 mmol/L")} · {mono("< 2.6")}</>} />
          <Row left="eGFR" right={<>{mono("64")} · {mono("> 90")}</>} />
        </Section>
        <Section title="Changes since 12 Mar 2026">
          <Row left="HbA1c" right={<>{mono("7.9 → 7.0")} · better</>} />
          <Row left="LDL cholesterol" right={<>{mono("4.1 → 3.0")} · better</>} />
          <Row left="eGFR" right={<>{mono("68 → 64")} · worse</>} />
        </Section>
        <Section title="Questions to ask">
          <span style={{ fontSize: 17 }}>• Is my kidney function getting worse?</span>
          <span style={{ fontSize: 17 }}>• Should my diabetes medicine change?</span>
        </Section>
        <Section title="My own notes">
          <span style={{ fontSize: 17, color: c.slate700 }}>Ankles a bit swollen in the evening since August.</span>
        </Section>
      </div>
    </Screen>
  );
}
