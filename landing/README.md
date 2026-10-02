# HealthMate landing page

A static marketing page for HealthMate, published with GitHub Pages. It is separate from the app, which is not deployed.

- `site/` is the page itself: plain HTML, CSS and JS, plus the rendered videos in `site/media/`.
- `video/` is a [Remotion](https://www.remotion.dev/) project that recreates the app's screens and renders those videos.

## Re-rendering the videos

```sh
cd landing/video
npm install
npm run studio          # preview and tweak scenes
npm run render          # writes site/media/*.mp4 and poster *.jpg
node render.mjs tour    # render a single composition
```

Compositions: `report`, `urgent`, `medicines`, `trends`, `voice`, `visit` (390×844 phone screens at 2×) and `tour` (1920×1080 walkthrough).

## Publishing

```sh
sh landing/deploy.sh    # force-pushes landing/site to the gh-pages branch
```
