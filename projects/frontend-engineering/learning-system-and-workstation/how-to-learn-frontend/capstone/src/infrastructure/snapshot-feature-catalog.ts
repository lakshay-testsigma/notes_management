import type { FeatureData, ReleaseTable, Compat } from "../domain/feature.js";
import type { FeatureCatalog } from "../domain/ports.js";

export interface FeatureSnapshot {
  source: string; // package and version the data came from
  browsers: ReleaseTable;
  features: Record<string, Compat>;
}

// Serves features from a small JSON file built at development time, so the browser
// never downloads the whole data set.
export class SnapshotFeatureCatalog implements FeatureCatalog {
  constructor(private readonly snapshot: FeatureSnapshot) {}

  find(key: string): FeatureData | undefined {
    const compat = this.snapshot.features[key];
    return compat ? { key, compat, releases: this.snapshot.browsers } : undefined;
  }

  keys(): string[] {
    return Object.keys(this.snapshot.features);
  }
}
