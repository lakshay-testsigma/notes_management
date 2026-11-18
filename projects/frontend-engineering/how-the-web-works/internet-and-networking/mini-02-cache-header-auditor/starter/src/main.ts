import { readFileSync } from "node:fs";
import { auditAll } from "./audit.ts";
import { readEntries } from "./har.ts";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node src/main.ts <file.har>");
  process.exit(2);
}

const findings = auditAll(readEntries(JSON.parse(readFileSync(file, "utf8"))));
for (const f of findings) {
  if (f.result !== "ok") console.log(`${f.result.toUpperCase().padEnd(7)} ${f.rule.padEnd(22)} ${f.url}\n        ${f.message}`);
}
const problems = findings.filter((f) => f.result === "problem").length;
const unknown = findings.filter((f) => f.result === "unknown").length;
console.log(`\n${findings.length} checks: ${problems} problems, ${unknown} unknown.`);
process.exit(problems > 0 ? 1 : 0);
