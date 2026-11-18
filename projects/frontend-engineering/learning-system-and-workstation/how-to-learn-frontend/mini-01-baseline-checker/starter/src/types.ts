// The small part of the browser-compat-data shape this project uses.

export type VersionAdded = string | boolean | null;

export interface SupportStatement {
  version_added?: VersionAdded;
  version_removed?: string | boolean | null;
  flags?: unknown[];
  prefix?: string;
  alternative_name?: string;
}

export interface Compat {
  support: Record<string, SupportStatement | SupportStatement[]>;
  status?: { deprecated?: boolean; experimental?: boolean; standard_track?: boolean };
}

export interface BcdNode {
  __compat?: Compat;
  [key: string]: unknown;
}

export interface BcdData {
  browsers: Record<string, { releases: Record<string, { release_date?: string }> }>;
  [key: string]: unknown;
}

// What we know about one browser after reading its support statements.
export type BrowserSupport =
  | { kind: "yes"; version: string; atMost: boolean } // atMost: BCD wrote "≤37"
  | { kind: "no" }
  | { kind: "unknown" };

export type Status = "limited" | "newly" | "widely" | "unknown";

export interface FeatureReport {
  path: string;
  status: Status;
  interoperableDate?: string; // ISO date the last core browser shipped it
  browsers: Record<string, BrowserSupport>;
  deprecated: boolean;
  experimental: boolean;
}
