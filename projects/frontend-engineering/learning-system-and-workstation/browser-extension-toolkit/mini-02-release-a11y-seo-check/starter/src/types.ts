// axe gives three outcomes; the SEO checks use the same three.
export type Outcome = "violation" | "pass" | "incomplete";

export interface Finding {
  page: string; // page name from pages.json, such as "home"
  rule: string; // axe rule id or SEO check id
  outcome: Outcome;
  target: string; // CSS selector for axe, "head" for SEO checks
  detail: string;
}

// One saved release page. `status` and `location` come from the crawl log.
export interface PageEntry {
  name: string;
  file: string;
  url: string;
  status: number;
  location?: string;
}

export interface HeadInfo {
  title: string | null;
  description: string | null;
  canonical: string | null;
  jsonLd: unknown[]; // parsed JSON-LD blocks
  jsonLdErrors: number; // blocks that are not valid JSON
  bodyTextLength: number;
}
