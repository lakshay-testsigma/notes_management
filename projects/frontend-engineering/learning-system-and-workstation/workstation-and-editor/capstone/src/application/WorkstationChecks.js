import { CheckResult } from '../domain/CheckResult.js';
import { VersionRange, parseVersion } from '../domain/VersionRange.js';

// Every check has one shape: (context) -> CheckResult.
// The context is { env, tools: {required, optional}, packageJson }.

function engineCheck({ env, packageJson }) {
  const id = 'node-engines';
  const range = packageJson?.engines?.node;
  if (!range) return CheckResult.warn(id, 'package.json has no engines.node, so the Node version is not pinned for users');
  const actual = env.nodeVersion();
  return new VersionRange(range).allows(actual)
    ? CheckResult.ok(id, `Node ${actual} satisfies engines.node "${range}"`)
    : CheckResult.error(id, `Node ${actual} does not satisfy engines.node "${range}"`);
}

function nvmrcCheck({ env }) {
  const id = 'node-nvmrc';
  const text = env.readProjectFile('.nvmrc');
  if (text === null) return CheckResult.warn(id, 'No .nvmrc file, so version managers cannot pick a Node version');
  const wanted = parseVersion(text);
  if (!wanted) return CheckResult.warn(id, `.nvmrc says "${text.trim()}", an alias that cannot be checked offline`);
  const actual = parseVersion(env.nodeVersion());
  if (wanted[0] !== actual[0]) {
    return CheckResult.error(id, `.nvmrc wants Node ${text.trim()} but you run ${env.nodeVersion()}. Run: nvm use`);
  }
  const exact = wanted.slice(1).some((p, i) => p !== null && p !== actual[i + 1]);
  return exact
    ? CheckResult.warn(id, `.nvmrc wants ${text.trim()}, you run ${env.nodeVersion()} (same major version)`)
    : CheckResult.ok(id, `Node ${env.nodeVersion()} matches .nvmrc "${text.trim()}"`);
}

function gitIdentityCheck({ env }) {
  const id = 'git-identity';
  const name = env.gitConfig('user.name');
  const email = env.gitConfig('user.email');
  if (!name || !email) {
    return CheckResult.error(id, 'Git has no identity. Run: git config --global user.name "..." and user.email "..."');
  }
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
    ? CheckResult.ok(id, `Git identity is ${name} <${email}>`)
    : CheckResult.warn(id, `Git email "${email}" does not look like an email address`);
}

function requiredToolsCheck({ env, tools }) {
  const missing = tools.required.filter((t) => env.findOnPath(t) === null);
  return missing.length === 0
    ? CheckResult.ok('tools-required', `Found on PATH: ${tools.required.join(', ')}`)
    : CheckResult.error('tools-required', `Not on PATH: ${missing.join(', ')}. Install them or fix your PATH.`);
}

function optionalToolsCheck({ env, tools }) {
  const missing = tools.optional.filter((t) => env.findOnPath(t) === null);
  return missing.length === 0
    ? CheckResult.ok('tools-optional', `Found on PATH: ${tools.optional.join(', ')}`)
    : CheckResult.warn('tools-optional', `Optional tools not on PATH: ${missing.join(', ')}`);
}

function packageManagerCheck({ env, packageJson }) {
  const id = 'package-manager';
  const pinned = packageJson?.packageManager;
  if (!pinned) return CheckResult.ok(id, 'No packageManager field to check');
  const tool = pinned.split('@')[0];
  if (env.findOnPath(tool)) return CheckResult.ok(id, `${tool} is on PATH (project pins ${pinned})`);
  return env.findOnPath('corepack')
    ? CheckResult.warn(id, `Project pins ${pinned}. Run: corepack enable`)
    : CheckResult.error(id, `Project pins ${pinned}, but neither ${tool} nor corepack is on PATH`);
}

export const WORKSTATION_CHECKS = [
  engineCheck,
  nvmrcCheck,
  gitIdentityCheck,
  requiredToolsCheck,
  optionalToolsCheck,
  packageManagerCheck,
];
