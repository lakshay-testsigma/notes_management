// TODO(1): parse(message) -> { header, type, scope, breaking, description, body, footers }.
//   Goal: split a commit message by the Conventional Commits format.
//   - header = first line; type/scope/description come from "type(scope)!: description".
//   - A "!" before the colon, or a "BREAKING CHANGE" footer, sets breaking to true.
//   - body = the paragraphs after the header; footers = [{ token, value }] from the last paragraph.
//   - A header that does not match gives type null and description null.
export function parse(message) {
  throw new Error("TODO(1): parse is not implemented yet");
}

// Complete: tells the rules and bumpFor which footer tokens mean "breaking".
export function isBreakingToken(token) {
  return token === "BREAKING CHANGE" || token === "BREAKING-CHANGE";
}
