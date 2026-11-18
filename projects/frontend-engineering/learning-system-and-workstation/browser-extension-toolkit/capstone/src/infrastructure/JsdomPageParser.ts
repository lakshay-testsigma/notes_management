import { JSDOM, VirtualConsole } from "jsdom";
import type { ParsedPage } from "../domain/PageContext.ts";
import type { PageParser } from "../domain/ports.ts";

// jsdom is a DOM written in JavaScript. Scripts are off by default, so a saved
// page cannot run code while we read it.
export class JsdomPageParser implements PageParser {
  parse(html: string): ParsedPage {
    const dom = new JSDOM(html, { virtualConsole: new VirtualConsole() });
    try {
      const doc = dom.window.document;
      const text = (value: string | null | undefined): string | null => (value && value.trim() !== "" ? value.trim() : null);
      return {
        title: text(doc.querySelector("title")?.textContent),
        metaDescription: text(doc.querySelector('meta[name="description"]')?.getAttribute("content")),
        canonical: text(doc.querySelector('link[rel="canonical"]')?.getAttribute("href")),
        jsonLdBlocks: [...doc.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent ?? ""),
      };
    } finally {
      dom.window.close(); // free the window on every exit path
    }
  }
}
