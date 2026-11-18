import { DomainError, ValidationError } from "../domain/errors.js";

// Turns any thrown value into sentences for the screen. Unknown errors get a generic line
// here; the caller still logs them with context.
export function describeError(error: unknown): string[] {
  if (error instanceof ValidationError) return error.issues;
  if (error instanceof DomainError) return [error.message];
  return ["Something unexpected went wrong. Reload the page and try again."];
}
