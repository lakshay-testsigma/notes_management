import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { CommitSourcePort } from '../domain/ports.js';
import { HistoryError } from '../domain/errors.js';

const FIELD = '\x1f';
const RECORD = '\x1e';

/** Reads commit messages from a hook file or from `git log`. */
export class GitCommitSource extends CommitSourcePort {
  constructor({ cwd = process.cwd(), env = process.env } = {}) {
    super();
    this.cwd = cwd;
    this.env = env;
  }

  #git(args) {
    try {
      return execFileSync('git', args, { cwd: this.cwd, env: this.env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (error) {
      throw new HistoryError(`git ${args[0]} failed: ${String(error.stderr ?? error.message).trim()}`);
    }
  }

  #log(args) {
    return this.#git(['log', `--format=%H${FIELD}%B${RECORD}`, ...args])
      .split(RECORD)
      .map((chunk) => chunk.replace(/^\n/, ''))
      .filter((chunk) => chunk.trim() !== '')
      .map((chunk) => {
        const [hash, message] = chunk.split(FIELD);
        return { hash, message };
      });
  }

  fromFile(path) {
    try {
      return [{ hash: 'message-file', message: fs.readFileSync(path, 'utf8') }];
    } catch {
      throw new HistoryError(`Cannot read the message file ${path}`);
    }
  }

  last() {
    return this.#log(['-1']);
  }

  range(from, to) {
    // A shallow clone would return fewer commits without any error, so stop first.
    if (this.#git(['rev-parse', '--is-shallow-repository']).trim() === 'true') {
      throw new HistoryError('This is a shallow clone. Fetch the full history (CI: fetch-depth: 0).');
    }
    return this.#log(['--reverse', `${from}..${to}`]);
  }
}
