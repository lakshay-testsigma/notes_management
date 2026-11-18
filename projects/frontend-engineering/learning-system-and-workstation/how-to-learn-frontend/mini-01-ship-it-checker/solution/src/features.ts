import { baselineTable, targets, type FeatureRecord, type Target } from "./baseline.ts";

/** The ids a person can type on the command line. */
export function knownFeatureIds(): string[] {
  return baselineTable.map((feature) => feature.id);
}

/** Read the `--target` value. This part is wiring, so it is already done. */
export function parseTarget(raw: string | undefined): Target {
  const value = (raw ?? "widely").toLowerCase();
  if (!targets.includes(value)) {
    throw new Error(`Unknown Baseline target "${value}". Use one of: ${targets.join(", ")}`);
  }
  return value as Target;
}

/** Find the feature record for one id. The team types ids in lower case. */
export function resolveFeature(id: string): FeatureRecord {
  const wanted = id.trim().toLowerCase();
  const found = baselineTable.find((feature) => feature.id.toLowerCase() === wanted);
  if (!found) {
    throw new Error(`Unknown feature "${id}". Known features: ${knownFeatureIds().join(", ")}`);
  }
  return found;
}
