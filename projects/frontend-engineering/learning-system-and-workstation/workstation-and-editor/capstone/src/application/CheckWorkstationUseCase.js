import { Report } from '../domain/Report.js';
import { CheckResult } from '../domain/CheckResult.js';
import { ConfigError } from '../domain/errors.js';
import { WORKSTATION_CHECKS } from './WorkstationChecks.js';

/** Runs every workstation check and collects the results into one report. */
export class CheckWorkstationUseCase {
  constructor({ environment, tools, logger, checks = WORKSTATION_CHECKS }) {
    if (checks.length === 0) throw new ConfigError('No workstation checks are configured.');
    this.environment = environment;
    this.tools = tools;
    this.logger = logger;
    this.checks = checks;
  }

  execute() {
    const report = new Report('Workstation check');
    const packageJson = this.#readPackageJson(report);
    for (const check of this.checks) {
      const result = check({ env: this.environment, tools: this.tools, packageJson });
      this.logger.debug('check finished', { check: result.id, level: result.level });
      report.add(result);
    }
    return report;
  }

  #readPackageJson(report) {
    const text = this.environment.readProjectFile('package.json');
    if (text === null) {
      report.add(CheckResult.warn('package-json', 'No package.json in the project folder'));
      return null;
    }
    try {
      return JSON.parse(text);
    } catch {
      report.add(CheckResult.error('package-json', 'package.json is not valid JSON'));
      return null;
    }
  }
}
