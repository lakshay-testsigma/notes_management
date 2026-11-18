import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SystemEnvironment } from '../../src/infrastructure/SystemEnvironment.js';
import { GitCommitSource } from '../../src/infrastructure/GitCommitSource.js';

const MAIN = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../src/main.js');
const hasGit = spawnSync('git', ['--version']).status === 0;
const major = process.version.slice(1).split('.')[0];

// A clean git environment: no global or system config can leak into the test.
const cleanEnv = (extra = {}) => ({
  ...process.env,
  GIT_CONFIG_GLOBAL: os.devNull,
  GIT_CONFIG_NOSYSTEM: '1',
  ...extra,
});

function makeRepo(messages) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'devkit-'));
  const git = (...args) => execFileSync('git', args, { cwd: dir, env: cleanEnv(), stdio: 'pipe' });
  git('init', '-q');
  git('config', 'user.name', 'Test User');
  git('config', 'user.email', 'test@example.com');
  git('config', 'commit.gpgsign', 'false');
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 't', engines: { node: `>=${major}` } }));
  fs.writeFileSync(path.join(dir, '.nvmrc'), `${major}\n`);
  messages.forEach((m, i) => {
    fs.writeFileSync(path.join(dir, `f${i}.txt`), String(i));
    git('add', '.');
    git('commit', '-q', '-m', m);
  });
  return { dir, git };
}

const devkit = (args, { cwd, env = cleanEnv() } = {}) =>
  spawnSync(process.execPath, [MAIN, ...args], { cwd, env, encoding: 'utf8' });

test('doctor passes on a healthy temporary project (real git, real PATH)', { skip: !hasGit }, () => {
  const { dir } = makeRepo(['feat: first']);
  const result = devkit(['doctor', '--project', dir]);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /Git identity is Test User/);
  assert.match(result.stdout, /matches \.nvmrc/);
});

test('doctor exits 1 when git has no identity', { skip: !hasGit }, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'devkit-'));
  execFileSync('git', ['init', '-q'], { cwd: dir, env: cleanEnv() });
  const result = devkit(['doctor', '--project', dir]);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /ERROR git-identity/);
});

test('doctor exits 1 when a required tool is not on PATH', () => {
  const result = devkit(['doctor'], { env: cleanEnv({ DEVKIT_REQUIRED_TOOLS: 'definitely-not-a-real-tool' }) });
  assert.equal(result.status, 1);
  assert.match(result.stdout, /Not on PATH: definitely-not-a-real-tool/);
});

test('SystemEnvironment finds node on PATH and returns null for a missing tool', () => {
  const env = new SystemEnvironment({ env: process.env });
  assert.ok(env.findOnPath('node'));
  assert.equal(env.findOnPath('definitely-not-a-real-tool'), null);
  assert.equal(env.nodeVersion(), process.version);
});

test('lint --last and lint --from/--to read real history', { skip: !hasGit }, () => {
  const { dir } = makeRepo(['feat: one', 'fixed stuff', 'fix(core): three']);
  const last = devkit(['lint', '--last'], { cwd: dir });
  assert.equal(last.status, 0, last.stdout);
  const range = devkit(['lint', '--from', 'HEAD~2', '--to', 'HEAD'], { cwd: dir });
  assert.equal(range.status, 1, 'the middle commit is invalid');
  assert.match(range.stdout, /ERROR type-empty/);
});

test('lint --edit reads a message file like the commit-msg hook', { skip: !hasGit }, () => {
  const { dir } = makeRepo(['feat: seed']);
  const file = path.join(dir, 'MSG');
  fs.writeFileSync(file, 'feat: add thing\n# Please enter the commit message\n');
  assert.equal(devkit(['lint', '--edit', file], { cwd: dir }).status, 0);
  fs.writeFileSync(file, 'added thing\n');
  assert.equal(devkit(['lint', '--edit', file], { cwd: dir }).status, 1);
});

test('notes writes Markdown from a real commit range', { skip: !hasGit }, () => {
  const { dir } = makeRepo(['chore: start', 'feat(ui): add button', 'fix: crash', 'feat!: new api']);
  const result = devkit(['notes', '--from', 'HEAD~3', '--to', 'HEAD', '--version', 'v2.0.0', '--date', '2026-02-02'], { cwd: dir });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /## v2\.0\.0 \(2026-02-02\)/);
  assert.match(result.stdout, /BREAKING CHANGES/);
  assert.match(result.stdout, /\*\*ui:\*\* add button/);
});

test('a range on a shallow clone stops with a clear message', { skip: !hasGit }, () => {
  const { dir } = makeRepo(['feat: a', 'feat: b', 'feat: c']);
  const clone = fs.mkdtempSync(path.join(os.tmpdir(), 'devkit-clone-'));
  execFileSync('git', ['clone', '-q', '--depth', '1', `file://${dir}`, clone], { env: cleanEnv(), stdio: 'pipe' });
  assert.throws(() => new GitCommitSource({ cwd: clone, env: cleanEnv() }).range('HEAD~1', 'HEAD'), /shallow clone/);
  const result = devkit(['lint', '--from', 'HEAD~1', '--to', 'HEAD'], { cwd: clone });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /shallow clone/);
});

test('exit code 9 for bad arguments and for bad configuration', () => {
  assert.equal(devkit(['nonsense']).status, 9);
  const bad = devkit(['doctor'], { env: cleanEnv({ DEVKIT_MAX_HEADER: 'abc' }) });
  assert.equal(bad.status, 9);
  assert.match(bad.stderr, /DEVKIT_MAX_HEADER/);
});
