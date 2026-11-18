// Header: type, optional (scope), optional "!", a colon, then the description.
const HEADER = /^(\w+)(?:\(([^)]+)\))?(!)?:(?:\s(.*))?$/;
// Footer line: a token, then ": " or " #", then a value.
const FOOTER = /^(BREAKING[ -]CHANGE|[\w-]+)(?::\s|\s#)(.*)$/;

export function parse(message) {
  const lines = message.replace(/\r\n/g, "\n").split("\n");
  const header = lines[0].trim();
  const match = HEADER.exec(header);

  // Paragraphs after the header are separated by blank lines.
  const paragraphs = lines.slice(1).join("\n").split(/\n\s*\n/)
    .map((p) => p.trim()).filter((p) => p !== "");

  // The last paragraph is the footer block when its first line looks like a footer.
  let footers = [];
  const last = paragraphs[paragraphs.length - 1];
  if (last !== undefined && FOOTER.test(last.split("\n")[0])) {
    footers = parseFooters(last);
    paragraphs.pop();
  }

  const hasBreakingFooter = footers.some((f) => isBreakingToken(f.token));
  return {
    header,
    type: match ? match[1] : null,
    scope: match && match[2] ? match[2] : null,
    breaking: Boolean(match && match[3]) || hasBreakingFooter,
    description: match ? (match[4] ?? "").trim() : null,
    body: paragraphs.join("\n\n"),
    footers,
  };
}

export function isBreakingToken(token) {
  return token === "BREAKING CHANGE" || token === "BREAKING-CHANGE";
}

function parseFooters(block) {
  const footers = [];
  for (const line of block.split("\n")) {
    const m = FOOTER.exec(line);
    if (m) footers.push({ token: m[1], value: m[2].trim() });
    // A line that is not a new footer continues the value of the previous one.
    else if (footers.length > 0) footers[footers.length - 1].value += "\n" + line.trim();
  }
  return footers;
}
