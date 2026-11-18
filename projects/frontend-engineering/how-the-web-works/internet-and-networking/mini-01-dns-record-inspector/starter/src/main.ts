import { parseArgs } from "node:util";
import { analyze } from "./checks.ts";
import { demoResolver } from "./fake.ts";
import { inspectDomain } from "./lookup.ts";
import { formatReport } from "./report.ts";
import { createNodeResolver } from "./resolver.ts";

// Usage: node src/main.ts <name> [--ca letsencrypt.org] [--max-ttl 300] | node src/main.ts --demo
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    demo: { type: "boolean", default: false },
    ca: { type: "string", default: "letsencrypt.org" },
    "max-ttl": { type: "string", default: "300" },
  },
});

const name = values.demo ? "demo.example" : positionals[0];
if (!name) {
  console.error("Usage: node src/main.ts <name> [--ca letsencrypt.org] [--max-ttl 300]   or   --demo");
  process.exit(2);
}

try {
  const resolver = values.demo ? demoResolver : createNodeResolver();
  const report = await inspectDomain(name, resolver);
  const findings = analyze(report, { maxTtl: Number(values["max-ttl"]), expectedCa: values.ca });
  console.log(formatReport(report, findings));
  process.exit(findings.some((f) => f.level === "error") ? 1 : 0);
} catch (error) {
  console.error((error as Error).message);
  process.exit(1);
}
