import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { auditManifest } from "./audit.js";
import { formatReport } from "./report.js";
import type { Manifest, Policy } from "./types.js";

// Usage: vite-node src/main.ts <manifest.json | folder of manifests> [policy.json]
const target = process.argv[2];
const policyPath = process.argv[3] ?? "policy.json";
if (!target) {
  console.error("Usage: main.ts <manifest.json | folder> [policy.json]");
  process.exit(2);
}

const files = statSync(target).isDirectory()
  ? readdirSync(target).filter((f) => f.endsWith(".json")).sort().map((f) => join(target, f))
  : [target];
const policy = JSON.parse(readFileSync(policyPath, "utf8")) as Policy;
const results = files.map((f) => auditManifest(JSON.parse(readFileSync(f, "utf8")) as Manifest, policy));

console.log(formatReport(results));
// A non-zero exit lets a CI job block a rejected extension.
process.exit(results.some((r) => r.verdict === "reject") ? 1 : 0);
