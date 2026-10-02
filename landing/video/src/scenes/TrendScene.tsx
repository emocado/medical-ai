import React from "react";
import { useCurrentFrame } from "remotion";
import { c, font } from "../theme";
import { Card, fadeUp, ramp, Screen, Tap } from "../ui";

export const TREND_DURATION = 330;

const W = 326;
const H = 210;
const PAD = { l: 34, r: 16, t: 14, b: 30 };
const Y_MIN = 4;
const Y_MAX = 9;
const POINTS = [
  { label: "Dec 2025", v: 8.3 },
  { label: "Mar 2026", v: 7.9 },
  { label: "Sep 2026", v: 7.0 },
];

const x = (i: number) => PAD.l + (i * (W - PAD.l - PAD.r)) / (POINTS.length - 1);
const y = (v: number) => PAD.t + ((Y_MAX - v) / (Y_MAX - Y_MIN)) * (H - PAD.t - PAD.b);

const CHANGES = [
  { name: "HbA1c", from: "7.9", to: "7.0", unit: "%", better: true },
  { name: "Fasting glucose", from: "7.8", to: "6.4", unit: "mmol/L", better: true },
  { name: "LDL cholesterol", from: "4.1", to: "3.0", unit: "mmol/L", better: true },
  { name: "eGFR", from: "68", to: "64", unit: "mL/min", better: false },
];

/** A per-test chart with the normal range shaded, then computed changes since last time. */
export function TrendScene() {
  const frame = useCurrentFrame();
  const draw = ramp(frame, 20, 80);
  const path = POINTS.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.v)}`).join(" ");
  const len = 300;

  return (
    <Screen title="Timeline" tab="timeline" scrollY={ramp(frame, 150, 180, 0, 150)} overlay={<Tap x={80} y={186} at={8} />}>
      <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Results over time</h2>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["HbA1c", "Glucose", "LDL", "eGFR"].map((n, i) => (
          <span
            key={n}
            style={{
              padding: "8px 14px",
              borderRadius: 12,
              fontSize: 18,
              fontWeight: 700,
              border: `2px solid ${i === 0 ? c.blue800 : c.slate300}`,
              background: i === 0 ? c.blue800 : c.white,
              color: i === 0 ? c.white : c.slate800,
            }}
          >
            {n}
          </span>
        ))}
      </div>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 21, fontWeight: 800 }}>HbA1c</span>
          <span style={{ fontSize: 16, color: c.slate600 }}>%</span>
        </div>
        <svg width={W} height={H} style={{ overflow: "visible" }}>
          <rect x={PAD.l} y={y(6)} width={W - PAD.l - PAD.r} height={y(4) - y(6)} fill={c.emerald50} />
          <line x1={PAD.l} x2={W - PAD.r} y1={y(6)} y2={y(6)} stroke={c.emerald600} strokeDasharray="5 5" strokeWidth={1.5} />
          <text x={W - PAD.r} y={y(6) + 18} textAnchor="end" fontSize={13} fontWeight={700} fill={c.emerald800} fontFamily={font.body}>
            Normal range 4.0 – 6.0
          </text>
          {[5, 6, 7, 8, 9].map((v) => (
            <g key={v}>
              <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke={c.slate300} strokeWidth={v === 6 ? 0 : 1} opacity={0.6} />
              <text x={PAD.l - 8} y={y(v) + 5} textAnchor="end" fontSize={13} fill={c.slate600} fontFamily={font.mono}>
                {v}
              </text>
            </g>
          ))}
          <path d={path} stroke={c.blue800} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
          {POINTS.map((p, i) => {
            const shown = draw >= i / (POINTS.length - 1) - 0.01;
            const last = i === POINTS.length - 1;
            return (
              <g key={p.label} opacity={shown ? 1 : 0}>
                <circle cx={x(i)} cy={y(p.v)} r={last ? 8 : 6} fill={last ? c.blue800 : c.white} stroke={c.blue800} strokeWidth={3} />
                <text
                  x={x(i)}
                  y={y(p.v) - 14}
                  textAnchor={i === 0 ? "start" : last ? "end" : "middle"}
                  fontSize={16}
                  fontWeight={700}
                  fill={c.slate900}
                  fontFamily={font.mono}
                >
                  {p.v.toFixed(1)}
                </text>
                <text
                  x={x(i)}
                  y={H - 6}
                  textAnchor={i === 0 ? "start" : last ? "end" : "middle"}
                  fontSize={13}
                  fill={c.slate600}
                  fontFamily={font.body}
                >
                  {p.label}
                </text>
              </g>
            );
          })}
        </svg>
      </Card>

      <Card style={fadeUp(frame, 110)}>
        <span style={{ fontSize: 21, fontWeight: 800 }}>Since your last report</span>
        <span style={{ fontSize: 16, color: c.slate600, marginTop: -6 }}>Mar 2026 → Sep 2026</span>
        {CHANGES.map((ch, i) => (
          <div
            key={ch.name}
            style={{
              ...fadeUp(frame, 124 + i * 12),
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
              borderTop: i ? `1px solid ${c.slate300}` : undefined,
              paddingTop: i ? 10 : 0,
            }}
          >
            <div>
              <div style={{ fontSize: 19, fontWeight: 700 }}>{ch.name}</div>
              <div style={{ fontFamily: font.mono, fontSize: 17, color: c.slate700 }}>
                {ch.from} → {ch.to} <span style={{ fontSize: 14, color: c.slate600 }}>{ch.unit}</span>
              </div>
            </div>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: 999,
                fontWeight: 800,
                fontSize: 15,
                background: ch.better ? c.emerald100 : c.amber50,
                color: ch.better ? c.emerald950 : c.amber950,
                border: `2px solid ${ch.better ? "#6ee7b7" : c.amber300}`,
              }}
            >
              {ch.better ? "Better" : "Worse"}
            </span>
          </div>
        ))}
      </Card>
    </Screen>
  );
}
