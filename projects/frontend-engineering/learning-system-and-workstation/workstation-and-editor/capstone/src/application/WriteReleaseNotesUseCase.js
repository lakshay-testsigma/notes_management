const SECTIONS = [
  ['feat', 'Features'],
  ['fix', 'Bug Fixes'],
  ['perf', 'Performance'],
];

/** Turns conventional commits into Markdown release notes, grouped by type. */
export class WriteReleaseNotesUseCase {
  constructor({ parser, logger }) {
    this.parser = parser;
    this.logger = logger;
  }

  execute(commits, { version = 'Unreleased', date = new Date().toISOString().slice(0, 10) } = {}) {
    const parsed = commits
      .map(({ hash, message }) => ({ hash, commit: this.parser.parse(message) }))
      .filter(({ commit }) => !commit.ignored && commit.type !== null);
    this.logger.debug('release notes input', { commits: commits.length, usable: parsed.length });

    const lines = [`## ${version} (${date})`, ''];
    const breaking = parsed.filter(({ commit }) => commit.breaking);
    if (breaking.length > 0) lines.push(...this.#section('BREAKING CHANGES', breaking));
    for (const [type, title] of SECTIONS) {
      const group = parsed.filter(({ commit }) => commit.type === type);
      if (group.length > 0) lines.push(...this.#section(title, group));
    }
    if (lines.length === 2) lines.push('No user-facing changes.', '');
    return lines.join('\n');
  }

  #section(title, entries) {
    const items = entries.map(({ hash, commit }) => {
      const scope = commit.scope ? `**${commit.scope}:** ` : '';
      return `- ${scope}${commit.subject} (${hash.slice(0, 7)})`;
    });
    return [`### ${title}`, '', ...items, ''];
  }
}
