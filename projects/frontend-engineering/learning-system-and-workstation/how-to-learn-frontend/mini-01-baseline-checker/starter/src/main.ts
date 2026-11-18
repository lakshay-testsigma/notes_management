import { bcd } from "./bcd.js";
import { checkFeature, CORE_BROWSERS } from "./baseline.js";
import type { BrowserSupport } from "./types.js";

function show(s: BrowserSupport): string {
  if (s.kind === "yes") return (s.atMost ? "≤" : "") + s.version;
  return s.kind === "no" ? "no" : "?";
}

const paths = process.argv.slice(2);
if (paths.length === 0) {
  console.log("Usage: npm start -- css.properties.gap api.Navigator.share");
  process.exit(0);
}

const now = new Date();
for (const path of paths) {
  try {
    const r = checkFeature(bcd, path, now);
    const when = r.interoperableDate ? ` (all core browsers since ${r.interoperableDate})` : "";
    const flags = [r.deprecated && "deprecated", r.experimental && "experimental"].filter(Boolean);
    console.log(`${path}: ${r.status.toUpperCase()}${when}${flags.length ? " [" + flags.join(", ") + "]" : ""}`);
    console.log("  " + CORE_BROWSERS.map((b) => `${b} ${show(r.browsers[b])}`).join(" | "));
  } catch (error) {
    console.log(`${path}: ERROR ${(error as Error).message}`);
  }
}
console.log("\nApproximation: BCD has no Baseline field. Status is computed from release dates.");
