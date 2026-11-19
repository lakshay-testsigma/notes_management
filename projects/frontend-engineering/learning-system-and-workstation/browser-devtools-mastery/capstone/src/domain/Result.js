// A Result carries either a value or an error, so callers must look at both.
export class Result {
  constructor(ok, value, error) {
    this.ok = ok;
    this.value = value;
    this.error = error;
  }

  static ok(value) {
    return new Result(true, value, null);
  }

  static err(error) {
    return new Result(false, null, error);
  }

  // Run a function and turn a thrown error into a failed Result.
  static attempt(fn) {
    try {
      return Result.ok(fn());
    } catch (error) {
      return Result.err(error);
    }
  }
}
