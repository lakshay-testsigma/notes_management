import type { FeatureRecord } from "./baseline.ts";

export interface Detection {
  /** The runtime check that tells you whether the browser has the feature. */
  snippet: string;
  /** True when no runtime check can rescue the feature. */
  needsPolyfill: boolean;
}

/** Write the runtime check for one feature. */
export function buildDetection(feature: FeatureRecord): Detection {
  // A critical feature breaks the page where it is missing, so no test can save it.
  const needsPolyfill = feature.failure === "critical";
  // CSS support is checked in CSS, so the browser runs the test while it parses the stylesheet.
  const snippet = feature.kind === "css" ? `@supports ${feature.condition}` : feature.condition;
  return { snippet, needsPolyfill };
}
