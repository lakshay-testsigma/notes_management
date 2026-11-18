import axe from "axe-core";
import { JSDOM, VirtualConsole } from "jsdom";
import type { Finding, Outcome } from "./types.js";

// Run axe on saved HTML inside jsdom (no real browser, no layout).
export async function runAxe(html: string): Promise<axe.AxeResults> {
  // An empty VirtualConsole hides jsdom's "not implemented: canvas" noise.
  const dom = new JSDOM(html, { runScripts: "outside-only", virtualConsole: new VirtualConsole() });
  // axe must live in the page's own window, so we run its source there.
  dom.window.eval(axe.source);
  const result = await (dom.window as any).axe.run(dom.window.document, {
    resultTypes: ["violations", "passes", "incomplete"],
  });
  dom.window.close();
  return result;
}

// Keep all three axe outcomes. One finding per failing element.
export function toFindings(page: string, results: axe.AxeResults): Finding[] {
  const groups: [Outcome, axe.Result[]][] = [
    ["violation", results.violations],
    ["pass", results.passes],
    ["incomplete", results.incomplete],
  ];
  const out: Finding[] = [];
  for (const [outcome, rules] of groups) {
    for (const rule of rules) {
      for (const node of rule.nodes) {
        out.push({ page, rule: rule.id, outcome, target: node.target.join(" "), detail: rule.help });
      }
    }
  }
  return out;
}
