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

// TODO(2): Decide whether one feature is safe to ship under the team's Baseline target.
//   1. Status "widely" means every core browser supports the feature, so the verdict is "safe today".
//   2. Status "limited" always needs a fallback.
//   3. Status "newly" is safe today only when the target is a year that is not older than the year in `feature.newlyAvailable`.
//   4. When the feature needs a fallback, pick the advice from `feature.failure`: "enhancement" gives "progressive enhancement", "additive" gives "fallback content", and "critical" gives "polyfill".
//   5. The reason must name the Baseline status, so the reader sees why you decided this.
export function decideShip(feature: FeatureRecord, target: Target): Decision {
  throw new Error("TODO(2): decideShip is not implemented yet");
}
