import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { runAxe, toFindings } from "./axe.js";
import { keyOf, newViolations } from "./baseline.js";
import { checkSeo, readHead } from "./seo.js";
import type { Finding, PageEntry } from "./types.js";

const [pagesPath, baselinePath, flag] = process.argv.slice(2);
if (!pagesPath || !baselinePath) {
  console.error("usage: main.ts <pages.json> <baseline.json> [--update-baseline]");
  process.exit(2);
}

const pages: PageEntry[] = JSON.parse(readFileSync(pagesPath, "utf8"));
const findings: Finding[] = [];
for (const entry of pages) {
  const isRedirect = entry.status >= 300 && entry.status < 400;
  const html = isRedirect ? "" : readFileSync(join(dirname(pagesPath), entry.file), "utf8");
  findings.push(...checkSeo(entry, readHead(html)));
  if (!isRedirect) findings.push(...toFindings(entry.name, await runAxe(html)));
}

const count = (o: string) => findings.filter((f) => f.outcome === o).length;
for (const f of findings.filter((x) => x.outcome !== "pass")) {
  console.log(`${f.outcome.toUpperCase().padEnd(10)} ${f.page} ${f.rule} [${f.target}] ${f.detail}`);
}
console.log(`\n${count("violation")} violation, ${count("pass")} pass, ${count("incomplete")} needs review`);

if (flag === "--update-baseline") {
  writeFileSync(baselinePath, JSON.stringify(findings.filter((f) => f.outcome === "violation").map(keyOf).sort(), null, 2) + "\n");
  console.log(`baseline written to ${baselinePath}`);
  process.exit(0);
}
const baseline: string[] = existsSync(baselinePath) ? JSON.parse(readFileSync(baselinePath, "utf8")) : [];
const fresh = newViolations(findings, baseline);
for (const f of fresh) console.log(`NEW        ${f.page} ${f.rule} [${f.target}]`);
console.log(fresh.length === 0 ? "OK: no new problems" : `FAIL: ${fresh.length} new problem(s)`);
process.exit(fresh.length === 0 ? 0 : 1);
