import { readFileSync } from "node:fs";
import { HarError, parseHar } from "./parse.js";
import { buildReport } from "./report.js";

const file = process.argv[2];
if (!file) {
  console.error("Usage: npm start -- <file.har>");
  process.exit(2);
}

try {
  console.log(buildReport(parseHar(readFileSync(file, "utf8"))));
} catch (error) {
  if (error instanceof HarError) {
    console.error(`Cannot read ${file}: ${error.message}`);
    process.exit(1);
  }
  throw error;
}
