import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { renderHtml } from "./page.js";
import { HERO_SHAPES, makeHeroSvg, cacheHeaders } from "./assets.js";
import { createReviewsCache, slowReviewsLoader } from "./reviews.js";

const here = (file) => fileURLToPath(new URL(file, import.meta.url));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Delays simulate slow network and slow servers so the waterfall shows them.
const DEFAULT_DELAYS = { analytics: 800, reviews: 1200, hero: 300 };

export function createApp(options = {}) {
  const delays = { ...DEFAULT_DELAYS, ...options.delays };
  const getReviews = createReviewsCache(slowReviewsLoader(delays.reviews), 60000);

  return createServer(async (req, res) => {
    const path = new URL(req.url, "http://localhost").pathname;
    const send = (type, body, headers = {}) => {
      res.writeHead(200, { "Content-Type": type, ...headers });
      res.end(body);
    };

    if (path === "/") return send("text/html", renderHtml(), cacheHeaders("page"));
    if (path === "/app.js") return send("text/javascript", readFileSync(here("./app.js")), cacheHeaders("static"));
    if (path === "/work.js") return send("text/javascript", readFileSync(here("./work.js")), cacheHeaders("static"));
    if (path === "/analytics.js") {
      await sleep(delays.analytics);
      return send("text/javascript", "window.analyticsReady = true;", cacheHeaders("static"));
    }
    if (path === "/hero.svg") {
      await sleep(delays.hero);
      return send("image/svg+xml", makeHeroSvg(HERO_SHAPES), cacheHeaders("static"));
    }
    if (path === "/api/reviews") {
      return send("application/json", JSON.stringify(await getReviews()), cacheHeaders("page"));
    }
    res.writeHead(404);
    res.end("Not found");
  });
}

// Start only when run directly (npm start), not when a test imports this file.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 3000);
  createApp().listen(port, () => console.log(`Open http://localhost:${port}`));
}
