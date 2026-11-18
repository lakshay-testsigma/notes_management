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

// TODO(1): Find the feature record for one id.
//   1. Walk `baselineTable` and compare each `id` with the given id, ignoring case.
//   2. Return the record you found.
//   3. Throw an Error that names the known ids when no record matches.
export function resolveFeature(id: string): FeatureRecord {
  throw new Error("TODO(1): resolveFeature is not implemented yet");
}
