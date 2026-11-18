import test from 'node:test';
import assert from 'node:assert/strict';
import { CheckWorkstationUseCase } from '../../src/application/CheckWorkstationUseCase.js';
import { LintCommitsUseCase } from '../../src/application/LintCommitsUseCase.js';
import { WriteReleaseNotesUseCase } from '../../src/application/WriteReleaseNotesUseCase.js';
import { CommitParser } from '../../src/domain/CommitParser.js';
import { CommitRules, conventionalPreset } from '../../src/domain/CommitRules.js';
import { FakeEnvironment, commit, silentLogger } from '../support/fakes.js';

const tools = { required: ['node', 'git'], optional: ['code'] };
const doctor = (env, opts = {}) =>
  new CheckWorkstationUseCase({ environment: env, tools, logger: silentLogger, ...opts }).execute();
const levelOf = (report, id) => report.results.find((r) => r.id === id).level;
const pkg = (extra = {}) => JSON.stringify({ name: 'x', engines: { node: '>=22' }, ...extra });

test('a healthy workstation passes with no errors', () => {
  const report = doctor(new FakeEnvironment({ files: { 'package.json': pkg(), '.nvmrc': '24\n' } }));
  assert.equal(report.count('error'), 0);
  assert.equal(report.exitCode(), 0);
});

test('a Node version outside engines is an error', () => {
  const env = new FakeEnvironment({ node: 'v20.1.0', files: { 'package.json': pkg() } });
  assert.equal(levelOf(doctor(env), 'node-engines'), 'error');
});

test('a wrong .nvmrc major is an error, a wrong minor is a warning, an alias is a warning', () => {
  const run = (nvmrc) => levelOf(doctor(new FakeEnvironment({ files: { 'package.json': pkg(), '.nvmrc': nvmrc } })), 'node-nvmrc');
  assert.equal(run('22'), 'error');
  assert.equal(run('24.9.0'), 'warn');
  assert.equal(run('lts/*'), 'warn');
  assert.equal(run('v24.1.0'), 'ok');
});

test('missing .nvmrc and missing engines are warnings, not errors', () => {
  const report = doctor(new FakeEnvironment({ files: { 'package.json': '{}' } }));
  assert.equal(levelOf(report, 'node-nvmrc'), 'warn');
  assert.equal(levelOf(report, 'node-engines'), 'warn');
  assert.equal(report.exitCode(), 0);
});

test('missing git identity is an error', () => {
  const report = doctor(new FakeEnvironment({ git: {}, files: { 'package.json': pkg() } }));
  assert.equal(levelOf(report, 'git-identity'), 'error');
  assert.equal(report.exitCode(), 1);
});

test('a strange git email is a warning', () => {
  const env = new FakeEnvironment({ git: { 'user.name': 'A', 'user.email': 'nope' }, files: { 'package.json': pkg() } });
  assert.equal(levelOf(doctor(env), 'git-identity'), 'warn');
});

test('a required tool missing from PATH is an error, an optional one a warning', () => {
  const report = doctor(new FakeEnvironment({ tools: ['node'], files: { 'package.json': pkg() } }));
  assert.equal(levelOf(report, 'tools-required'), 'error');
  assert.equal(levelOf(report, 'tools-optional'), 'warn');
});

test('packageManager: warns to enable corepack, errors when corepack is missing too', () => {
  const files = { 'package.json': pkg({ packageManager: 'pnpm@9.0.0' }) };
  assert.equal(levelOf(doctor(new FakeEnvironment({ tools: ['node', 'git', 'corepack'], files })), 'package-manager'), 'warn');
  assert.equal(levelOf(doctor(new FakeEnvironment({ tools: ['node', 'git'], files })), 'package-manager'), 'error');
  assert.equal(levelOf(doctor(new FakeEnvironment({ tools: ['node', 'git', 'pnpm'], files })), 'package-manager'), 'ok');
});

test('a broken or missing package.json is reported, not thrown', () => {
  assert.equal(levelOf(doctor(new FakeEnvironment({ files: { 'package.json': '{oops' } })), 'package-json'), 'error');
  assert.equal(levelOf(doctor(new FakeEnvironment()), 'package-json'), 'warn');
});

test('an empty check list fails loud', () => {
  assert.throws(() => doctor(new FakeEnvironment(), { checks: [] }), /No workstation checks/);
});

const linter = () =>
  new LintCommitsUseCase({ parser: new CommitParser(), rules: new CommitRules(conventionalPreset()), logger: silentLogger });

test('lint reports each bad commit with its short hash and passes ignored ones', () => {
  const report = linter().execute([
    commit('feat: ok', 'aaaaaaa111'),
    commit('fixed stuff', 'bbbbbbb222'),
    commit('Merge branch "x"', 'ccccccc333'),
  ]);
  assert.equal(report.exitCode(), 1);
  const bad = report.results.filter((r) => r.level === 'error');
  assert.equal(bad.length, 1);
  assert.match(bad[0].message, /^bbbbbbb /);
  assert.ok(report.results.some((r) => r.id === 'ignored'));
});

test('lint of only valid commits exits 0', () => {
  assert.equal(linter().execute([commit('fix(core): a'), commit('docs: b')]).exitCode(), 0);
});

const notes = () => new WriteReleaseNotesUseCase({ parser: new CommitParser(), logger: silentLogger });

test('release notes group by type, show scope, and list breaking changes first', () => {
  const md = notes().execute(
    [
      commit('feat(ui): add button', '1111111aaa'),
      commit('fix: crash on start', '2222222bbb'),
      commit('feat(api)!: drop v1', '3333333ccc'),
      commit('chore: bump deps', '4444444ddd'),
      commit('Merge branch "x"', '5555555eee'),
      commit('free text', '6666666fff'),
    ],
    { version: 'v1.2.0', date: '2026-01-01' },
  );
  assert.match(md, /^## v1\.2\.0 \(2026-01-01\)/);
  assert.ok(md.indexOf('BREAKING CHANGES') < md.indexOf('### Features'));
  assert.match(md, /\*\*ui:\*\* add button \(1111111\)/);
  assert.match(md, /### Bug Fixes\n\n- crash on start \(2222222\)/);
  assert.doesNotMatch(md, /bump deps|Merge|free text/);
});

test('release notes with nothing user-facing say so', () => {
  assert.match(notes().execute([commit('chore: x')], { date: '2026-01-01' }), /No user-facing changes/);
});
