import { parse } from "./parse.js";
import { rules } from "./rules.js";

// TODO(3): Run every configured rule on the parsed message.
//   Config is { ruleName: [level, when, value] }. Level 0 skips, 1 is a warning, 2 is an error.
//   Return { valid, errors, warnings, parsed }. Each problem is { name, message }.
//   valid is true when there are no errors. Throw "unknown rule: <name>" for a missing rule.
export function lint(message, config) {
  throw new Error("TODO(3): lint is not implemented yet");
}
