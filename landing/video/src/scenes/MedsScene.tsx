import React from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { CircleCheck, Circle, Moon, Plus, Sunrise, Sunset, TriangleAlert } from "lucide-react";
import { c } from "../theme";
import { Card, Dots, fadeOut, fadeUp, ramp, Screen, Tap, useSpringAt } from "../ui";

export const MEDS_DURATION = 450;
const CHECKLIST_AT = 300;

function ScanView() {
  const frame = useCurrentFrame();
  const scanning = frame < 78;
  const scanY = (frame % 36) / 36;
  const warn = useSpringAt(162, 13);
  return (
    <Screen
      title="Medicines"
      tab="medicines"
      scrollY={ramp(frame, 150, 172, 0, 330)}
      overlay={<Tap x={195} y={642} at={142} />}
    >
      <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Scan a medicine</h2>
      <div
        style={{
          background: c.slate900,
          borderRadius: 18,
          height: 270,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Img
          src={staticFile("pill-clarithromycin.png")}
          style={{ width: 300, borderRadius: 6, transform: `rotate(-2deg) scale(${1 + ramp(frame, 0, 60) * 0.04})` }}
        />
        {[
          { top: 16, left: 16, b: "borderTop borderLeft" },
          { top: 16, right: 16, b: "borderTop borderRight" },
          { bottom: 16, left: 16, b: "borderBottom borderLeft" },
          { bottom: 16, right: 16, b: "borderBottom borderRight" },
        ].map(({ b, ...pos }, i) => {
          const style: React.CSSProperties = { position: "absolute", width: 34, height: 34, ...pos };
          for (const side of b.split(" ")) (style as Record<string, string>)[side] = `4px solid ${c.white}`;
          return <span key={i} style={style} />;
        })}
        {scanning && (
          <div
            style={{
              position: "absolute",
              left: 24,
              right: 24,
              top: `${10 + scanY * 80}%`,
              height: 3,
              background: "#60a5fa",
              boxShadow: "0 0 16px 4px rgba(96,165,250,.7)",
            }}
          />
        )}
      </div>
      {scanning ? (
        <span style={{ fontSize: 19, fontWeight: 700, color: c.blue900, display: "flex", alignItems: "center" }}>
          Reading the label
          <Dots />
        </span>
      ) : (
        <Card style={fadeUp(frame, 80)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>Clarithromycin</div>
              <div style={{ fontSize: 18, color: c.slate600 }}>500 mg · antibiotic</div>
            </div>
            <span
              style={{
                background: c.emerald100,
                color: c.emerald950,
                borderRadius: 999,
                padding: "4px 12px",
                fontWeight: 700,
                fontSize: 15,
                whiteSpace: "nowrap",
              }}
            >
              High confidence
            </span>
          </div>
          <div style={{ background: c.slate100, borderRadius: 12, padding: "10px 12px" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: c.slate600, letterSpacing: 0.5 }}>DOSE, AS PRINTED ON THE LABEL</div>
            <div style={{ fontSize: 19, fontWeight: 700, marginTop: 2 }}>Take 1 tablet twice daily for 7 days.</div>
          </div>
          <div
            style={{
              background: c.blue800,
              color: c.white,
              borderRadius: 12,
              minHeight: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontSize: 20,
              fontWeight: 800,
              ...fadeUp(frame, 96),
            }}
          >
            <Plus size={24} /> Add to my medicines
          </div>
        </Card>
      )}
      {frame >= 158 && (
        <section
          style={{
            transform: `scale(${0.9 + warn * 0.1})`,
            opacity: Math.min(1, warn * 1.5),
            border: `4px solid ${c.red600}`,
            background: c.red50,
            borderRadius: 16,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            color: c.red950,
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ background: c.red700, color: c.white, borderRadius: 999, padding: "3px 12px", fontWeight: 800, fontSize: 15 }}>
              Serious
            </span>
            <span style={{ fontWeight: 800, fontSize: 17, color: c.red900 }}>Known dangerous combination</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
            <TriangleAlert size={26} color={c.red700} />
            Clarithromycin + Atorvastatin
          </div>
          <p style={{ margin: 0, fontSize: 17.5, lineHeight: 1.5, ...fadeUp(frame, 178) }}>
            This antibiotic can raise the statin level in your blood and cause serious muscle damage. Ask your doctor or
            pharmacist today whether to pause the statin while taking the antibiotic.
          </p>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: c.red900, ...fadeUp(frame, 200) }}>
            Never stop a medicine on your own.
          </p>
        </section>
      )}
    </Screen>
  );
}

const SLOTS = [
  { slot: "Morning", Icon: Sunrise, meds: [{ name: "Metformin 500 mg", at: -1 }, { name: "Amlodipine 5 mg", at: 34 }] },
  { slot: "Evening", Icon: Sunset, meds: [{ name: "Metformin 500 mg", at: 74 }] },
  { slot: "Night", Icon: Moon, meds: [{ name: "Atorvastatin 20 mg", at: 9999 }] },
];

function ChecklistView() {
  const frame = useCurrentFrame() - CHECKLIST_AT;
  const taken = 1 + (frame >= 34 ? 1 : 0) + (frame >= 74 ? 1 : 0);
  return (
    <Screen
      title="Today"
      tab="today"
      overlay={
        <>
          <Tap x={195} y={362} at={CHECKLIST_AT + 34} />
          <Tap x={195} y={466} at={CHECKLIST_AT + 74} />
        </>
      }
    >
      <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>Good morning</h2>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 22, fontWeight: 700 }}>Today&apos;s medicines</span>
          <span
            style={{
              background: taken === 4 ? c.emerald100 : c.blue100,
              color: c.blue950,
              borderRadius: 999,
              padding: "3px 12px",
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            {taken} of 4 taken today
          </span>
        </div>
        {SLOTS.map(({ slot, Icon, meds }) => (
          <div key={slot} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 19, fontWeight: 700, color: c.slate800, display: "flex", gap: 8, alignItems: "center" }}>
              <Icon size={20} color={c.amber600} /> {slot}
            </span>
            {meds.map((m) => {
              const on = frame >= m.at;
              return (
                <div
                  key={m.name}
                  style={{
                    border: `2px solid ${on ? c.emerald500 : c.slate300}`,
                    background: on ? c.emerald50 : c.white,
                    color: on ? c.emerald950 : c.slate900,
                    borderRadius: 12,
                    padding: 12,
                    minHeight: 56,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    fontSize: 20,
                    fontWeight: 700,
                    transform: `scale(${frame >= m.at && frame < m.at + 6 ? 0.97 : 1})`,
                  }}
                >
                  {on ? <CircleCheck size={32} color={c.emerald600} /> : <Circle size={32} color={c.slate400} />}
                  {m.name}
                </div>
              );
            })}
          </div>
        ))}
      </Card>
    </Screen>
  );
}

/** Scan a label, catch a dangerous combination, tick off today's doses. */
export function MedsScene() {
  const frame = useCurrentFrame();
  const t = ramp(frame, CHECKLIST_AT - 8, CHECKLIST_AT + 6);
  return (
    <div style={{ position: "relative", width: 390, height: 844, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: fadeOut(frame, CHECKLIST_AT - 8, 14) }}>
        <ScanView />
      </div>
      {frame >= CHECKLIST_AT - 8 && (
        <div style={{ position: "absolute", inset: 0, opacity: t }}>
          <ChecklistView />
        </div>
      )}
    </div>
  );
}
