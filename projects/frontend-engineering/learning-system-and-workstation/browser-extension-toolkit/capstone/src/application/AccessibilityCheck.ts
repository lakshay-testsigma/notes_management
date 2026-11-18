import type { CheckResult } from "../domain/Outcome.ts";
import type { PageContext } from "../domain/PageContext.ts";
import type { AxeRunner, Check } from "../domain/ports.ts";

// Maps axe-core's three result lists to our three outcomes:
// violations -> fail, incomplete -> review, nothing wrong -> pass.
export class AccessibilityCheck implements Check {
  readonly id = "accessibility";
  private readonly axe: AxeRunner;

  constructor(axe: AxeRunner) {
    this.axe = axe;
  }

  async run(context: PageContext): Promise<CheckResult[]> {
    const found = await this.axe.run(context.html);
    const results: CheckResult[] = [];
    for (const rule of found.violations) {
      results.push({ check: `axe-${rule.id}`, target: context.url, outcome: "fail", message: `${rule.help} (${rule.nodes} element(s))` });
    }
    for (const rule of found.incomplete) {
      // jsdom has no layout, so rules such as color-contrast cannot decide here.
      results.push({ check: `axe-${rule.id}`, target: context.url, outcome: "review", message: `${rule.help}: axe could not decide (${rule.nodes} element(s))` });
    }
    if (results.length === 0) {
      results.push({ check: "axe-rules", target: context.url, outcome: "pass", message: `${found.passes} axe rules passed` });
    }
    return results;
  }
}
