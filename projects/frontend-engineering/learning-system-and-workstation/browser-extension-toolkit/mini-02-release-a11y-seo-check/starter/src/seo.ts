import { JSDOM } from "jsdom";
import type { Finding, HeadInfo, PageEntry } from "./types.js";

// TODO(1): Parse `html` and return its title, meta description, canonical href,
//   parsed JSON-LD blocks, count of broken JSON-LD blocks, and body text length.
export function readHead(html: string): HeadInfo {
  throw new Error("TODO(1): readHead is not implemented yet");
}

function finding(page: string, rule: string, outcome: Finding["outcome"], detail: string): Finding {
  return { page, rule, outcome, target: "head", detail };
}

// TODO(2): Return one Finding per SEO check. Use all three outcomes; a redirect is
//   needs review and gets no other check. `finding()` above builds a Finding.
export function checkSeo(entry: PageEntry, head: HeadInfo): Finding[] {
  throw new Error("TODO(2): checkSeo is not implemented yet");
}
