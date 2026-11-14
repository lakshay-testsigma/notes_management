// Two error kinds map to the two non-zero exit codes of the CLI.

/** Wrong command, flag, or argument. Exit code 2. */
export class UsageError extends Error {
  constructor(message, hint = '') {
    super(message);
    this.name = 'UsageError';
    this.exitCode = 2;
    this.code = 'usage';
    this.hint = hint;
  }
}

/** The command was understood but a gate or precondition failed. Exit code 1. */
export class ValidationError extends Error {
  constructor(message, failures = []) {
    super(message);
    this.name = 'ValidationError';
    this.exitCode = 1;
    this.code = 'validation';
    this.failures = failures;
  }
}
