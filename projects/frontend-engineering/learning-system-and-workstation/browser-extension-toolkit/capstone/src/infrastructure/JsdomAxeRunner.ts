import axe from "axe-core";
import { JSDOM, VirtualConsole } from "jsdom";
import type { AxeFindings, AxeRule } from "../domain/PageContext.ts";
import type { AxeRunner } from "../domain/ports.ts";

// Runs axe-core inside jsdom. jsdom has no layout engine, so rules that need
// pixels (color-contrast) come back as "incomplete", which we print as "review".
export class JsdomAxeRunner implements AxeRunner {
  async run(html: string): Promise<AxeFindings> {
    // scripts run only when we call eval ourselves, never from the saved page
    const dom = new JSDOM(html, { runScripts: "outside-only", virtualConsole: new VirtualConsole() });
    try {
      dom.window.eval(axe.source); // axe must live inside the page's own window
      const win = dom.window as unknown as { axe: typeof axe };
      const results = await win.axe.run(dom.window.document as unknown as Element, {
        resultTypes: ["violations", "incomplete", "passes"],
      });
      const rules = (list: axe.Result[]): AxeRule[] => list.map((r) => ({ id: r.id, help: r.help, nodes: r.nodes.length }));
      return { violations: rules(results.violations), incomplete: rules(results.incomplete), passes: results.passes.length };
    } finally {
      dom.window.close();
    }
  }
}
