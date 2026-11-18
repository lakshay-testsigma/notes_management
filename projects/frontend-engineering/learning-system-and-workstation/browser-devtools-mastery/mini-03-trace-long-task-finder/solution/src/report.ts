import type { LayoutShift, LongTask } from "./types.js";
import { totalShiftScore } from "./layoutShifts.js";

export function formatReport(tasks: LongTask[], shifts: LayoutShift[]): string {
  const lines = [`Long tasks over 50 ms: ${tasks.length}`];
  for (const t of tasks) {
    lines.push(`  ${t.durationMs.toFixed(1)} ms at ${t.startMs.toFixed(1)} ms`);
  }
  lines.push(`Layout shifts: ${shifts.length} (total score ${totalShiftScore(shifts)})`);
  for (const s of shifts) {
    lines.push(`  ${s.score.toFixed(3)} at ${s.timeMs.toFixed(1)} ms`);
  }
  return lines.join("\n");
}
