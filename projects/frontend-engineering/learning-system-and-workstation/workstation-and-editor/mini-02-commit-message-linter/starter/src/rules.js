import { isBreakingToken } from "./parse.js";

// Same shape as commitlint: rule(parsed, when, value) -> [passed, message].
// "when" is "always" or "never"; "never" flips the answer.
function applyWhen(when, ok) {
  return when === "never" ? !ok : ok;
}

// TODO(2): Implement the four rules below. Each returns [passed, message]; use applyWhen.
//   typeEnum: passes when parsed.type is in the list `value` (a null type fails).
//   headerMaxLength: passes when parsed.header is at most `value` characters long.
//   subjectEmpty: with "never", an empty description fails.
//   breakingHasDescription: a breaking commit needs a BREAKING CHANGE footer with text.
export function typeEnum(parsed, when = "always", value = []) {
  throw new Error("TODO(2): typeEnum is not implemented yet");
}

export function headerMaxLength(parsed, when = "always", value = 72) {
  throw new Error("TODO(2): headerMaxLength is not implemented yet");
}

export function subjectEmpty(parsed, when = "never") {
  throw new Error("TODO(2): subjectEmpty is not implemented yet");
}

export function breakingHasDescription(parsed, when = "always") {
  throw new Error("TODO(2): breakingHasDescription is not implemented yet");
}

export const rules = {
  "type-enum": typeEnum,
  "header-max-length": headerMaxLength,
  "subject-empty": subjectEmpty,
  "breaking-has-description": breakingHasDescription,
};
