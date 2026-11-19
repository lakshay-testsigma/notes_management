// The hero image is an SVG made of many circles, so its size is easy to change.

// TODO(3): The hero is far too big (about 400 KB). Cut HERO_SHAPES to a few dozen
// shapes (60 is fine), then make cacheHeaders("static") return a Cache-Control
// header with max-age=86400. Both changes are in this file.
export const HERO_SHAPES = 6000;

export function makeHeroSvg(shapes) {
  const circles = [];
  for (let i = 0; i < shapes; i++) {
    const x = (i * 37) % 1200;
    const y = (i * 91) % 600;
    const hue = (i * 7) % 360;
    circles.push(`<circle cx="${x}" cy="${y}" r="${20 + (i % 40)}" fill="hsl(${hue},70%,55%)" fill-opacity="0.6"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600">${circles.join("")}</svg>`;
}

// Static files rarely change, so the browser may keep them for a day.
export function cacheHeaders(kind) {
  return { "Cache-Control": "no-store" };
}
