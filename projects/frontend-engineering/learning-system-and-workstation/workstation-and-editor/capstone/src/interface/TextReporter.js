import { Level } from '../domain/CheckResult.js';

const MARK = { [Level.OK]: 'ok   ', [Level.WARN]: 'warn ', [Level.ERROR]: 'ERROR' };

/** Formats a Report as plain text, one line per result and a summary line. */
export class TextReporter {
  format(report) {
    const lines = [report.title];
    for (const r of report.results) lines.push(`  ${MARK[r.level]} ${r.id}: ${r.message}`);
    lines.push(`${report.count(Level.ERROR)} error(s), ${report.count(Level.WARN)} warning(s)`);
    return lines.join('\n');
  }
}
