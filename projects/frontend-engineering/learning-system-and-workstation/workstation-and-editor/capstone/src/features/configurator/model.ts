// The domain: what a valid developer setup is, and the ports the rest of the
// app needs from the outside world. This file knows nothing about React, the
// browser, or storage.

import { InvalidConfigError } from '../../shared/lib/errors';

export type ShellId = 'zsh' | 'bash' | 'fish';
export type EditorId = 'vscode' | 'neovim' | 'zed';

export const SHELLS: readonly ShellId[] = ['zsh', 'bash', 'fish'];
export const EDITORS: readonly EditorId[] = ['vscode', 'neovim', 'zed'];

export interface GitIdentity {
  name: string;
  email: string;
}

export interface DeveloperConfigInput {
  shell: string;
  gitName: string;
  gitEmail: string;
  editor: string;
  nodeVersion: string;
}

// A Node version is a value object: three numbers that only a valid "x.y.z"
// string can produce. Nothing else can build a malformed one.
export class NodeVersion {
  private constructor(
    readonly major: number,
    readonly minor: number,
    readonly patch: number,
  ) {}

  static parse(input: string): NodeVersion {
    const value = input.trim();
    if (value === '') {
      throw new InvalidConfigError('MISSING_NODE_VERSION', 'nodeVersion');
    }
    const match = /^(\d{1,2})\.(\d{1,3})\.(\d{1,3})$/.exec(value);
    if (!match) {
      throw new InvalidConfigError('INVALID_NODE_VERSION', 'nodeVersion');
    }
    const major = Number(match[1]);
    const minor = Number(match[2]);
    const patch = Number(match[3]);
    if (major < 1 || major > 99) {
      throw new InvalidConfigError('INVALID_NODE_VERSION', 'nodeVersion');
    }
    return new NodeVersion(major, minor, patch);
  }

  toString(): string {
    return `${this.major}.${this.minor}.${this.patch}`;
  }

  /** The major line, shown in the checklist so the developer knows what to expect. */
  line(): string {
    return String(this.major);
  }
}

export class DeveloperConfig {
  private constructor(
    readonly shell: ShellId,
    readonly git: GitIdentity,
    readonly editor: EditorId,
    readonly node: NodeVersion,
  ) {}

  // create() treats its argument as untrusted: every field is checked against
  // an allow-list before it becomes part of the object.
  static create(raw: unknown): DeveloperConfig {
    const input = DeveloperConfig.readInput(raw);
    return new DeveloperConfig(
      DeveloperConfig.readShell(input.shell),
      DeveloperConfig.readGitIdentity(input.gitName, input.gitEmail),
      DeveloperConfig.readEditor(input.editor),
      NodeVersion.parse(input.nodeVersion),
    );
  }

  toJSON(): DeveloperConfigInput {
    return {
      shell: this.shell,
      gitName: this.git.name,
      gitEmail: this.git.email,
      editor: this.editor,
      nodeVersion: this.node.toString(),
    };
  }

  private static readInput(raw: unknown): DeveloperConfigInput {
    if (typeof raw !== 'object' || raw === null) {
      throw new InvalidConfigError('UNEXPECTED');
    }
    const record = raw as Record<string, unknown>;
    const str = (key: string): string =>
      typeof record[key] === 'string' ? (record[key] as string) : '';
    return {
      shell: str('shell'),
      gitName: str('gitName'),
      gitEmail: str('gitEmail'),
      editor: str('editor'),
      nodeVersion: str('nodeVersion'),
    };
  }

  private static readShell(input: string): ShellId {
    const value = input.trim();
    if (value === '') {
      throw new InvalidConfigError('MISSING_SHELL', 'shell');
    }
    if (!(SHELLS as readonly string[]).includes(value)) {
      throw new InvalidConfigError('INVALID_SHELL', 'shell');
    }
    return value as ShellId;
  }

  private static readEditor(input: string): EditorId {
    const value = input.trim();
    if (value === '') {
      throw new InvalidConfigError('MISSING_EDITOR', 'editor');
    }
    if (!(EDITORS as readonly string[]).includes(value)) {
      throw new InvalidConfigError('INVALID_EDITOR', 'editor');
    }
    return value as EditorId;
  }

  // The name and email are the strings that reach a generated shell script, so
  // they get the tightest check: a conservative allow-list, no newlines.
  private static readGitIdentity(name: string, email: string): GitIdentity {
    const trimmedName = name.trim();
    if (trimmedName === '') {
      throw new InvalidConfigError('MISSING_GIT_NAME', 'gitName');
    }
    if (!/^[\p{L}\p{N} .'\-]{1,120}$/u.test(trimmedName)) {
      throw new InvalidConfigError('INVALID_GIT_NAME', 'gitName');
    }

    const trimmedEmail = email.trim();
    if (trimmedEmail === '') {
      throw new InvalidConfigError('MISSING_GIT_EMAIL', 'gitEmail');
    }
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail) ||
      trimmedEmail.length > 254
    ) {
      throw new InvalidConfigError('INVALID_GIT_EMAIL', 'gitEmail');
    }

    return { name: trimmedName, email: trimmedEmail };
  }
}

// The generated output: one file per line, plus the installer and checklist.

export interface GeneratedFile {
  /** Home-relative path the installer writes the file to. */
  path: string;
  content: string;
}

export class GeneratedBundle {
  constructor(
    readonly files: GeneratedFile[],
    readonly installScript: string,
    readonly checklist: string[],
  ) {}
}

// Ports: what the domain and application need from the outside world.

export interface ConfigStorage {
  save(config: DeveloperConfig): void;
  load(): DeveloperConfig | null;
  clear(): void;
}

export interface BundleDownloader {
  download(bundle: GeneratedBundle, filename: string): void;
}
