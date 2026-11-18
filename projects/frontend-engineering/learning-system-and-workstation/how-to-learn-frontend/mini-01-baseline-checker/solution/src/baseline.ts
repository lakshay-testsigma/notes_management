import type { BcdData, BrowserSupport, FeatureReport, Status } from "./types.js";
import { getFeature } from "./bcd.js";
import { supportFor } from "./support.js";

// The Baseline core browser set, written as browser-compat-data keys.
export const CORE_BROWSERS = [
  "chrome",
  "chrome_android",
  "edge",
  "firefox",
  "firefox_android",
  "safari",
  "safari_ios",
];

export const WIDELY_AFTER_MONTHS = 30;

function toDate(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

export function addMonths(iso: string, months: number): Date {
  const date = toDate(iso);
  date.setUTCMonth(date.getUTCMonth() + months);
  return date;
}

// The day the LAST core browser shipped the feature: the latest of the release dates.
export function interoperableDate(releaseDates: string[]): string {
  return [...releaseDates].sort().at(-1) as string; // ISO dates sort as text
}

// Limited before all browsers ship it, Newly for 30 months after, then Widely.
export function classify(interopDate: string | undefined, now: Date): Status {
  if (!interopDate || toDate(interopDate) > now) return "limited";
  return now >= addMonths(interopDate, WIDELY_AFTER_MONTHS) ? "widely" : "newly";
}

function releaseDate(data: BcdData, browser: string, version: string): string | undefined {
  return data.browsers[browser]?.releases[version]?.release_date;
}

export function checkFeature(data: BcdData, path: string, now: Date): FeatureReport {
  const compat = getFeature(data, path);
  const browsers: Record<string, BrowserSupport> = {};
  for (const browser of CORE_BROWSERS) browsers[browser] = supportFor(compat, browser);
  const results = Object.values(browsers);

  const base = {
    path,
    browsers,
    deprecated: compat.status?.deprecated ?? false,
    experimental: compat.status?.experimental ?? false,
  };
  if (results.some((r) => r.kind === "no")) return { ...base, status: "limited" };

  const dates: string[] = [];
  for (const [browser, support] of Object.entries(browsers)) {
    const date = support.kind === "yes" ? releaseDate(data, browser, support.version) : undefined;
    if (!date) return { ...base, status: "unknown" }; // a missing date: say "unknown", not "no"
    dates.push(date);
  }
  const date = interoperableDate(dates);
  return { ...base, status: classify(date, now), interoperableDate: date };
}
