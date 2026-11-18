// Thrown when an input file cannot be trusted. The use case turns it into a
// "skipped" row instead of letting it crash the whole run.
export class InputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InputError";
  }
}

// Thrown for bad command line flags or a bad budgets file.
export class UsageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UsageError";
  }
}
