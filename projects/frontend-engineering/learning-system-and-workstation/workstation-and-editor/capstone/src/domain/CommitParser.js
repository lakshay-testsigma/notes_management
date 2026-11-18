const HEADER = /^(?<type>[A-Za-z]+)(?:\((?<scope>[^)]*)\))?(?<bang>!)?:\s?(?<subject>.*)$/;
const SCISSORS = '# ------------------------ >8 ------------------------';

/** What one commit message means, after parsing. Fields are null when absent. */
export class ParsedCommit {
  constructor({ header, type, scope, subject, breaking, body, ignored }) {
    Object.assign(this, { header, type, scope, subject, breaking, body, ignored });
    Object.freeze(this);
  }
}

/** Reads a message the way Git does, then splits `type(scope)!: subject`. */
export class CommitParser {
  /** Drops comment lines and everything after the scissors line, like `git commit`. */
  clean(raw) {
    const lines = raw.replace(/\r\n/g, '\n').split('\n');
    const scissors = lines.indexOf(SCISSORS);
    const kept = (scissors === -1 ? lines : lines.slice(0, scissors)).filter((l) => !l.startsWith('#'));
    return kept.join('\n').trim();
  }

  // Merge, revert and fixup commits are made by Git, so the user is not blamed for them.
  isIgnored(text) {
    return /^(Merge |Revert "|fixup! |squash! )/.test(text);
  }

  parse(raw) {
    const text = this.clean(raw);
    const [header = '', ...rest] = text.split('\n');
    const body = rest.join('\n').trim() || null;
    const ignored = this.isIgnored(header);
    const match = HEADER.exec(header);
    const breakingFooter = /^BREAKING[ -]CHANGE: /m.test(body ?? '');
    return new ParsedCommit({
      header,
      type: match?.groups.type ?? null,
      scope: match?.groups.scope || null,
      subject: match ? match.groups.subject.trim() : header,
      breaking: Boolean(match?.groups.bang) || breakingFooter,
      body,
      ignored,
    });
  }
}
