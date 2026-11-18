import type { FeatureRecord, Target } from "./baseline.ts";
import { buildDetection, type Detection } from "./detect.ts";

/** What the team should do when a feature is outside the target. */
export type Advice = "progressive enhancement" | "fallback content" | "polyfill";

export interface Decision {
  feature: FeatureRecord;
  verdict: "safe today" | "needs a fallback";
  reason: string;
  advice: Advice | null;
  detection: Detection | null;
}

/** The year a feature became Newly available, as a number. */
function newlyYear(feature: FeatureRecord): number {
  return Number((feature.newlyAvailable ?? "0000-00").slice(0, 4));
}

/** Explain the verdict in one sentence. */
function reasonFor(feature: FeatureRecord, target: Target, safe: boolean): string {
  if (feature.status === "widely") {
    return `Widely available since ${feature.widelyAvailable}, so every core browser supports it.`;
  }
  if (feature.status === "limited") {
    return "Limited availability: not every core browser supports it yet.";
  }
  if (target === "widely") {
    return `Newly available since ${feature.newlyAvailable}, so it is not Widely available yet.`;
  }
  return safe
    ? `Newly available since ${feature.newlyAvailable}, and the Baseline ${target} target includes it.`
    : `Newly available since ${feature.newlyAvailable}, and the Baseline ${target} target does not include it yet.`;
}

/** Decide whether one feature is safe to ship under the team's Baseline target. */
export function decideShip(feature: FeatureRecord, target: Target): Decision {
  // A widely available feature is safe for every site, whatever target the team picked.
  const safe =
    feature.status === "widely" ||
    (feature.status === "newly" && target !== "widely" && Number(target) >= newlyYear(feature));

  if (safe) {
    return {
      feature,
      verdict: "safe today",
      reason: reasonFor(feature, target, true),
      advice: null,
      detection: null,
    };
  }

  // The failure mode of the feature decides what the team has to ship.
  const advice: Advice =
    feature.failure === "critical"
      ? "polyfill"
      : feature.failure === "additive"
        ? "fallback content"
        : "progressive enhancement";

  return {
    feature,
    verdict: "needs a fallback",
    reason: reasonFor(feature, target, false),
    advice,
    detection: buildDetection(feature),
  };
}
