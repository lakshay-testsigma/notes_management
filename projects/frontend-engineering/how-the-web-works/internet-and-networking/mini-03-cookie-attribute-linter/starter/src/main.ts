import { readFileSync } from "node:fs";
import { readSetCookieHeaders } from "./input.ts";
import { lintHeaders } from "./lint.ts";
import { exitCode, formatReport } from "./report.ts";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node src/main.ts <headers.txt | capture.har>");
  process.exit(2);
}

try {
  const result = lintHeaders(readSetCookieHeaders(readFileSync(file, "utf8")));
  console.log(formatReport(result));
  process.exitCode = exitCode(result);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
