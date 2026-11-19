# 0002. Validate every form value at the domain boundary, before generation or storage

## Status

Accepted, 2026-11-19.

## Context

The git name and email that a developer types end up inside a generated shell
script and a `.gitconfig` file. If a value is allowed to reach the generator
unchecked, a newline or shell metacharacter could inject lines into the
installer. The form alone cannot be trusted: the same `DeveloperConfig.create`
is also called on data read back from local storage, which the developer did
not just type.

## Decision

`DeveloperConfig.create` takes `unknown` and validates every field against an
allow-list before it constructs the object. The git name and email get the
tightest check — a conservative allow-list with no newlines. Each rejection
throws an `InvalidConfigError` with a fixed code that names the failure class.

## Alternatives considered

- **Validate only in the React form.** A second caller (storage `load`) or a
  future CLI would bypass the check, and the rule would live in the view where
  it cannot be unit-tested without rendering.
- **Escape rather than reject.** Escaping keeps hostile text but changes what
  the developer meant; rejecting names it as wrong at the source, which is what
  nvm does to values that will reach a shell.

## Consequences

- No invalid value can reach the generator, storage, or downloader; the trust
  boundary is one class with a unit test that attacks it.
- The developer gets a field-level message with a code the UI can branch on.
- Some legitimate names with unusual characters are rejected; the allow-list is
  documented in the error message so the limit is visible.
