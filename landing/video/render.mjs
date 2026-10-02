// Renders every composition into ../site/media (MP4 + poster JPG).
// `node render.mjs` renders all; `node render.mjs report tour` renders some;
// `node render.mjs --stills report:60,200` writes preview PNGs to out/.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";

const here = path.dirname(fileURLToPath(import.meta.url));
const mediaDir = path.join(here, "..", "site", "media");
const args = process.argv.slice(2);
const stills = args[0] === "--stills";

// Frame used as the poster image for each video.
const POSTER_FRAME = { report: 250, urgent: 200, medicines: 230, trends: 200, voice: 300, visit: 120, tour: 300 };

const serveUrl = await bundle({ entryPoint: path.join(here, "src", "index.ts") });

if (stills) {
  for (const spec of args.slice(1)) {
    const [id, frames] = spec.split(":");
    const composition = await selectComposition({ serveUrl, id });
    for (const f of frames.split(",").map(Number)) {
      const output = path.join(here, "out", `${id}-${f}.png`);
      await renderStill({ serveUrl, composition, frame: f, output });
      console.log("still", output);
    }
  }
} else {
  const ids = args.length ? args : ["report", "urgent", "medicines", "trends", "voice", "visit", "tour"];
  for (const id of ids) {
    const composition = await selectComposition({ serveUrl, id });
    const isTour = id === "tour";
    await renderMedia({
      serveUrl,
      composition,
      codec: "h264",
      crf: isTour ? 24 : 26,
      pixelFormat: "yuv420p",
      muted: true,
      outputLocation: path.join(mediaDir, `${id}.mp4`),
      onProgress: ({ progress }) => process.stdout.write(`\r${id} ${Math.round(progress * 100)}%`),
    });
    await renderStill({
      serveUrl,
      composition,
      frame: POSTER_FRAME[id] ?? 0,
      output: path.join(mediaDir, `${id}.jpg`),
      imageFormat: "jpeg",
      jpegQuality: 82,
    });
    console.log(`\n${id} done`);
  }
}
