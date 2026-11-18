import { EnvironmentPort, CommitSourcePort } from '../../src/domain/ports.js';
import { JsonLogger } from '../../src/infrastructure/JsonLogger.js';

export class FakeEnvironment extends EnvironmentPort {
  constructor({ node = 'v24.1.0', git = { 'user.name': 'Ada', 'user.email': 'ada@example.com' }, tools = ['node', 'git', 'npm', 'code', 'corepack'], files = {} } = {}) {
    super();
    Object.assign(this, { node, git, tools, files });
  }
  nodeVersion() { return this.node; }
  gitConfig(key) { return this.git[key] ?? null; }
  findOnPath(tool) { return this.tools.includes(tool) ? `/bin/${tool}` : null; }
  readProjectFile(name) { return this.files[name] ?? null; }
}

export class FakeCommitSource extends CommitSourcePort {
  constructor(commits = []) { super(); this.commits = commits; }
  fromFile() { return this.commits; }
  last() { return this.commits.slice(-1); }
  range() { return this.commits; }
}

export const silentLogger = new JsonLogger({ level: 'error', sink: () => {} });
export const commit = (message, hash = 'abcdef1234') => ({ hash, message });
