import { parseCliArgs, USAGE } from './CliArgs.js';
import { ExitCode } from '../domain/ExitCode.js';
import { ConfigError, HistoryError, UsageError } from '../domain/errors.js';

/** Turns a command line into one use-case call, prints the result, and returns an exit code. */
export class Cli {
  constructor({ doctorFor, lint, notes, commitSource, reporter, stdout, stderr, logger }) {
    Object.assign(this, { doctorFor, lint, notes, commitSource, reporter, stdout, stderr, logger });
  }

  run(argv) {
    try {
      const { command, options } = parseCliArgs(argv);
      return this.#dispatch(command, options);
    } catch (error) {
      return this.#translate(error);
    }
  }

  #dispatch(command, options) {
    if (command === 'doctor') return this.#doctor(options);
    if (command === 'lint') return this.#lint(options);
    return this.#notes(options);
  }

  #doctor(options) {
    const report = this.doctorFor(options.project ?? process.cwd()).execute();
    this.stdout(this.reporter.format(report));
    return report.exitCode({ strict: options.strict });
  }

  #commits(options) {
    const chosen = [options.edit !== undefined, options.last === true, options.from !== undefined || options.to !== undefined];
    if (chosen.filter(Boolean).length !== 1) throw new UsageError('Choose one source: --edit FILE, --last, or --from REF --to REF');
    if (options.edit !== undefined) return this.commitSource.fromFile(options.edit);
    if (options.last) return this.commitSource.last();
    if (!options.from || !options.to) throw new UsageError('A range needs both --from and --to');
    return this.commitSource.range(options.from, options.to);
  }

  #lint(options) {
    const report = this.lint.execute(this.#commits(options));
    this.stdout(this.reporter.format(report));
    return report.exitCode({ strict: options.strict });
  }

  #notes(options) {
    if (!options.from || !options.to) throw new UsageError('notes needs --from and --to');
    const markdown = this.notes.execute(this.commitSource.range(options.from, options.to), {
      version: options.version,
      date: options.date,
    });
    this.stdout(markdown);
    return ExitCode.OK;
  }

  #translate(error) {
    if (error instanceof UsageError) {
      this.stderr(`${error.message}\n${USAGE}`);
      return ExitCode.USAGE;
    }
    if (error instanceof ConfigError) {
      this.stderr(`Configuration problem: ${error.message}`);
      return ExitCode.USAGE;
    }
    if (error instanceof HistoryError) {
      this.stderr(error.message);
      return ExitCode.FAILED;
    }
    // Unexpected: log with context, never swallow, and still fail.
    this.logger.error('unexpected error', { errorName: error.name, error: error.message, stack: error.stack });
    this.stderr(`Unexpected error: ${error.message}`);
    return ExitCode.FAILED;
  }
}
