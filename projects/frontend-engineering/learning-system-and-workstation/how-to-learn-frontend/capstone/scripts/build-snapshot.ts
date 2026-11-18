// Builds src/infrastructure/data/feature-snapshot.json from the published browser-compat-data.
import bcd from "@mdn/browser-compat-data";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { CORE_BROWSERS } from "../src/domain/baseline-calculator.js";
import type { Compat, ReleaseTable } from "../src/domain/feature.js";
import { CompatTreeReader } from "../src/infrastructure/compat-tree-reader.js";
import { FEATURE_KEYS } from "./feature-keys.js";

const tree = bcd as unknown as Record<string, unknown> & { browsers: Record<string, { releases: ReleaseTable[string] }> };
const reader = new CompatTreeReader(tree);
const version = JSON.parse(readFileSync("node_modules/@mdn/browser-compat-data/package.json", "utf8")).version;

const browsers: ReleaseTable = {};
for (const name of CORE_BROWSERS) {
  browsers[name] = {};
  for (const [v, release] of Object.entries(tree.browsers[name].releases)) {
    browsers[name][v] = { release_date: release.release_date };
  }
}

const features: Record<string, Compat> = {};
for (const key of FEATURE_KEYS) {
  const compat = reader.read(key); // throws a clear error naming the part that failed
  const support: Compat["support"] = {};
  for (const name of CORE_BROWSERS) if (compat.support[name]) support[name] = compat.support[name];
  features[key] = { support, status: compat.status };
}

const out = "src/infrastructure/data/feature-snapshot.json";
mkdirSync("src/infrastructure/data", { recursive: true });
writeFileSync(out, JSON.stringify({ source: `@mdn/browser-compat-data@${version}`, browsers, features }, null, 1));
console.log(`Wrote ${Object.keys(features).length} features to ${out}`);
