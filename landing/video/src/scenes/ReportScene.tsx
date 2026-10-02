import React from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { Camera, FileText, Volume2 } from "lucide-react";
import { c, font } from "../theme";
import { Card, Chip, Dots, fadeOut, fadeUp, Lang, ramp, Screen, STATUS_LABEL, Status, Tap, useSpringAt } from "../ui";

export const REPORT_DURATION = 390;

const SUMMARY: Record<Lang, string> = {
  en: "Your blood sugar is better than in March, but still a little high. Your kidney result is slightly low. Ask your doctor about it at your next visit.",
  bm: "Gula darah anda lebih baik berbanding Mac, tetapi masih sedikit tinggi. Keputusan buah pinggang anda sedikit rendah. Tanya doktor pada lawatan seterusnya.",
  zh: "您的血糖比三月时好，但仍然略高。肾功能结果略低。下次复诊时请问问医生。",
  ta: "மார்ச் மாதத்தை விட உங்கள் இரத்தச் சர்க்கரை மேம்பட்டுள்ளது, ஆனால் இன்னும் சற்று அதிகம். சிறுநீரக முடிவு சற்று குறைவு. அடுத்த வருகையில் மருத்துவரிடம் கேளுங்கள்.",
};

const PLAIN_WORDS: Record<Lang, string> = {
  en: "In plain words",
  bm: "Dalam bahasa mudah",
  zh: "简单来说",
  ta: "எளிய வார்த்தைகளில்",
};

const RANGE: Record<Lang, string> = { en: "Normal range", bm: "Julat normal", zh: "正常范围", ta: "இயல்பு வரம்பு" };
const TITLE: Record<Lang, string> = { en: "Reports & Chat", bm: "Laporan", zh: "报告与问答", ta: "அறிக்கை" };

const MARKERS: { name: string; value: string; unit: string; status: Status; range: string }[] = [
  { name: "HbA1c", value: "7.0", unit: "%", status: "high", range: "4.0 – 6.0" },
  { name: "Fasting glucose", value: "6.4", unit: "mmol/L", status: "high", range: "3.9 – 6.0" },
  { name: "eGFR", value: "64", unit: "mL/min", status: "low", range: "> 90" },
  { name: "Potassium", value: "4.6", unit: "mmol/L", status: "normal", range: "3.5 – 5.1" },
];

const SWITCHES: { at: number; lang: Lang }[] = [
  { at: 0, lang: "en" },
  { at: 215, lang: "bm" },
  { at: 270, lang: "zh" },
  { at: 325, lang: "ta" },
];

function langAt(frame: number): Lang {
  let l: Lang = "en";
  for (const s of SWITCHES) if (frame >= s.at) l = s.lang;
  return l;
}

/** Upload a lab report, watch it read, get every marker plus a summary in four languages. */
export function ReportScene() {
  const frame = useCurrentFrame();
  const lang = langAt(frame);
  const thumbIn = useSpringAt(32);
  const scanning = frame >= 40 && frame < 118;
  const scanY = ((frame - 40) % 39) / 39;
  const uploadOpacity = fadeOut(frame, 112, 10);
  const results = frame >= 120;
  const switchFrame = SWITCHES.filter((s) => s.at > 0 && frame >= s.at).pop()?.at ?? -100;
  const textFade = ramp(frame, switchFrame, switchFrame + 10);

  return (
    <Screen
      title={TITLE[lang]}
      lang={lang}
      tab="reports"
      scrollY={ramp(frame, 190, 215, 0, 70)}
      overlay={
        <>
          <Tap x={195} y={390} at={22} />
          <Tap x={262} y={68} at={209} />
          <Tap x={306} y={68} at={264} />
          <Tap x={353} y={68} at={319} />
        </>
      }
    >
      {!results && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, opacity: uploadOpacity }}>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Understand a report</h2>
          <div
            style={{
              border: `3px dashed ${c.blue700}`,
              borderRadius: 18,
              background: c.blue50,
              padding: 18,
              height: 470,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {frame < 32 ? (
              <>
                <span
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: c.blue100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Camera size={36} color={c.blue800} />
                </span>
                <span style={{ fontSize: 22, fontWeight: 800, color: c.blue950 }}>Photo or PDF of your report</span>
                <span style={{ fontSize: 17, color: c.slate600 }}>Blood test or discharge summary</span>
              </>
            ) : (
              <div
                style={{
                  position: "relative",
                  width: 250,
                  height: 354,
                  transform: `scale(${0.6 + thumbIn * 0.4}) rotate(${(1 - thumbIn) * -6}deg)`,
                  boxShadow: "0 12px 30px rgba(15,23,42,.25)",
                  borderRadius: 6,
                  overflow: "hidden",
                  background: c.white,
                }}
              >
                <Img src={staticFile("report-2026-09-followup.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                {scanning && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: `${scanY * 100}%`,
                      height: 46,
                      marginTop: -46,
                      background: "linear-gradient(to bottom, rgba(29,78,216,0), rgba(29,78,216,.28))",
                      borderBottom: `3px solid ${c.blue700}`,
                    }}
                  />
                )}
              </div>
            )}
            {frame >= 40 && (
              <span style={{ fontSize: 19, fontWeight: 700, color: c.blue900, display: "flex", alignItems: "center" }}>
                Reading your report
                <Dots />
              </span>
            )}
          </div>
        </div>
      )}

      {results && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", ...fadeUp(frame, 120) }}>
            <span style={{ fontSize: 22, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
              <FileText size={24} color={c.blue800} /> Lab report
            </span>
            <span style={{ fontSize: 17, color: c.slate600, fontWeight: 500 }}>10 Sep 2026</span>
          </div>

          <Card style={{ ...fadeUp(frame, 128), borderColor: c.blue700, background: c.blue50 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontSize: 19, fontWeight: 800, color: c.blue950 }}>{PLAIN_WORDS[lang]}</span>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: c.blue800,
                  color: c.white,
                  borderRadius: 10,
                  padding: "7px 11px",
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                <Volume2 size={18} /> Listen
              </span>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: lang === "ta" ? 16.5 : 18,
                lineHeight: 1.55,
                color: c.slate900,
                minHeight: 168,
                opacity: textFade,
              }}
            >
              {SUMMARY[lang]}
            </p>
          </Card>

          {MARKERS.map((m, i) => (
            <div
              key={m.name}
              style={{
                ...fadeUp(frame, 150 + i * 9),
                background: c.white,
                border: `2px solid ${c.slate300}`,
                borderRadius: 14,
                padding: "10px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontSize: 19, fontWeight: 700 }}>{m.name}</span>
                <Chip status={m.status}>{STATUS_LABEL[lang][m.status]}</Chip>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <span style={{ fontFamily: font.mono, fontSize: 21, fontWeight: 700 }}>
                  {m.value} <span style={{ fontSize: 15, fontWeight: 400, color: c.slate600 }}>{m.unit}</span>
                </span>
                <span style={{ fontSize: 15, color: c.slate600 }}>
                  {RANGE[lang]}: <span style={{ fontFamily: font.mono }}>{m.range}</span>
                </span>
              </div>
            </div>
          ))}
        </>
      )}
    </Screen>
  );
}
