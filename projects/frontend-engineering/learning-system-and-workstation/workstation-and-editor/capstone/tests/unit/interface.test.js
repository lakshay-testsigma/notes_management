import test from 'node:test';
import assert from 'node:assert/strict';
import { Cli } from '../../src/interface/Cli.js';
import { parseCliArgs } from '../../src/interface/CliArgs.js';
import { TextReporter } from '../../src/interface/TextReporter.js';
import { Config } from '../../src/infrastructure/Config.js';
import { JsonLogger } from '../../src/infrastructure/JsonLogger.js';
import { CheckWorkstationUseCase } from '../../src/application/CheckWorkstationUseCase.js';
import { LintCommitsUseCase } from '../../src/application/LintCommitsUseCase.js';
import { WriteReleaseNotesUseCase } from '../../src/application/WriteReleaseNotesUseCase.js';
import { CommitParser } from '../../src/domain/CommitParser.js';
import { CommitRules, conventionalPreset } from '../../src/domain/CommitRules.js';
import { UsageError, ConfigError } from '../../src/domain/errors.js';
import { FakeEnvironment, FakeCommitSource, commit, silentLogger } from '../support/fakes.js';

function build({ commits = [], env = new FakeEnvironment() } = {}) {
  const out = [];
  const err = [];
  const parser = new CommitParser();
  const cli = new Cli({
    doctorFor: () => new CheckWorkstationUseCase({ environment: env, tools: { required: ['node'], optional: [] }, logger: silentLogger }),
    lint: new LintCommitsUseCase({ parser, rules: new CommitRules(conventionalPreset()), logger: silentLogger }),
    notes: new WriteReleaseNotesUseCase({ parser, logger: silentLogger }),
    commitSource: new FakeCommitSource(commits),
    reporter: new TextReporter(),
    stdout: (t) => out.push(t),
    stderr: (t) => err.push(t),
    logger: silentLogger,
  });
  return { cli, out, err };
}

test('parseCliArgs accepts the three commands and rejects others', () => {
  assert.equal(parseCliArgs(['lint', '--last']).command, 'lint');
  assert.throws(() => parseCliArgs(['deploy']), UsageError);
  assert.throws(() => parseCliArgs(['lint', '--nope']), UsageError);
  assert.throws(() => parseCliArgs(['doctor', 'extra']), UsageError);
});

test('lint --last exits 0 for a good message and 1 for a bad one', () => {
  assert.equal(build({ commits: [commit('feat: a')] }).cli.run(['lint', '--last']), 0);
  assert.equal(build({ commits: [commit('nope')] }).cli.run(['lint', '--last']), 1);
});

test('usage mistakes exit 9 and print help on stderr', () => {
  const { cli, err } = build();
  assert.equal(cli.run(['lint']), 9);
  assert.equal(cli.run(['lint', '--from', 'a']), 9);
  assert.equal(cli.run(['lint', '--last', '--edit', 'f']), 9);
  assert.match(err[0], /Usage:/);
});

test('--strict makes a warning fail', () => {
  const env = new FakeEnvironment({ files: { 'package.json': '{}' } }); // warnings only
  assert.equal(build({ env }).cli.run(['doctor']), 0);
  assert.equal(build({ env }).cli.run(['doctor', '--strict']), 1);
});

test('notes prints Markdown and exits 0', () => {
  const { cli, out } = build({ commits: [commit('feat: new thing')] });
  assert.equal(cli.run(['notes', '--from', 'a', '--to', 'b', '--version', 'v1']), 0);
  assert.match(out[0], /### Features/);
});

test('an unexpected error is logged with context and exits 1', () => {
  const lines = [];
  const { cli } = build();
  cli.commitSource = { last() { throw new TypeError('boom'); } };
  cli.logger = new JsonLogger({ level: 'error', sink: (l) => lines.push(JSON.parse(l)), runId: 'r1' });
  assert.equal(cli.run(['lint', '--last']), 1);
  assert.equal(lines[0].runId, 'r1');
  assert.equal(lines[0].message, 'unexpected error');
});

test('Config uses defaults and fails at startup on bad values', () => {
  assert.deepEqual(new Config({}).requiredTools, ['node', 'git', 'npm']);
  assert.throws(() => new Config({ DEVKIT_REQUIRED_TOOLS: ' , ' }), ConfigError);
  assert.throws(() => new Config({ DEVKIT_MAX_HEADER: 'abc' }), ConfigError);
  assert.throws(() => new Config({ DEVKIT_LOG_LEVEL: 'loud' }), ConfigError);
  assert.throws(() => new Config({ DEVKIT_WARN_RULES: 'made-up' }), ConfigError);
});

test('JsonLogger hides lines below its level and adds the run id', () => {
  const lines = [];
  const log = new JsonLogger({ level: 'warn', sink: (l) => lines.push(JSON.parse(l)), runId: 'abc' });
  log.info('hidden');
  log.warn('shown', { n: 1 });
  assert.equal(lines.length, 1);
  assert.deepEqual([lines[0].runId, lines[0].n], ['abc', 1]);
});
