import { parse } from "./parse.js";
import { rules } from "./rules.js";

export function lint(message, config) {
  const parsed = parse(message);
  const errors = [];
  const warnings = [];

  for (const [name, [level, when, value]] of Object.entries(config)) {
    if (level === 0) continue;
    const rule = rules[name];
    if (!rule) throw new Error(`unknown rule: ${name}`);
    const [passed, text] = rule(parsed, when, value);
    if (passed) continue;
    (level === 2 ? errors : warnings).push({ name, message: text });
  }

  // Only error-level problems make a message invalid.
  return { valid: errors.length === 0, errors, warnings, parsed };
}
