import React from "react";
import { Composition } from "remotion";
import { FPS, SCREEN } from "./theme";
import { PhoneCanvas } from "./ui";
import { ReportScene, REPORT_DURATION } from "./scenes/ReportScene";
import { UrgentScene, URGENT_DURATION } from "./scenes/UrgentScene";
import { MedsScene, MEDS_DURATION } from "./scenes/MedsScene";
import { TrendScene, TREND_DURATION } from "./scenes/TrendScene";
import { VoiceScene, VOICE_DURATION } from "./scenes/VoiceScene";
import { VisitScene, VISIT_DURATION } from "./scenes/VisitScene";
import { Tour, TOUR_DURATION } from "./Tour";

const portrait = { width: SCREEN.w * 2, height: SCREEN.h * 2, fps: FPS };

const wrap = (Scene: React.FC) =>
  function Wrapped() {
    return (
      <PhoneCanvas>
        <Scene />
      </PhoneCanvas>
    );
  };

const SCENES: { id: string; Scene: React.FC; duration: number }[] = [
  { id: "report", Scene: ReportScene, duration: REPORT_DURATION },
  { id: "urgent", Scene: UrgentScene, duration: URGENT_DURATION },
  { id: "medicines", Scene: MedsScene, duration: MEDS_DURATION },
  { id: "trends", Scene: TrendScene, duration: TREND_DURATION },
  { id: "voice", Scene: VoiceScene, duration: VOICE_DURATION },
  { id: "visit", Scene: VisitScene, duration: VISIT_DURATION },
];

export function Root() {
  return (
    <>
      {SCENES.map(({ id, Scene, duration }) => (
        <Composition key={id} id={id} component={wrap(Scene)} durationInFrames={duration} {...portrait} />
      ))}
      <Composition id="tour" component={Tour} durationInFrames={TOUR_DURATION} width={1920} height={1080} fps={FPS} />
    </>
  );
}
