import { readFileSync } from "node:fs";
import { loadTraceEvents } from "./trace.js";
import { findLongTasks } from "./longTasks.js";
import { findLayoutShifts } from "./layoutShifts.js";
import { formatReport } from "./report.js";

const file = process.argv[2];
if (!file) {
  console.error("Usage: npm start -- <trace.json>");
  process.exit(2);
}
try {
  const events = loadTraceEvents(readFileSync(file, "utf8"));
  console.log(formatReport(findLongTasks(events), findLayoutShifts(events)));
} catch (error) {
  console.error((error as Error).message);
  process.exit(1);
}
