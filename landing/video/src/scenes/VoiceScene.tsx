import React from "react";
import { useCurrentFrame } from "remotion";
import { Mic, PhoneOff, Sparkles, Volume2, Loader } from "lucide-react";
import { c } from "../theme";
import { Card, fadeUp, ramp, Screen } from "../ui";

export const VOICE_DURATION = 360;

const QUESTION = "Can I still eat nasi lemak for breakfast?";
const ANSWER =
  "Now and then, yes. Your sugar is still a little high, so ask for half the rice, skip the sweet sambal and add cucumber or an egg. Plain water instead of teh tarik helps too.";

const LISTEN_END = 110;
const THINK_END = 150;

function typed(text: string, frame: number, start: number, cps: number) {
  const n = Math.max(0, Math.floor(((frame - start) / 30) * cps));
  return text.slice(0, n);
}

/** Hands-free voice: speak, pause, hear the answer. */
export function VoiceScene() {
  const frame = useCurrentFrame();
  const status = frame < LISTEN_END ? "listening" : frame < THINK_END ? "thinking" : "speaking";
  const sheet = ramp(frame, 0, 14);
  const ring = 0.5 + 0.5 * Math.sin(frame / 5);

  const headline =
    status === "listening" ? "Listening... Speak naturally" : status === "thinking" ? "Thinking about your question..." : "HealthMate is speaking...";
  const hint =
    status === "listening"
      ? "Ask about your report, medicines or meals. I will answer when you pause."
      : status === "speaking"
        ? "Tap the button to interrupt and ask something else."
        : "";

  const ringColor = status === "listening" ? "#93c5fd" : status === "speaking" ? "#6ee7b7" : c.slate300;
  const bg = status === "listening" ? c.blue100 : status === "speaking" ? c.emerald100 : c.slate100;
  const fg = status === "listening" ? c.blue900 : status === "speaking" ? "#064e3b" : c.slate600;

  return (
    <Screen
      title="Reports & Chat"
      tab="reports"
      overlay={
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `rgba(0,0,0,${0.7 * sheet})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 14,
            zIndex: 20,
          }}
        >
          <div
            style={{
              background: c.white,
              borderRadius: 24,
              width: "100%",
              padding: 20,
              border: `2px solid ${c.slate300}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 18,
              textAlign: "center",
              transform: `translateY(${(1 - sheet) * 60}px)`,
              opacity: sheet,
            }}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: `1px solid #e2e8f0`,
                paddingBottom: 10,
              }}
            >
              <span style={{ display: "flex", gap: 6, alignItems: "center", color: c.blue900, fontWeight: 700, fontSize: 18, whiteSpace: "nowrap" }}>
                <Mic size={22} color={c.blue700} /> HealthMate Voice
              </span>
              <span
                style={{
                  background: c.blue100,
                  color: c.blue900,
                  borderRadius: 999,
                  padding: "3px 9px",
                  fontSize: 12,
                  whiteSpace: "nowrap",
                  fontWeight: 700,
                  display: "flex",
                  gap: 4,
                  alignItems: "center",
                }}
              >
                <Sparkles size={13} color={c.blue700} /> Report Context Active
              </span>
            </div>

            <div style={{ position: "relative", width: 112, height: 112, margin: "8px 0" }}>
              {status !== "thinking" &&
                [0, 1].map((i) => {
                  const t = ((frame + i * 20) % 40) / 40;
                  return (
                    <span
                      key={i}
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "50%",
                        border: `4px solid ${ringColor}`,
                        transform: `scale(${1 + t * 0.45})`,
                        opacity: 1 - t,
                      }}
                    />
                  );
                })}
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: bg,
                  color: fg,
                  boxShadow: `0 0 0 ${status === "thinking" ? 4 : 6 + ring * 3}px ${ringColor}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {status === "speaking" ? (
                  <Volume2 size={54} />
                ) : status === "thinking" ? (
                  <Loader size={48} style={{ transform: `rotate(${frame * 12}deg)` }} />
                ) : (
                  <Mic size={54} />
                )}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: c.slate900 }}>{headline}</span>
              {hint && <span style={{ fontSize: 17, color: c.slate600, fontWeight: 500 }}>{hint}</span>}
            </div>

            {frame > 30 && (
              <div
                style={{
                  width: "100%",
                  background: c.slate50,
                  border: `1px solid #e2e8f0`,
                  borderRadius: 12,
                  padding: 14,
                  textAlign: "left",
                  fontSize: 17,
                  lineHeight: 1.5,
                  color: c.slate700,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  minHeight: 200,
                }}
              >
                <p style={{ margin: 0 }}>
                  <b style={{ color: c.slate900 }}>You: </b>
                  {typed(QUESTION, frame, 30, 26)}
                </p>
                {frame >= THINK_END && (
                  <p style={{ margin: 0 }}>
                    <b style={{ color: c.blue900 }}>HealthMate: </b>
                    {typed(ANSWER, frame, THINK_END, 30)}
                  </p>
                )}
              </div>
            )}

            <div
              style={{
                width: "100%",
                background: c.red700,
                color: c.white,
                borderRadius: 16,
                minHeight: 56,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              <PhoneOff size={22} /> End Voice Chat (Return to Text)
            </div>
          </div>
        </div>
      }
    >
      <Card style={fadeUp(frame, 0, 1)}>
        <span style={{ fontSize: 20, fontWeight: 700 }}>Ask about this report</span>
      </Card>
    </Screen>
  );
}
