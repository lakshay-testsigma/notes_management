// Reads a lesson page (.mdx) well enough to enforce the §12 rules:
// which components it uses, which imports it has, and how many words of prose
// remain once frontmatter, imports, code blocks, and components are removed.

import { splitFrontmatter, stripFencedCode, countWords } from './markdown.mjs';

/**
 * Analyze one lesson page.
 * Returns {
 *   frontmatter: { has, data },
 *   imports:  [{ names: [...], from }],
 *   elements: [{ name, attrs, props, root }]   every <Capitalized> tag, nested ones included
 *                                       (attrs: the opening tag as written; props: parseAttributes of it)
 *   unclosed: [name]                    paired tags that never close
 *   prose, words,
 *   endsWith: name of the last top-level component when nothing follows it, else null
 * }
 */
export function analyzeLessonPage(text) {
  const frontmatter = splitFrontmatter(text);
  const withoutCode = stripFencedCode(frontmatter.body);
  const { text: withoutImports, imports } = extractImports(withoutCode);
  const { prose, elements, unclosed, endsWith } = extractComponents(withoutImports);

  return {
    frontmatter,
    imports,
    elements,
    unclosed,
    prose,
    words: countWords(prose),
    endsWith,
  };
}

// --- imports and exports ----------------------------------------------------

const IMPORT_START = /^import\s*(\{|\*|[A-Za-z_$][\w$]*\s*(,|from\b)|['"])/;
const IMPORT_END = /['"][^'"\n]+['"]\s*;?\s*$/;
const EXPORT_START = /^export\s+(const|let|var|function|default|async|class|\{)/;

function extractImports(text) {
  const lines = text.split('\n');
  const kept = [];
  const imports = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (IMPORT_START.test(line)) {
      let statement = line;
      let last = i;
      while (!IMPORT_END.test(statement) && last + 1 < lines.length && lines[last + 1].trim() !== '') {
        last++;
        statement += `\n${lines[last]}`;
      }
      if (IMPORT_END.test(statement)) {
        imports.push(parseImport(statement));
        for (let k = i; k <= last; k++) kept.push('');
        i = last;
        continue;
      }
    }

    if (EXPORT_START.test(line)) {
      let last = i;
      while (last + 1 < lines.length && lines[last + 1].trim() !== '') last++;
      for (let k = i; k <= last; k++) kept.push('');
      i = last;
      continue;
    }

    kept.push(line);
  }
  return { text: kept.join('\n'), imports };
}

function parseImport(statement) {
  const fromMatch = /from\s*['"]([^'"]+)['"]/.exec(statement) ?? /^import\s*['"]([^'"]+)['"]/.exec(statement);
  const from = fromMatch ? fromMatch[1] : '';
  const clause = statement.replace(/^import\s*/, '').replace(/\s*from\s*['"][^'"]+['"]\s*;?\s*$/, '');
  const names = [];

  const named = /\{([^}]*)\}/.exec(clause);
  if (named) {
    for (const part of named[1].split(',')) {
      const local = part.trim().split(/\s+as\s+/).pop().trim();
      if (local) names.push(local);
    }
  }
  const namespace = /\*\s+as\s+([A-Za-z_$][\w$]*)/.exec(clause);
  if (namespace) names.push(namespace[1]);
  const defaultName = /^([A-Za-z_$][\w$]*)/.exec(clause.trim());
  if (defaultName) names.push(defaultName[1]);

  return { names, from };
}

// --- components --------------------------------------------------------------

/**
 * Remove every top-level <Capitalized> component block and every {expression}
 * from the text. What remains is the prose.
 */
function extractComponents(text) {
  const elements = [];
  const unclosed = [];
  let prose = '';
  let copiedUpTo = 0;
  let lastRootEnd = -1;
  let lastRootName = null;
  let i = 0;

  const cut = (from, to) => {
    prose += `${text.slice(copiedUpTo, from)} `;
    copiedUpTo = to;
  };

  while (i < text.length) {
    const char = text[i];

    if (char === '`') {
      i = skipInlineCode(text, i);
      continue;
    }
    if (char === '<' && /[A-Z]/.test(text[i + 1] ?? '')) {
      const end = parseElement(text, i, elements, unclosed, true);
      if (end !== null) {
        cut(i, end);
        lastRootEnd = end;
        lastRootName = elements.findLast((el) => el.root).name;
        i = end;
        continue;
      }
    }
    if (char === '{' && text[i - 1] !== '\\') {
      const end = skipBraces(text, i);
      if (end !== -1) {
        cut(i, end);
        i = end;
        continue;
      }
    }
    i++;
  }
  prose += text.slice(copiedUpTo);

  const nothingAfter = lastRootEnd !== -1 && text.slice(lastRootEnd).trim() === '';
  return { prose, elements, unclosed, endsWith: nothingAfter ? lastRootName : null };
}

/**
 * Parse one element starting at `<Name`. Records it (and its nested elements)
 * and returns the index just after it, or null when the tag cannot be parsed.
 */
function parseElement(text, start, elements, unclosed, isRoot) {
  const open = parseOpeningTag(text, start);
  if (!open) return null;
  const attrs = text.slice(start, open.end);
  elements.push({ name: open.name, attrs, props: parseAttributes(attrs), root: isRoot });
  if (open.selfClosing) return open.end;

  let i = open.end;
  while (i < text.length) {
    if (text.startsWith('</', i)) {
      const close = /^<\/([A-Za-z][\w.]*)\s*>/.exec(text.slice(i, i + 120));
      if (close) {
        if (close[1] === open.name) return i + close[0].length;
        i += close[0].length;
        continue;
      }
    }
    const char = text[i];
    if (char === '<' && /[A-Z]/.test(text[i + 1] ?? '')) {
      const end = parseElement(text, i, elements, unclosed, false);
      if (end !== null) {
        i = end;
        continue;
      }
    }
    if (char === '{') {
      const end = skipBraces(text, i);
      if (end !== -1) {
        i = end;
        continue;
      }
    }
    if (char === '`') {
      i = skipInlineCode(text, i);
      continue;
    }
    i++;
  }

  unclosed.push(open.name);
  return open.end;
}

/** Parse `<Name attr="x" other={...}>` or `<Name ... />`, across lines. */
function parseOpeningTag(text, start) {
  const head = /^<([A-Z][A-Za-z0-9_.]*)/.exec(text.slice(start, start + 100));
  if (!head) return null;
  let i = start + head[0].length;

  while (i < text.length) {
    const char = text[i];
    if (char === '"' || char === "'") {
      const close = text.indexOf(char, i + 1);
      if (close === -1) return null;
      i = close + 1;
    } else if (char === '{') {
      const end = skipBraces(text, i);
      if (end === -1) return null;
      i = end;
    } else if (char === '/' && text[i + 1] === '>') {
      return { name: head[1], end: i + 2, selfClosing: true };
    } else if (char === '>') {
      return { name: head[1], end: i + 1, selfClosing: false };
    } else {
      i++;
    }
  }
  return null;
}

/**
 * The attributes of an opening tag, in order: [{ name, value }].
 * `value` is the text as written (`"..."`, `'...'`, `{...}`) or null for a bare
 * attribute. A spread (`{...rest}`) has `name: null`. Values may span lines and
 * may contain braces, quotes, and `>` characters.
 */
export function parseAttributes(tag) {
  const head = /^<([A-Z][A-Za-z0-9_.]*)/.exec(tag);
  if (!head) return [];
  const attributes = [];
  let i = head[0].length;

  while (i < tag.length) {
    const char = tag[i];
    if (/\s/.test(char)) {
      i++;
      continue;
    }
    if (char === '>' || (char === '/' && tag[i + 1] === '>')) break;

    if (char === '{') {
      const end = skipBraces(tag, i);
      if (end === -1) break;
      attributes.push({ name: null, value: tag.slice(i, end) });
      i = end;
      continue;
    }

    const name = /^[^\s=/>{}"']+/.exec(tag.slice(i))?.[0];
    if (!name) {
      i++;
      continue;
    }
    i += name.length;

    let valueStart = i;
    while (valueStart < tag.length && /\s/.test(tag[valueStart])) valueStart++;
    if (tag[valueStart] !== '=') {
      attributes.push({ name, value: null });
      continue;
    }
    valueStart++;
    while (valueStart < tag.length && /\s/.test(tag[valueStart])) valueStart++;

    const first = tag[valueStart];
    let valueEnd;
    if (first === '"' || first === "'") {
      const close = tag.indexOf(first, valueStart + 1);
      valueEnd = close === -1 ? tag.length : close + 1;
    } else if (first === '{') {
      const end = skipBraces(tag, valueStart);
      valueEnd = end === -1 ? tag.length : end;
    } else {
      valueEnd = valueStart + (/^[^\s>]*/.exec(tag.slice(valueStart))?.[0].length ?? 0);
    }
    attributes.push({ name, value: tag.slice(valueStart, valueEnd) });
    i = Math.max(valueEnd, valueStart + 1);
  }
  return attributes;
}

/**
 * How many items an inline array attribute has: `{[ {...}, {...} ]}` -> 2.
 * Returns null when the value is not an array literal (a variable, a call).
 */
export function countArrayItems(value) {
  if (typeof value !== 'string') return null;
  let text = value.trim();
  if (text.startsWith('{') && text.endsWith('}')) text = text.slice(1, -1).trim();
  if (!text.startsWith('[')) return null;

  let depth = 0;
  let count = 0;
  let itemHasContent = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];
    if (char === '"' || char === "'" || char === '`') {
      const end = char === '`' ? skipTemplate(text, i) : skipQuoted(text, i);
      if (end === -1) return null;
      if (depth === 1) itemHasContent = true;
      i = end;
    } else if (char === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2);
      if (end === -1) return null;
      i = end + 2;
    } else if (char === '/' && text[i + 1] === '/') {
      const end = text.indexOf('\n', i);
      i = end === -1 ? text.length : end;
    } else if (char === '[' || char === '{' || char === '(') {
      if (depth === 1) itemHasContent = true;
      depth++;
      i++;
    } else if (char === ']' || char === '}' || char === ')') {
      depth--;
      if (depth === 0) return itemHasContent ? count + 1 : count;
      i++;
    } else if (char === ',' && depth === 1) {
      if (itemHasContent) count++;
      itemHasContent = false;
      i++;
    } else {
      if (depth === 1 && !/\s/.test(char)) itemHasContent = true;
      i++;
    }
  }
  return null;
}

/** From a `{`, return the index after its matching `}` (or -1). Strings are skipped. */
function skipBraces(text, start) {
  let depth = 0;
  let i = start;

  while (i < text.length) {
    const char = text[i];
    if (char === '{') {
      depth++;
      i++;
    } else if (char === '}') {
      depth--;
      i++;
      if (depth === 0) return i;
    } else if (char === '"' || char === "'") {
      i = skipQuoted(text, i);
    } else if (char === '`') {
      const end = skipTemplate(text, i);
      if (end === -1) return -1;
      i = end;
    } else if (char === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2);
      if (end === -1) return -1;
      i = end + 2;
    } else {
      i++;
    }
  }
  return -1;
}

/** Skip a '...' or "..." string on one line. An unmatched quote is a plain character. */
function skipQuoted(text, start) {
  const quote = text[start];
  for (let i = start + 1; i < text.length; i++) {
    if (text[i] === '\\') i++;
    else if (text[i] === quote) return i + 1;
    else if (text[i] === '\n') break;
  }
  return start + 1;
}

/** Skip a `template literal`, including nested ${ ... } parts. */
function skipTemplate(text, start) {
  let i = start + 1;
  while (i < text.length) {
    if (text[i] === '\\') {
      i += 2;
    } else if (text[i] === '`') {
      return i + 1;
    } else if (text[i] === '$' && text[i + 1] === '{') {
      const end = skipBraces(text, i + 1);
      if (end === -1) return -1;
      i = end;
    } else {
      i++;
    }
  }
  return -1;
}

/** Skip `inline code` on one line. */
function skipInlineCode(text, start) {
  const close = text.indexOf('`', start + 1);
  const newline = text.indexOf('\n', start + 1);
  if (close !== -1 && (newline === -1 || close < newline)) return close + 1;
  return start + 1;
}
