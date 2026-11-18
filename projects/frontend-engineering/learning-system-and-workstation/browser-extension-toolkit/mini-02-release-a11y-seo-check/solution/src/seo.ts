import { JSDOM } from "jsdom";
import type { Finding, HeadInfo, PageEntry } from "./types.js";

// Read the head tags from the saved (rendered) HTML.
export function readHead(html: string): HeadInfo {
  const { document } = new JSDOM(html).window;
  const jsonLd: unknown[] = [];
  let jsonLdErrors = 0;
  for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      jsonLd.push(JSON.parse(script.textContent ?? ""));
    } catch {
      jsonLdErrors += 1; // a broken block is a finding, not a crash
    }
  }
  return {
    title: document.querySelector("title")?.textContent?.trim() || null,
    description: document.querySelector('meta[name="description"]')?.getAttribute("content") ?? null,
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
    jsonLd,
    jsonLdErrors,
    bodyTextLength: document.body?.textContent?.trim().length ?? 0,
  };
}

function finding(page: string, rule: string, outcome: Finding["outcome"], detail: string): Finding {
  return { page, rule, outcome, target: "head", detail };
}

// Turn head info into findings. "incomplete" means a person must look.
export function checkSeo(entry: PageEntry, head: HeadInfo): Finding[] {
  const page = entry.name;
  if (entry.status >= 300 && entry.status < 400) {
    // A redirect has no content of its own; the target page is checked instead.
    return [finding(page, "redirect", "incomplete", `${entry.status} to ${entry.location}`)];
  }
  const out: Finding[] = [];
  out.push(head.title
    ? finding(page, "seo-title", "pass", head.title)
    : finding(page, "seo-title", "violation", "no <title>"));
  out.push(head.description
    ? finding(page, "seo-description", "pass", "present")
    : finding(page, "seo-description", "violation", "no meta description"));
  if (!head.canonical) {
    out.push(finding(page, "seo-canonical", "violation", "no canonical link"));
  } else if (head.canonical !== entry.url) {
    out.push(finding(page, "seo-canonical", "incomplete", `points to ${head.canonical}`));
  } else {
    out.push(finding(page, "seo-canonical", "pass", head.canonical));
  }
  if (head.jsonLdErrors > 0) {
    out.push(finding(page, "seo-structured-data", "violation", "JSON-LD is not valid JSON"));
  } else if (head.jsonLd.length === 0) {
    out.push(finding(page, "seo-structured-data", "incomplete", "no JSON-LD block"));
  } else {
    out.push(finding(page, "seo-structured-data", "pass", `${head.jsonLd.length} block(s)`));
  }
  // Almost no text usually means a script shell: the content was never rendered.
  if (head.bodyTextLength < 40) {
    out.push(finding(page, "rendered-content", "incomplete", "body has almost no text; save the rendered HTML"));
  }
  return out;
}
