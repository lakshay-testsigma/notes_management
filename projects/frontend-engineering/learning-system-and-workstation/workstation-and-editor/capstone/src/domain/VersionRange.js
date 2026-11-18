import { ConfigError } from './errors.js';

/** Turns "v22.12.0" or "24" into [major, minor, patch]. Missing parts are null. */
export function parseVersion(text) {
  const match = /^v?(\d+)(?:\.(\d+|x|\*))?(?:\.(\d+|x|\*))?$/.exec(String(text).trim());
  if (!match) return null;
  const part = (p) => (p === undefined || p === 'x' || p === '*' ? null : Number(p));
  return [Number(match[1]), part(match[2]), part(match[3])];
}

function compare(a, b) {
  for (let i = 0; i < 3; i += 1) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

/**
 * The small part of semver that `engines.node` uses in real projects:
 * ">=22.12.0", "^20.19.0", "22.x", "22", and several of them joined with "||".
 */
export class VersionRange {
  constructor(text) {
    this.text = text;
    this.alternatives = String(text)
      .split('||')
      .map((alt) => alt.trim().split(/\s+/).map(VersionRange.#parseComparator));
  }

  static #parseComparator(token) {
    const match = /^(>=|<=|>|<|\^|~|=)?(.+)$/.exec(token);
    const version = parseVersion(match[2]);
    if (!version) throw new ConfigError(`Cannot read version range "${token}"`);
    return { op: match[1] ?? '=', version };
  }

  static #test({ op, version }, actual) {
    const [major, minor] = version;
    switch (op) {
      case '>=': return compare(actual, version) >= 0;
      case '>': return compare(actual, version) > 0;
      case '<=': return compare(actual, version) <= 0;
      case '<': return compare(actual, version) < 0;
      case '^': return actual[0] === major && compare(actual, version) >= 0;
      case '~': return actual[0] === major && actual[1] === (minor ?? actual[1]) && compare(actual, version) >= 0;
      default: // "=", "22", "22.x": every given part must match
        return version.every((part, i) => part === null || part === actual[i]);
    }
  }

  allows(versionText) {
    const actual = parseVersion(versionText);
    if (!actual) return false;
    return this.alternatives.some((all) => all.every((c) => VersionRange.#test(c, actual)));
  }
}
