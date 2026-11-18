import test from 'node:test';
import assert from 'node:assert/strict';
import { VersionRange, parseVersion } from '../../src/domain/VersionRange.js';
import { CommitParser } from '../../src/domain/CommitParser.js';
import { CommitRules, conventionalPreset } from '../../src/domain/CommitRules.js';
import { CheckResult } from '../../src/domain/CheckResult.js';
import { Report } from '../../src/domain/Report.js';
import { ConfigError } from '../../src/domain/errors.js';
import { ExitCode } from '../../src/domain/ExitCode.js';

test('parseVersion reads full and partial versions', () => {
  assert.deepEqual(parseVersion('v22.12.0'), [22, 12, 0]);
  assert.deepEqual(parseVersion('24'), [24, null, null]);
  assert.equal(parseVersion('lts/*'), null);
});

test('VersionRange handles the forms used in engines.node', () => {
  assert.ok(new VersionRange('>=22.12.0').allows('v24.0.0'));
  assert.ok(!new VersionRange('>=22.12.0').allows('v22.11.0'));
  assert.ok(new VersionRange('^20.19.0 || >=22.12.0').allows('v20.20.1'));
  assert.ok(!new VersionRange('^20.19.0').allows('v22.0.0'));
  assert.ok(new VersionRange('22.x').allows('v22.5.0'));
  assert.ok(!new VersionRange('22').allows('v23.0.0'));
  assert.ok(new VersionRange('>=18 <21').allows('v20.1.0'));
});

test('VersionRange rejects a range it cannot read', () => {
  assert.throws(() => new VersionRange('>=latest'), ConfigError);
});

test('CommitParser splits type, scope, breaking mark and subject', () => {
  const p = new CommitParser().parse('feat(api)!: drop v1\n\nBody here');
  assert.equal(p.type, 'feat');
  assert.equal(p.scope, 'api');
  assert.equal(p.breaking, true);
  assert.equal(p.subject, 'drop v1');
  assert.equal(p.body, 'Body here');
});

test('CommitParser reads a BREAKING CHANGE footer', () => {
  const p = new CommitParser().parse('fix: x\n\nBREAKING CHANGE: removed y');
  assert.equal(p.breaking, true);
});

test('CommitParser drops comment lines and the scissors section like Git', () => {
  const raw = 'fix: real\n# comment\n# ------------------------ >8 ------------------------\ndiff text';
  const p = new CommitParser().parse(raw);
  assert.equal(p.header, 'fix: real');
  assert.equal(p.body, null);
});

test('CommitParser marks merge, revert and fixup commits as ignored', () => {
  const parser = new CommitParser();
  for (const h of ['Merge branch "x"', 'Revert "feat: a"', 'fixup! feat: a']) {
    assert.equal(parser.parse(h).ignored, true, h);
  }
  assert.equal(parser.parse('feat: a').ignored, false);
});

test('CommitParser returns a null type for a free-form message', () => {
  assert.equal(new CommitParser().parse('fixed stuff').type, null);
});

const lint = (message, preset = conventionalPreset()) =>
  new CommitRules(preset).check(new CommitParser().parse(message)).filter((r) => r.level !== 'ok').map((r) => r.id);

test('a valid message passes every rule', () => {
  assert.deepEqual(lint('feat(ui): add button'), []);
});

test('each rule fails on its own bad message', () => {
  assert.deepEqual(lint('fixed stuff'), ['type-empty']);
  assert.deepEqual(lint('wip: thing'), ['type-enum']);
  assert.deepEqual(lint('fix: '), ['subject-empty']);
  assert.deepEqual(lint('fix: done.'), ['subject-full-stop']);
  assert.deepEqual(lint(`fix: ${'a'.repeat(80)}`), ['header-max-length']);
});

test('CommitRules fails loudly on an empty or unknown rule set', () => {
  assert.throws(() => new CommitRules({}), /No commit rules/);
  assert.throws(() => new CommitRules({ 'made-up': ['error', 'always'] }), /Unknown commit rule/);
});

test('a rule at warn level reports a warning', () => {
  const preset = conventionalPreset({ warnRules: ['subject-full-stop'] });
  const results = new CommitRules(preset).check(new CommitParser().parse('fix: done.'));
  assert.equal(results.find((r) => r.id === 'subject-full-stop').level, 'warn');
});

test('Report: warnings pass, errors fail, strict fails on warnings', () => {
  const warnOnly = new Report('t').add(CheckResult.warn('a', 'm'));
  assert.equal(warnOnly.exitCode(), ExitCode.OK);
  assert.equal(warnOnly.exitCode({ strict: true }), ExitCode.FAILED);
  assert.equal(new Report('t').add(CheckResult.error('a', 'm')).exitCode(), ExitCode.FAILED);
});

test('CheckResult rejects an unknown level', () => {
  assert.throws(() => new CheckResult('a', 'loud', 'm'), RangeError);
});
