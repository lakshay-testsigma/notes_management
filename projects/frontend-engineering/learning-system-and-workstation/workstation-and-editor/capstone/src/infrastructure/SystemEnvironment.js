import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { EnvironmentPort } from '../domain/ports.js';

/** The real machine: this Node process, the git program, the PATH variable, the project folder. */
export class SystemEnvironment extends EnvironmentPort {
  constructor({ projectDir = process.cwd(), env = process.env, version = process.version } = {}) {
    super();
    this.projectDir = projectDir;
    this.env = env;
    this.version = version;
  }

  nodeVersion() {
    return this.version;
  }

  gitConfig(key) {
    try {
      const out = execFileSync('git', ['config', '--get', key], {
        cwd: this.projectDir, env: this.env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
      });
      return out.trim() || null;
    } catch {
      return null; // git exits 1 when the key is unset, and fails when git is missing
    }
  }

  // Walks PATH from left to right, like a shell: the first match wins.
  findOnPath(tool) {
    const extensions = process.platform === 'win32' ? (this.env.PATHEXT ?? '.EXE;.CMD').split(';') : [''];
    for (const dir of (this.env.PATH ?? '').split(path.delimiter).filter(Boolean)) {
      for (const ext of extensions) {
        const candidate = path.join(dir, tool + ext);
        try {
          if (!fs.statSync(candidate).isFile()) continue;
          fs.accessSync(candidate, fs.constants.X_OK);
          return candidate;
        } catch {
          // not here, try the next folder
        }
      }
    }
    return null;
  }

  readProjectFile(name) {
    try {
      return fs.readFileSync(path.join(this.projectDir, name), 'utf8');
    } catch {
      return null;
    }
  }
}
