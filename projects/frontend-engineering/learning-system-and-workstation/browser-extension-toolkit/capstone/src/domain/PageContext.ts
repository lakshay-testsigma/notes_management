import type { ResponseHeaders } from "./ResponseHeaders.ts";

// Plain facts about a page, read once from the HTML (no DOM objects leak out).
export interface ParsedPage {
  title: string | null;
  metaDescription: string | null;
  canonical: string | null;
  jsonLdBlocks: string[];
}

// Everything a check may look at. Built once, shared by every check.
export interface PageContext {
  url: string;
  html: string;
  page: ParsedPage;
  headers: ResponseHeaders | null; // null: no saved headers were given
}

export interface AxeRule {
  id: string;
  help: string;
  nodes: number;
}

export interface AxeFindings {
  violations: AxeRule[];
  incomplete: AxeRule[];
  passes: number;
}
