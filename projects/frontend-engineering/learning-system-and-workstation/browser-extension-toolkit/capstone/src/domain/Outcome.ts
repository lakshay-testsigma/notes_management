// Every check ends in one of three outcomes. "review" means a person must look:
// the tool could not see enough to say pass or fail (axe-core calls this "incomplete").
export type Outcome = "pass" | "fail" | "review";

export interface CheckResult {
  check: string; // rule id, for example "header-csp"
  target: string; // what was checked: a URL, an extension id
  outcome: Outcome;
  message: string;
}
