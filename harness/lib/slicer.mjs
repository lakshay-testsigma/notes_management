// `tutor slice` and `tutor budget`: estimate tokens (chars / 4) and cut a
// directory into slices that each fit one worker's reading budget.

import fs from 'node:fs';
import path from 'node:path';
import { toPosix } from './io.mjs';

export const DEFAULT_BUDGET = 10107; // 40% of an assumed 32K window, less 3000 tokens of overhead/reserve.
const MAX_FILE_BYTES = 400 * 1024;
const ROOT_GROUP = '(root files)';

const SKIP_DIRS = new Set([
  '.git', '.hg', '.svn', 'node_modules', 'dist', 'build', 'vendor', 'target', 'coverage',
  '.next', '.nuxt', '.turbo', '.cache', '.gradle', '.idea', '.venv', 'venv', '__pycache__', 'Pods',
]);

const LOCKFILES = new Set([
  'package-lock.json', 'npm-shrinkwrap.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb', 'bun.lock',
  'Cargo.lock', 'go.sum', 'poetry.lock', 'Pipfile.lock', 'uv.lock', 'Gemfile.lock', 'composer.lock',
  'flake.lock', 'mix.lock', 'Podfile.lock', 'pubspec.lock',
]);

const IMAGE_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'bmp', 'ico', 'icns', 'webp', 'avif', 'heic', 'tif', 'tiff', 'svg', 'psd',
]);

const BINARY_EXTENSIONS = new Set([
  'woff', 'woff2', 'ttf', 'otf', 'eot',
  'zip', 'tar', 'gz', 'tgz', 'bz2', 'xz', '7z', 'rar', 'jar', 'war',
  'mp3', 'mp4', 'mov', 'avi', 'webm', 'wav', 'ogg', 'flac',
  'exe', 'dll', 'so', 'dylib', 'a', 'o', 'obj', 'class', 'pyc', 'wasm', 'bin', 'dat',
  'db', 'sqlite', 'sqlite3', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'map', 'snap', 'lockb',
]);

export function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

/** Turn a simple glob (`*`, `**`, `?`) into a RegExp for forward-slash paths. */
export function globToRegExp(glob) {
  let pattern = '';
  for (let i = 0; i < glob.length; i++) {
    const char = glob[i];
    if (char === '*' && glob[i + 1] === '*') {
      if (glob[i + 2] === '/') {
        pattern += '(?:.*/)?';
        i += 2;
      } else {
        pattern += '.*';
        i += 1;
      }
    } else if (char === '*') {
      pattern += '[^/]*';
    } else if (char === '?') {
      pattern += '[^/]';
    } else {
      pattern += char.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    }
  }
  return new RegExp(`^${pattern}$`);
}

/** A glob without a slash also matches the file name alone (`*.ts`). */
function matchesAny(relative, globs) {
  if (globs.length === 0) return true;
  const base = relative.split('/').pop();
  return globs.some((glob) => {
    const regex = globToRegExp(glob.replace(/^\.\//, ''));
    return regex.test(relative) || (!glob.includes('/') && regex.test(base));
  });
}

function looksBinary(buffer) {
  const length = Math.min(buffer.length, 8000);
  for (let i = 0; i < length; i++) {
    if (buffer[i] === 0) return true;
  }
  return false;
}

/** Why a file is left out, or null when it should be read. */
function skipReasonForFile(name, size) {
  const lower = name.toLowerCase();
  const extension = lower.includes('.') ? lower.split('.').pop() : '';
  if (LOCKFILES.has(name)) return 'lockfile';
  if (IMAGE_EXTENSIONS.has(extension)) return 'image';
  if (BINARY_EXTENSIONS.has(extension) || lower.endsWith('.min.js') || lower.endsWith('.min.css')) return 'binary';
  if (size > MAX_FILE_BYTES) return 'larger than 400KB';
  return null;
}

/**
 * Walk a directory. Returns { files: [{ path, tokens }], skipped: { reason: count } }
 * with paths relative to `dir`, forward slashes, sorted.
 */
export function scanDirectory(dir, { include = [] } = {}) {
  const files = [];
  const skipped = {};
  const skip = (reason) => {
    skipped[reason] = (skipped[reason] ?? 0) + 1;
  };

  const visit = (current) => {
    const entries = fs.readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) skip(`directory ${entry.name}`);
        else visit(full);
        continue;
      }
      if (!entry.isFile()) continue;

      const relative = toPosix(path.relative(dir, full));
      const reason = skipReasonForFile(entry.name, fs.statSync(full).size);
      if (reason) {
        skip(reason);
        continue;
      }
      if (!matchesAny(relative, include)) {
        skip('not matched by --include');
        continue;
      }
      const buffer = fs.readFileSync(full);
      if (looksBinary(buffer)) {
        skip('binary');
        continue;
      }
      const text=buffer.toString('utf8'),file={path:relative,tokens:estimateTokens(text)};
      Object.defineProperty(file,'text',{value:text});
      files.push(file);
    }
  };

  visit(dir);
  return { files, skipped };
}

// --- slicing ----------------------------------------------------------------

function sum(items) {
  return items.reduce((total, item) => total + item.tokens, 0);
}

/** Build a directory tree: { path, files: [direct files], dirs: Map, tokens }. */
function buildTree(files) {
  const root = { path: '', files: [], dirs: new Map(), tokens: 0 };
  for (const file of files) {
    const parts = file.path.split('/');
    let node = root;
    node.tokens += file.tokens;
    for (const part of parts.slice(0, -1)) {
      if (!node.dirs.has(part)) {
        node.dirs.set(part, { path: node.path ? `${node.path}/${part}` : part, files: [], dirs: new Map(), tokens: 0 });
      }
      node = node.dirs.get(part);
      node.tokens += file.tokens;
    }
    node.files.push(file);
  }
  return root;
}

function allFiles(node) {
  return [...node.files, ...[...node.dirs.values()].flatMap(allFiles)];
}

/** A piece is a group of files that will become (part of) one slice. */
function piece(covers, files) {
  return { covers: [covers], files, tokens: sum(files) };
}

/** Cut a list of files into pieces that each fit the budget. */
function chunkFiles(label, files, budget) {
  const pieces = [];
  let current = [];
  for (const file of files) {
    if (current.length > 0 && sum(current) + file.tokens > budget) {
      pieces.push(piece(label, current));
      current = [];
    }
    current.push(file);
  }
  if (current.length > 0) pieces.push(piece(label, current));
  return pieces;
}

/** Join neighbouring pieces while the result still fits the budget. */
function packPieces(pieces, budget) {
  const packed = [];
  for (const next of pieces) {
    const last = packed[packed.length - 1];
    if (last && last.tokens + next.tokens <= budget) {
      last.covers = [...new Set([...last.covers, ...next.covers])];
      last.files = [...last.files, ...next.files];
      last.tokens += next.tokens;
    } else {
      packed.push({ ...next });
    }
  }
  return packed;
}

/** One directory -> pieces. A directory over budget is split along its sub-directories. */
function splitNode(node, budget) {
  if (node.tokens <= budget) return [piece(node.path, allFiles(node))];
  const parts = [];
  for (const child of [...node.dirs.values()].sort((a, b) => a.path.localeCompare(b.path))) {
    parts.push(...splitNode(child, budget));
  }
  if (node.files.length > 0) parts.push(...chunkFiles(`${node.path}/(files)`, node.files, budget));
  return packPieces(parts, budget);
}

function sliceId(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'slice';
}

/**
 * Cut files into slices of at most `budget` tokens, one group per top-level
 * directory. With `pack`, small neighbouring top-level groups share a slice.
 * Returns [{ id, tokens, files: [paths], covers: [paths], oversized? }].
 */
export function buildSlices(files, budget = DEFAULT_BUDGET, { pack = false } = {}) {
  files=files.flatMap(file=> {
    if(file.tokens<=budget||typeof file.text!=='string')return [file];
    const fragments=[];
    for(let start=0;start<file.text.length;start+=budget*4) {
      const end=Math.min(file.text.length,start+budget*4);
      fragments.push({path:file.path,tokens:estimateTokens(file.text.slice(start,end)),range:{path:file.path,start_char:start,end_char:end,start_line:1+file.text.slice(0,start).split('\n').length-1,end_line:file.text.slice(0,end).split('\n').length,tokens:estimateTokens(file.text.slice(start,end))}});
    }
    return fragments;
  });
  const tree = buildTree(files);
  let pieces = [];

  for (const child of [...tree.dirs.values()].sort((a, b) => a.path.localeCompare(b.path))) {
    const parts = splitNode(child, budget);
    parts.forEach((part) => {
      part.group = child.path;
    });
    pieces.push(...parts);
  }
  if (tree.files.length > 0) {
    const parts = chunkFiles(ROOT_GROUP, tree.files, budget);
    parts.forEach((part) => {
      part.group = 'root-files';
    });
    pieces.push(...parts);
  }
  if (pack) pieces = packPieces(pieces, budget);

  const used = new Map();
  const perGroup = new Map();
  for (const part of pieces) perGroup.set(part.group, (perGroup.get(part.group) ?? 0) + 1);
  const counters = new Map();

  return pieces.map((part) => {
    let base;
    if (part.covers.length === 1 && !part.covers[0].endsWith('(files)') && part.covers[0] !== ROOT_GROUP) {
      base = sliceId(part.covers[0]);
    } else if (perGroup.get(part.group) === 1) {
      base = sliceId(part.group);
    } else {
      const n = (counters.get(part.group) ?? 0) + 1;
      counters.set(part.group, n);
      base = `${sliceId(part.group)}-part-${n}`;
    }
    const count = (used.get(base) ?? 0) + 1;
    used.set(base, count);
    const id = count === 1 ? base : `${base}-${count}`;

    const slice = {
      id,
      tokens: part.tokens,
      files: part.files.map((file) => file.path),
      covers: part.covers,
      ...(part.files.some(f=>f.range)?{ranges:part.files.filter(f=>f.range).map(f=>f.range)}:{}),
    };
    if (part.tokens > budget) slice.oversized = true;
    return slice;
  });
}
