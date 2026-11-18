import type {
  Baseline, BrowserSupport, Compat, FeatureData, FeatureStatus, SupportStatement,
} from "./feature.js";

// The Baseline core browser set, written as browser-compat-data keys. It is data, not logic.
export const CORE_BROWSERS = [
  "chrome", "chrome_android", "edge", "firefox", "firefox_android", "safari", "safari_ios",
];

export const WIDELY_AFTER_MONTHS = 30;

// Baseline-style status from per-browser data. The package has no Baseline field, so we compute it.
export class BaselineCalculator {
  constructor(private readonly coreBrowsers: string[] = CORE_BROWSERS) {}

  statusFor(feature: FeatureData, now: Date): FeatureStatus {
    const { compat } = feature;
    const base = {
      key: feature.key,
      maybeEarlier: false,
      deprecated: compat.status?.deprecated ?? false,
      experimental: compat.status?.experimental ?? false,
    };
    const support = this.coreBrowsers.map((browser) => ({ browser, found: this.supportFor(compat, browser) }));

    if (support.some((s) => s.found.kind === "no")) return { ...base, baseline: "limited" };

    const dates: string[] = [];
    let maybeEarlier = false;
    for (const { browser, found } of support) {
      const date = found.kind === "yes" ? feature.releases[browser]?.[found.version]?.release_date : undefined;
      // A missing date means "unknown", never "no": honest uncertainty.
      if (found.kind !== "yes" || !date) return { ...base, baseline: "unknown" };
      if (found.atMost) maybeEarlier = true;
      dates.push(date);
    }
    const interoperableDate = [...dates].sort().at(-1) as string; // last core browser to ship
    return { ...base, maybeEarlier, interoperableDate, baseline: this.classify(interoperableDate, now) };
  }

  // Limited before all core browsers ship it, Newly for 30 months after, then Widely.
  classify(interopDate: string, now: Date): Baseline {
    const shipped = new Date(`${interopDate}T00:00:00Z`);
    if (shipped > now) return "limited";
    const widely = new Date(shipped);
    widely.setUTCMonth(widely.getUTCMonth() + WIDELY_AFTER_MONTHS);
    return now >= widely ? "widely" : "newly";
  }

  supportFor(compat: Compat, browser: string): BrowserSupport {
    const raw = compat.support[browser];
    if (raw === undefined) return { kind: "no" };
    const statements: SupportStatement[] = Array.isArray(raw) ? raw : [raw];
    // Flags, prefixes and old names do not count as "works without a fallback".
    const current = statements.filter((s) => !s.flags && !s.prefix && !s.alternative_name)[0];
    if (!current || current.version_removed) return { kind: "no" };
    return this.parseVersion(current.version_added);
  }

  private parseVersion(value: string | boolean | null | undefined): BrowserSupport {
    if (value === false || value === "preview") return { kind: "no" };
    if (typeof value !== "string") return { kind: "unknown" };
    const atMost = value.startsWith("≤");
    return { kind: "yes", version: atMost ? value.slice(1) : value, atMost };
  }
}
