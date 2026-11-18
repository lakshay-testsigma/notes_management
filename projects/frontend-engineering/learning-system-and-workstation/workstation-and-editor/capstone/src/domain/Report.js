import { ExitCode } from './ExitCode.js';
import { Level } from './CheckResult.js';

/** A titled list of results. Decides the exit code: only errors fail, warnings pass. */
export class Report {
  #results = [];

  constructor(title) {
    this.title = title;
  }

  add(result) {
    this.#results.push(result);
    return this;
  }

  get results() {
    return [...this.#results];
  }

  count(level) {
    return this.#results.filter((r) => r.level === level).length;
  }

  exitCode({ strict = false } = {}) {
    if (this.count(Level.ERROR) > 0) return ExitCode.FAILED;
    if (strict && this.count(Level.WARN) > 0) return ExitCode.FAILED;
    return ExitCode.OK;
  }
}
