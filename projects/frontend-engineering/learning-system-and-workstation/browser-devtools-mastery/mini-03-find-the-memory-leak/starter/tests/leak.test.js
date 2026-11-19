import test from "node:test";
import assert from "node:assert/strict";
import { FakeDocument, FakeWindow } from "./fake-dom.js";
import { createRouter } from "../src/router.js";
import { createHomeView, createReportView } from "../src/views.js";
import { cacheSize, clearCache, countDetached, resetCacheForTests } from "../src/cache.js";

function setup() {
  resetCacheForTests();
  const doc = new FakeDocument();
  const win = new FakeWindow();
  const root = doc.createElement("main");
  doc.body.append(root);
  const router = createRouter({ doc, win, root, views: { home: createHomeView, report: createReportView } });
  return { doc, win, root, router };
}

test("the report view caches its 200 rows and listens for resize", () => {
  const { win } = setup();
  win.goTo("#/report");
  assert.equal(cacheSize(), 200);
  assert.equal(win.listenerCount("resize"), 1);
});

test("leaving the report view removes the resize listener", () => {
  const { win } = setup();
  win.goTo("#/report");
  win.goTo("#/home");
  assert.equal(win.listenerCount("resize"), 0, "TODO(3): remove the listener in unmount");
});

test("leaving the report view empties the cache", () => {
  const { win } = setup();
  win.goTo("#/report");
  win.goTo("#/home");
  assert.equal(cacheSize(), 0, "TODO(4): clear the cache in unmount");
});

test("no cached node is detached after leaving the report view", () => {
  const { win } = setup();
  win.goTo("#/report");
  win.goTo("#/home");
  assert.equal(countDetached(), 0, "detached nodes are still held by the cache");
});

test("ten route changes do not grow memory", () => {
  const { win } = setup();
  for (let i = 0; i < 10; i += 1) {
    win.goTo("#/report");
    win.goTo("#/home");
  }
  assert.equal(cacheSize(), 0);
  assert.equal(win.listenerCount("resize"), 0);
});

test("a resize after leaving does not touch the old view", () => {
  const { win, root } = setup();
  win.goTo("#/report");
  const oldHeader = root.children[0].children[0];
  const before = oldHeader.textContent;
  win.goTo("#/home");
  win.innerWidth = 1200;
  win.dispatch("resize");
  assert.equal(oldHeader.textContent, before);
});

test("clearCache empties the cache", () => {
  const { win } = setup();
  win.goTo("#/report");
  clearCache();
  assert.equal(cacheSize(), 0);
});

test("router.stop removes the hashchange listener", () => {
  const { win, router } = setup();
  router.stop();
  assert.equal(win.listenerCount("hashchange"), 0);
});
