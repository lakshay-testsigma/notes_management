import { isBreakingToken } from "./parse.js";

// Same shape as commitlint: rule(parsed, when, value) -> [passed, message].
// "when" is "always" or "never"; "never" flips the answer.
function applyWhen(when, ok) {
  return when === "never" ? !ok : ok;
}

export function typeEnum(parsed, when = "always", value = []) {
  const ok = parsed.type !== null && value.includes(parsed.type);
  return [
    applyWhen(when, ok),
    `type must ${when === "never" ? "not " : ""}be one of [${value.join(", ")}]`,
  ];
}

export function headerMaxLength(parsed, when = "always", value = 72) {
  const ok = parsed.header.length <= value;
  return [applyWhen(when, ok), `header must not be longer than ${value} characters`];
}

// "never" means: the description must not be empty.
export function subjectEmpty(parsed, when = "never") {
  const isEmpty = !parsed.description;
  return [
    applyWhen(when, isEmpty),
    when === "never" ? "description may not be empty" : "description must be empty",
  ];
}

// A breaking commit must explain itself in a "BREAKING CHANGE: ..." footer.
export function breakingHasDescription(parsed, when = "always") {
  const explained = parsed.footers.some((f) => isBreakingToken(f.token) && f.value !== "");
  const ok = !parsed.breaking || explained;
  return [applyWhen(when, ok), "a breaking change needs a 'BREAKING CHANGE: <text>' footer"];
}

export const rules = {
  "type-enum": typeEnum,
  "header-max-length": headerMaxLength,
  "subject-empty": subjectEmpty,
  "breaking-has-description": breakingHasDescription,
};
