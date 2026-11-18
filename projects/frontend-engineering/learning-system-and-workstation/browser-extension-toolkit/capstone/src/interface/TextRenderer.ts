import type { ChecklistPhase } from "../application/ChecklistBuilder.ts";
import type { CheckResult, Outcome } from "../domain/Outcome.ts";
import { Summary } from "../domain/Summary.ts";

const LABEL: Record<Outcome, string> = { pass: "PASS  ", fail: "FAIL  ", review: "REVIEW" };

// Turns results into plain text. No logic about what is good or bad lives here.
export class TextRenderer {
  results(title: string, results: CheckResult[]): string {
    const lines = [`## ${title}`];
    for (const r of results) lines.push(`${LABEL[r.outcome]} ${r.check} [${r.target}] ${r.message}`);
    const s = new Summary(results);
    lines.push(`${s.count("pass")} pass, ${s.count("fail")} fail, ${s.count("review")} need review`);
    return lines.join("\n");
  }

  checklist(name: string, phases: ChecklistPhase[]): string {
    const lines = [`## Setup checklist: ${name}`];
    for (const p of phases) {
      lines.push(`Phase: ${p.phase}`);
      for (const step of p.steps) lines.push(`  [ ] ${step}`);
    }
    return lines.join("\n");
  }
}
