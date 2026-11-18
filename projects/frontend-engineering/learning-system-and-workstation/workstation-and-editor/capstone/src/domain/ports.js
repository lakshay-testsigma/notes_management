// Ports describe what the domain needs from the outside world.
// Infrastructure implements them; tests use in-memory fakes.

/** Everything a workstation check may ask about the machine and the project. */
export class EnvironmentPort {
  /** @returns {string} for example "v24.1.0" */
  nodeVersion() { throw new Error('not implemented'); }

  /** @returns {string|null} the value of a git config key, or null when unset */
  gitConfig(key) { throw new Error('not implemented'); }

  /** @returns {string|null} the full path of a tool found on PATH, or null */
  findOnPath(tool) { throw new Error('not implemented'); }

  /** @returns {string|null} the text of a file in the project folder, or null */
  readProjectFile(name) { throw new Error('not implemented'); }
}

/** Where commit messages come from: a hook file, the last commit, or a range. */
export class CommitSourcePort {
  /** @returns {{hash: string, message: string}[]} */
  fromFile(path) { throw new Error('not implemented'); }

  /** @returns {{hash: string, message: string}[]} */
  last() { throw new Error('not implemented'); }

  /** @returns {{hash: string, message: string}[]} oldest first */
  range(from, to) { throw new Error('not implemented'); }
}
