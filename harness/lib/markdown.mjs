// Small markdown helpers: frontmatter, word counts, headings, wikilinks,
// and the generated-region markers used by `tutor map`.

export const GENERATED_START = '<!-- tutor:generated:start -->';
export const GENERATED_END = '<!-- tutor:generated:end -->';
export const INSIGHTS_HEADING = '## My insights';
export const PLACEHOLDER = '<!-- tutor:placeholder -->';
/** Marks the note of a stage that is not part of the topic (see stage-notes.mjs). */
export const SKIPPED_MARK = '<!-- tutor:skipped -->';

const INSIGHTS_RE = /^##\s+My insights\s*$/i;

/**
 * "Redis Streams & Co." -> "redis-streams-and-co".
 * A trailing acronym in parentheses is dropped, because it only repeats the
 * title: "Retrieval-Augmented Generation (RAG)" -> "retrieval-augmented-generation".
 */
export function slugify(input) {
  return dropTrailingAcronym(String(input ?? ''))
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/\+/g, ' plus ')
    .replace(/#/g, ' sharp ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Remove a final "(ABC)" when it is an acronym: one token of 2–12 characters
 * whose letters are all capitals ("RAG", "S3", "CI/CD") or that has at least
 * two capitals ("gRPC"). "(basics)" and "(2024)" are kept.
 */
function dropTrailingAcronym(text) {
  const match = /\s*\(([^()\s]{2,12})\)\s*$/.exec(text);
  if (!match) return text;
  const before = text.slice(0, match.index);
  if (!/[\p{L}\p{N}]/u.test(before)) return text;

  const letters = match[1].replace(/[^A-Za-z]/g, '').length;
  const capitals = match[1].replace(/[^A-Z]/g, '').length;
  const isAcronym = letters > 0 && (capitals === letters || capitals >= 2);
  return isAcronym ? before : text;
}

/** Escape a value so it can sit inside a double-quoted YAML string. */
export function yamlEscape(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * Split a note into frontmatter and body.
 * Returns { has, data, raw, body }. `has` is false when there is no valid block.
 */
export function splitFrontmatter(text) {
  const clean = String(text).replace(/^﻿/, '');
  const lines = clean.split(/\r?\n/);
  if ((lines[0] ?? '').trim() !== '---') {
    return { has: false, data: {}, raw: '', body: clean };
  }
  const end = lines.findIndex((line, i) => i > 0 && line.trim() === '---');
  if (end === -1) {
    return { has: false, data: {}, raw: '', body: clean };
  }
  const raw = lines.slice(1, end).join('\n');
  return { has: true, data: parseYamlLite(raw), raw, body: lines.slice(end + 1).join('\n') };
}

/**
 * Parse the small YAML subset used in frontmatter: `key: scalar`,
 * `key: [a, b]`, and `key:` followed by `- item` lines.
 */
export function parseYamlLite(raw) {
  const data = {};
  let listKey = null;

  for (const line of raw.split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const item = /^\s*-\s+(.*)$/.exec(line);
    if (item && listKey) {
      if (!Array.isArray(data[listKey])) data[listKey] = [];
      data[listKey].push(parseScalar(stripComment(item[1])));
      continue;
    }

    const pair = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (!pair) continue;
    const key = pair[1];
    const rest = stripComment(pair[2]);

    if (rest === '') {
      data[key] = null;
      listKey = key;
    } else if (rest.startsWith('[') && rest.endsWith(']')) {
      data[key] = splitOutsideQuotes(rest.slice(1, -1), ',')
        .map((part) => part.trim())
        .filter((part) => part !== '')
        .map(parseScalar);
      listKey = null;
    } else {
      data[key] = parseScalar(rest);
      listKey = null;
    }
  }
  return data;
}

function stripComment(value) {
  let quote = null;
  for (let i = 0; i < value.length; i++) {
    const c = value[i];
    if (quote) {
      if (c === '\\' && quote === '"') i++;
      else if (c === quote) quote = null;
    } else if (c === '"' || c === "'") {
      quote = c;
    } else if (c === '#' && (i === 0 || /\s/.test(value[i - 1]))) {
      return value.slice(0, i).trim();
    }
  }
  return value.trim();
}

function splitOutsideQuotes(value, separator) {
  const parts = [];
  let current = '';
  let quote = null;
  for (const c of value) {
    if (quote) {
      if (c === quote) quote = null;
      current += c;
    } else if (c === '"' || c === "'") {
      quote = c;
      current += c;
    } else if (c === separator) {
      parts.push(current);
      current = '';
    } else {
      current += c;
    }
  }
  parts.push(current);
  return parts;
}

function parseScalar(value) {
  const v = value.trim();
  if (v.startsWith('"') && v.endsWith('"') && v.length >= 2) {
    try {
      return JSON.parse(v);
    } catch {
      return v.slice(1, -1);
    }
  }
  if (v.startsWith("'") && v.endsWith("'") && v.length >= 2) {
    return v.slice(1, -1).replace(/''/g, "'");
  }
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v === 'null' || v === '~') return null;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  return v;
}

/** Blank out fenced code blocks (``` or ~~~), keeping the line count. */
export function stripFencedCode(text) {
  const out = [];
  let fence = null;
  for (const line of String(text).split('\n')) {
    const match = /^\s*(`{3,}|~{3,})/.exec(line);
    if (fence) {
      const closes =
        match && match[1][0] === fence[0] && match[1].length >= fence.length && line.trim() === match[1];
      if (closes) fence = null;
      out.push('');
      continue;
    }
    if (match) {
      fence = match[1];
      out.push('');
      continue;
    }
    out.push(line);
  }
  return out.join('\n');
}

export function stripInlineCode(text) {
  return String(text).replace(/`[^`\n]*`/g, ' ');
}

export function stripHtmlComments(text) {
  return String(text).replace(/<!--[\s\S]*?-->/g, ' ');
}

/**
 * Count the words of markdown prose. Code blocks and comments are ignored,
 * links count as their visible text, markup characters do not count.
 */
export function countWords(markdown) {
  let text = stripHtmlComments(stripFencedCode(markdown));
  text = text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\[\[[^\]|]+\|([^\]]+)\]\]/g, '$1')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/<\/?[a-zA-Z][^>]*>/g, ' ');
  return text.split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
}

/** Headings outside code blocks: [{ level, text, line }] (line is 0-based). */
export function listHeadings(markdown) {
  const headings = [];
  stripFencedCode(markdown)
    .split('\n')
    .forEach((line, index) => {
      const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
      if (match) headings.push({ level: match[1].length, text: match[2].trim(), line: index });
    });
  return headings;
}

/** True when a heading with this text exists (case and trailing punctuation ignored). */
export function hasHeading(markdown, text) {
  const wanted = normalizeHeading(text);
  return listHeadings(markdown).some((h) => normalizeHeading(h.text) === wanted);
}

function normalizeHeading(text) {
  return String(text)
    .toLowerCase()
    .replace(/[?:.!]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Line index of the `## My insights` heading, or -1. */
export function insightsLine(markdown) {
  return stripFencedCode(markdown)
    .split('\n')
    .findIndex((line) => INSIGHTS_RE.test(line));
}

/** The note body without the `## My insights` section. */
export function aboveInsights(markdown) {
  const index = insightsLine(markdown);
  if (index === -1) return markdown;
  return markdown.split('\n').slice(0, index).join('\n');
}

/**
 * Wikilink targets in a note: `[[name]]`, `[[name|alias]]`, `[[name#heading]]`,
 * `![[embed]]`. Links inside code are ignored. Returns unique target names.
 */
export function extractWikilinks(markdown) {
  const text = stripHtmlComments(stripInlineCode(stripFencedCode(markdown)));
  const targets = new Set();
  const pattern = /!?\[\[([^[\]\n]+)\]\]/g;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const target = match[1].split(/\\?\|/)[0].split('#')[0].trim();
    if (target) targets.add(target);
  }
  return [...targets];
}

/**
 * Replace the region between the generated markers. When the markers are
 * missing the region is inserted above `## My insights` (or appended), so
 * nothing a human wrote is ever removed.
 */
export function replaceGeneratedRegion(text, content) {
  const block = `${GENERATED_START}\n${content.trim()}\n${GENERATED_END}`;
  const start = text.indexOf(GENERATED_START);
  const end = text.indexOf(GENERATED_END);
  if (start !== -1 && end > start) {
    return text.slice(0, start) + block + text.slice(end + GENERATED_END.length);
  }

  const lines = text.split('\n');
  const insights = lines.findIndex((line) => INSIGHTS_RE.test(line));
  if (insights !== -1) {
    lines.splice(insights, 0, block, '');
    return lines.join('\n');
  }
  return `${text.replace(/\s*$/, '')}\n\n${block}\n`;
}

/**
 * Find a level-2 heading by text. Returns its line index or -1.
 */
export function findSection(lines, headingText) {
  const wanted = normalizeHeading(headingText);
  return lines.findIndex((line) => {
    const match = /^##\s+(.+?)\s*$/.exec(line);
    return match !== null && normalizeHeading(match[1]) === wanted;
  });
}

/** Line index where the section starting at `start` ends (next `#`/`##` heading or EOF). */
export function sectionEnd(lines, start) {
  for (let i = start + 1; i < lines.length; i++) {
    if (/^#{1,2}\s/.test(lines[i])) return i;
  }
  return lines.length;
}

/**
 * Insert lines at the end of a section, after its last non-blank line.
 * `start` is the heading line; the section ends at the next `#`/`##` heading.
 * With `tight`, a new bullet is placed directly under an existing bullet.
 */
export function insertAtSectionEnd(lines, start, newLines, { tight = false } = {}) {
  const end = sectionEnd(lines, start);
  let last = end;
  while (last > start + 1 && lines[last - 1].trim() === '') last--;

  const before = lines.slice(0, last);
  const after = lines.slice(end);
  const followsBullet = last > start + 1 && /^\s*[-*]\s/.test(lines[last - 1]);
  const gap = tight && followsBullet ? [] : [''];

  return after.length
    ? [...before, ...gap, ...newLines, '', ...after]
    : [...before, ...gap, ...newLines, ''];
}
