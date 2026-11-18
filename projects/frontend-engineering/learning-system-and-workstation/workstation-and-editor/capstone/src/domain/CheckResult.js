export const Level = Object.freeze({ OK: 'ok', WARN: 'warn', ERROR: 'error' });

/** The outcome of one check or one rule. Immutable. */
export class CheckResult {
  constructor(id, level, message) {
    if (!Object.values(Level).includes(level)) {
      throw new RangeError(`Unknown level "${level}"`);
    }
    this.id = id;
    this.level = level;
    this.message = message;
    Object.freeze(this);
  }

  static ok(id, message) {
    return new CheckResult(id, Level.OK, message);
  }

  static warn(id, message) {
    return new CheckResult(id, Level.WARN, message);
  }

  static error(id, message) {
    return new CheckResult(id, Level.ERROR, message);
  }
}
