import { Report } from '../domain/Report.js';
import { CheckResult } from '../domain/CheckResult.js';

/** Lints a list of commits with one parser and one rule set, whatever their source. */
export class LintCommitsUseCase {
  constructor({ parser, rules, logger }) {
    this.parser = parser;
    this.rules = rules;
    this.logger = logger;
  }

  execute(commits) {
    const report = new Report('Commit message lint');
    for (const { hash, message } of commits) {
      const parsed = this.parser.parse(message);
      const label = `${hash.slice(0, 7)} "${parsed.header}"`;
      if (parsed.ignored) {
        report.add(CheckResult.ok('ignored', `${label} skipped (merge, revert or fixup)`));
        continue;
      }
      const results = this.rules.check(parsed);
      const problems = results.filter((r) => r.level !== 'ok');
      this.logger.debug('commit linted', { hash: hash.slice(0, 7), problems: problems.length });
      if (problems.length === 0) report.add(CheckResult.ok('commit', `${label} is valid`));
      for (const p of problems) report.add(new CheckResult(p.id, p.level, `${label}: ${p.message}`));
    }
    return report;
  }
}
