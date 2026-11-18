import type { Target } from "./baseline.ts";
import type { Decision } from "./decide.ts";

// TODO(4): Build the report the team reads.
//   1. Start with a header line that names the target.
//   2. Print one block per decision: the label, the verdict and the reason.
//   3. When the decision needs a fallback, print the advice, and print the detection snippet unless the feature needs a polyfill.
//   4. End with a summary line that counts the features that are safe today.
export function formatReport(target: Target, decisions: Decision[]): string {
  throw new Error("TODO(4): formatReport is not implemented yet");
}
