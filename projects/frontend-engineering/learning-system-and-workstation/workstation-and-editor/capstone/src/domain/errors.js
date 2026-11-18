// Domain errors are classes so the interface layer can translate them into exit codes.
export class DevkitError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

/** The user typed a wrong command line. Maps to exit code 9. */
export class UsageError extends DevkitError {}

/** The configuration is broken or empty. Maps to exit code 9. */
export class ConfigError extends DevkitError {}

/** The history cannot be read safely, for example a shallow clone. Maps to exit code 1. */
export class HistoryError extends DevkitError {}
