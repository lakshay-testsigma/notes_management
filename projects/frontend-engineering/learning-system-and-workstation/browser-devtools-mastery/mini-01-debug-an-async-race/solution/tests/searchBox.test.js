import { test } from "node:test";
import assert from "node:assert/strict";
import { createSearchBox } from "../src/searchBox.js";
import { search as fakeSearch } from "../src/fakeApi.js";

// A search where the test decides when each request finishes.
function controlledSearch() {
  const calls = [];
  const search = (query, { signal } = {}) =>
    new Promise((resolve, reject) => {
      calls.push({ query, signal, resolve: () => resolve({ query, results: [query] }), reject });
    });
  return { search, calls };
}

test("a slow old response does not overwrite the newest one", async () => {
  const { search, calls } = controlledSearch();
  const shown = [];
  const box = createSearchBox({ search, render: (r) => shown.push(r.query) });

  const first = box.onInput("re");
  const second = box.onInput("red");
  calls[1].resolve(); // "red" answers first
  calls[0].resolve(); // "re" answers late
  await Promise.all([first, second]);

  assert.deepEqual(shown, ["red"]);
});

test("responses in the right order still render the newest", async () => {
  const { search, calls } = controlledSearch();
  const shown = [];
  const box = createSearchBox({ search, render: (r) => shown.push(r.query) });

  const only = box.onInput("r");
  calls[0].resolve();
  await only;

  assert.deepEqual(shown, ["r"]);
});

test("a new input aborts the previous request", async () => {
  const { search, calls } = controlledSearch();
  const box = createSearchBox({ search, render: () => {} });

  box.onInput("re");
  box.onInput("red");

  assert.equal(calls[0].signal.aborted, true);
  assert.equal(calls[1].signal.aborted, false);
});

test("an aborted request does not render and does not throw", async () => {
  const shown = [];
  const box = createSearchBox({
    search: (query, opts) => fakeSearch(query, { ...opts, delayMs: 20 }),
    render: (r) => shown.push(r.query),
  });

  await Promise.all([box.onInput("re"), box.onInput("red")]);

  assert.deepEqual(shown, ["red"]);
});

test("fakeApi rejects with AbortError when cancelled", async () => {
  const controller = new AbortController();
  const pending = fakeSearch("re", { signal: controller.signal, delayMs: 500 });
  controller.abort();
  await assert.rejects(pending, { name: "AbortError" });
});

test("fakeApi returns words that start with the query", async () => {
  const data = await fakeSearch("vi", { delayMs: 0 });
  assert.deepEqual(data, { query: "vi", results: ["vite", "vitest"] });
});
