/**
 * A small snapshot of Baseline statuses.
 *
 * The dated rows come from the Baseline page (web.dev) as it stood on 2026-11-18:
 * CSS Nesting became Newly available in August 2023, `:has()` in December 2023,
 * the `<search>` element in October 2023 and Popover in January 2025. A feature
 * becomes Widely available 30 months after that month.
 *
 * This table is a teaching snapshot, not the live `web-features` dataset. Add
 * your own rows and check web.dev before you trust a status.
 */

export type BaselineStatus = "limited" | "newly" | "widely";

/** "css" features are tested with `@supports`; "js" features with a member test. */
export type FeatureKind = "css" | "js";

/** How the feature fails in a browser that does not support it. */
export type FailureMode = "enhancement" | "additive" | "critical";

export interface FeatureRecord {
  /** The name a person types on the command line. */
  id: string;
  label: string;
  kind: FeatureKind;
  status: BaselineStatus;
  /** The month the feature became Newly available, as "YYYY-MM". */
  newlyAvailable: string | null;
  /** The month the feature became Widely available, as "YYYY-MM". */
  widelyAvailable: string | null;
  /** How the feature fails where it is missing. Your team records this. */
  failure: FailureMode;
  /** The expression that tells you whether the browser has the feature. */
  condition: string;
}

export const baselineTable: FeatureRecord[] = [
  {
    id: "css-nesting",
    label: "CSS Nesting",
    kind: "css",
    status: "widely",
    newlyAvailable: "2023-08",
    widelyAvailable: "2026-02",
    failure: "enhancement",
    condition: "selector(&)",
  },
  {
    id: "has",
    label: "CSS :has()",
    kind: "css",
    status: "widely",
    newlyAvailable: "2023-12",
    widelyAvailable: "2026-06",
    failure: "enhancement",
    condition: "selector(:has(*))",
  },
  {
    id: "search-element",
    label: "<search> element",
    kind: "js",
    status: "widely",
    newlyAvailable: "2023-10",
    widelyAvailable: "2026-04",
    failure: "additive",
    condition: '!(document.createElement("search") instanceof HTMLUnknownElement)',
  },
  {
    id: "popover",
    label: "Popover API",
    kind: "js",
    status: "newly",
    newlyAvailable: "2025-01",
    widelyAvailable: null,
    failure: "enhancement",
    condition: '"popover" in HTMLElement.prototype',
  },
  {
    id: "limited-example",
    label: "Limited example (teaching row)",
    kind: "js",
    status: "limited",
    newlyAvailable: null,
    widelyAvailable: null,
    failure: "critical",
    condition: '"someFutureApi" in window',
  },
];

/** The Baseline targets a team can pick. "widely" means "safe for every site". */
export const targets: readonly string[] = ["widely", "2023", "2024", "2025", "2026"];

export type Target = "widely" | "2023" | "2024" | "2025" | "2026";
