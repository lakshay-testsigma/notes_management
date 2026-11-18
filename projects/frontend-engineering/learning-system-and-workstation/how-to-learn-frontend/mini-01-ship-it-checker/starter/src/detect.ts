import type { FeatureRecord } from "./baseline.ts";

export interface Detection {
  /** The runtime check that tells you whether the browser has the feature. */
  snippet: string;
  /** True when no runtime check can rescue the feature. */
  needsPolyfill: boolean;
}

// TODO(3): Write the runtime check for one feature.
//   1. A CSS feature gets an `@supports` test, because the browser runs it while it parses the CSS.
//   2. A JavaScript feature gets the boolean expression from `feature.condition`.
//   3. A feature whose `failure` is "critical" cannot be rescued by a check, so set `needsPolyfill` to true.
export function buildDetection(feature: FeatureRecord): Detection {
  throw new Error("TODO(3): buildDetection is not implemented yet");
}
