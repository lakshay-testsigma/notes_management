# 0003. Write the cookie rules as a list of data rows

## Status

Accepted, 2026-11-18.

## Context

Cookie checking has many small rules: `Secure`, `HttpOnly`, `SameSite`, the `__Host-` and `__Secure-` prefixes, size, and `Domain`. Each rule has an id, a severity and a test. Teams add rules often.

## Decision

`COOKIE_RULES` in `src/domain/checks/cookieCheck.ts` is an array of `{ id, severity, test }` rows. `CookieCheck` loops over the cookies and over the rows. A row returns a message, or null when the cookie is fine.

## Alternatives considered

- **One method per rule.** It reads well, but adding a rule touches the loop, too.
- **Rules in the policy JSON.** It lets teams change rules without code, but the tests of a rule are code, and a JSON rule language is a large feature.

## Consequences

- A new rule is one row and one test.
- All rule ids and messages are easy to list in one place.
- Rules cannot be changed by the policy file, except the `allowNoHttpOnly` list.
