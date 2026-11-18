// The small part of the browser-compat-data shape this project uses.
// It is the same shape as mini project 1, so the status rule carries over.

export interface SupportStatement {
  version_added?: string | boolean | null;
  version_removed?: string | boolean | null;
  flags?: unknown[];
  prefix?: string;
  alternative_name?: string;
}

export interface Compat {
  support: Record<string, SupportStatement | SupportStatement[]>;
  status?: { deprecated?: boolean; experimental?: boolean; standard_track?: boolean };
}

// browser name -> version -> release date
export type ReleaseTable = Record<string, Record<string, { release_date?: string }>>;

// What the catalog returns for one feature key such as "css.properties.gap".
export interface FeatureData {
  key: string;
  compat: Compat;
  releases: ReleaseTable;
}

export type BrowserSupport =
  | { kind: "yes"; version: string; atMost: boolean } // atMost: the data says "≤37"
  | { kind: "no" }
  | { kind: "unknown" };

export type Baseline = "limited" | "newly" | "widely" | "unknown";

export interface FeatureStatus {
  key: string;
  baseline: Baseline;
  interoperableDate?: string; // ISO date the last core browser shipped it
  maybeEarlier: boolean; // some version was "≤N", so the date is an upper bound
  deprecated: boolean;
  experimental: boolean;
}
