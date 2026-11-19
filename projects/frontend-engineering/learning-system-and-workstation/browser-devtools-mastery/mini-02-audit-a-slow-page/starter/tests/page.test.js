import { test } from "node:test";
import assert from "node:assert/strict";
import { renderHtml } from "../src/page.js";
import { HERO_SHAPES, makeHeroSvg, cacheHeaders } from "../src/assets.js";
import { processInChunks } from "../src/work.js";
import { createReviewsCache } from "../src/reviews.js";
import { createApp } from "../src/server.js";

test("TODO(1): the hero image is in the HTML and preloaded", () => {
  const html = renderHtml().replace(/<!--[\s\S]*?-->/g, "");
  assert.match(html, /<link rel="preload" as="image" href="\/hero\.svg"/);
  assert.match(html, /<img id="hero"[^>]*src="\/hero\.svg"/);
  assert.match(html, /<img id="hero"[^>]*fetchpriority="high"/);
});

test("TODO(2): no script in the head blocks rendering", () => {
  const head = renderHtml().replace(/<!--[\s\S]*?-->/g, "").split("</head>")[0];
  for (const tag of head.match(/<script[^>]*>/g) ?? []) {
    assert.match(tag, /defer|type="module"|async/, `blocking tag: ${tag}`);
  }
});

test("TODO(3): the hero is small and cacheable", () => {
  assert.ok(makeHeroSvg(HERO_SHAPES).length < 20000, "hero should be under 20 KB");
  assert.match(cacheHeaders("static")["Cache-Control"], /max-age=\d+/);
});

test("TODO(4): chunked work finishes all items and yields often", async () => {
  let clock = 0;
  let yields = 0;
  const results = await processInChunks(
    Array.from({ length: 100 }, (_, i) => i),
    (n) => { clock += 1; return n * 2; }, // each item "takes" 1 ms
    { budgetMs: 10, now: () => clock, yieldFn: async () => { yields += 1; } },
  );
  assert.equal(results.length, 100);
  assert.equal(results[99], 198);
  assert.equal(yields, 10, "one yield per 10 ms slice");
});

test("TODO(5): the reviews cache calls the slow loader once", async () => {
  let calls = 0;
  const get = createReviewsCache(async () => { calls += 1; return ["ok"]; }, 1000);
  await get();
  await get();
  assert.equal(calls, 1);
});

test("TODO(5) server: the second /api/reviews request is fast", async () => {
  const server = createApp({ delays: { reviews: 150 } });
  await new Promise((resolve) => server.listen(0, resolve));
  const base = `http://localhost:${server.address().port}`;
  const time = async () => { const t = Date.now(); await (await fetch(`${base}/api/reviews`)).text(); return Date.now() - t; };
  const first = await time();
  const second = await time();
  server.close();
  assert.ok(first >= 150, `first took ${first} ms`);
  assert.ok(second < 100, `second took ${second} ms`);
});

test("TODO(3) server: the hero is served with a Cache-Control header", async () => {
  const server = createApp({ delays: { hero: 0 } });
  await new Promise((resolve) => server.listen(0, resolve));
  const response = await fetch(`http://localhost:${server.address().port}/hero.svg`);
  server.close();
  assert.equal(response.headers.get("content-type"), "image/svg+xml");
  assert.match(response.headers.get("cache-control"), /max-age/);
});
