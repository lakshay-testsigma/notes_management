# 0001. Keep the permission policy as a JSON file that is validated first

## Status

Accepted, 2026-11-18.

## Context

The team lead decides which extension permissions are risky. That decision changes more often than the code: a new API appears, or the team accepts one more host. If the numbers sit in code, every change needs a code review and a release. A typo in a policy file is also dangerous: a missing key would read as `undefined`, and every extension would quietly pass.

## Decision

The policy is a JSON file (`policy/permission-policy.json`). `Policy.fromJson` checks the shape of the whole file and throws one `PolicyError` that lists every problem. `ProfileLoader` runs this check before it reads the profile, and the profile is checked before any manifest is read. The page checks run only after the profile has no failure.

## Alternatives considered

- **Constants in the code.** Simple, but a policy change becomes a code change, and the lead cannot edit it alone.
- **A JSON Schema validator such as Ajv.** It is a good tool, but it adds a dependency and a second language for a file with eight keys. Plain checks in `Policy.fromJson` are easy to read and give clear messages. The `Rules as data` pattern from axe-core works the same way: data plus an early shape check.
- **Check the policy lazily, when a rule is used.** A wrong key would show up halfway through a run, after some output was already printed.

## Consequences

- A broken policy fails in the first second, with exit code 2 and a list of what is wrong.
- Adding a key to the policy means changing `Policy.fromJson` and its test.
- The policy file is part of the team's review: it is small enough to read in one screen.
