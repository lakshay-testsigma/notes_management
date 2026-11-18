import { CheckResult, Level } from './CheckResult.js';
import { ConfigError } from './errors.js';

export const TYPES = ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'];

// Rules are data: every rule has the same shape, (commit, applies, value) -> [passed, message].
// "always" means the rule must hold, "never" means it must not hold.
const RULES = {
  'type-empty': (c, when) => [when === 'never' ? c.type !== null : c.type === null, 'type must be present'],
  'type-enum': (c, when, allowed) => [c.type === null || allowed.includes(c.type), `type must be one of: ${allowed.join(', ')}`],
  'subject-empty': (c, when) => [c.subject.length > 0, 'subject must not be empty'],
  'subject-full-stop': (c, when) => [!c.subject.endsWith('.'), 'subject must not end with "."'],
  'header-max-length': (c, when, max) => [c.header.length <= max, `header must be at most ${max} characters`],
};

/** The conventional preset as plain data: [level, when, value]. */
export function conventionalPreset({ maxHeader = 72, warnRules = [] } = {}) {
  const level = (name) => (warnRules.includes(name) ? Level.WARN : Level.ERROR);
  return {
    'type-empty': [level('type-empty'), 'never'],
    'type-enum': [level('type-enum'), 'always', TYPES],
    'subject-empty': [level('subject-empty'), 'never'],
    'subject-full-stop': [level('subject-full-stop'), 'never'],
    'header-max-length': [level('header-max-length'), 'always', maxHeader],
  };
}

/** Runs the configured rules. Fails loudly when the config is empty or names a missing rule. */
export class CommitRules {
  constructor(config) {
    const names = Object.keys(config);
    if (names.length === 0) throw new ConfigError('No commit rules are configured. Refusing to pass every message.');
    const unknown = names.filter((n) => !(n in RULES));
    if (unknown.length > 0) throw new ConfigError(`Unknown commit rule(s): ${unknown.join(', ')}`);
    this.config = config;
  }

  check(commit) {
    return Object.entries(this.config).map(([name, [level, when, value]]) => {
      const [passed, message] = RULES[name](commit, when, value);
      return passed ? CheckResult.ok(name, message) : new CheckResult(name, level, message);
    });
  }
}
