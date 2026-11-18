import type { BaselineCalculator } from "../domain/baseline-calculator.js";
import type { FeatureStatus } from "../domain/feature.js";
import type { FeatureKeyExtractor } from "../domain/feature-key-extractor.js";
import type { FeatureCatalog } from "../domain/ports.js";

// One badge per feature key found in the text. status is undefined when the key is not in the snapshot.
export interface FeatureLookup {
  key: string;
  status?: FeatureStatus;
}

export class GetFeatureStatuses {
  constructor(
    private readonly catalog: FeatureCatalog,
    private readonly extractor: FeatureKeyExtractor,
    private readonly calculator: BaselineCalculator,
    private readonly now: () => Date,
  ) {}

  execute(text: string): FeatureLookup[] {
    return this.extractor.extract(text).map((key) => {
      const data = this.catalog.find(key);
      return data ? { key, status: this.calculator.statusFor(data, this.now()) } : { key };
    });
  }
}
