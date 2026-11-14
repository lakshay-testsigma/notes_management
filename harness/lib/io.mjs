import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export function exists(p) {
  return fs.existsSync(p);
}

export function isDir(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

export function isFile(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

export function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

export function readText(p) {
  return fs.readFileSync(p, 'utf8');
}

export function readTextIfExists(p) {
  return isFile(p) ? readText(p) : null;
}

export function readJson(p) {
  return JSON.parse(readText(p));
}

/** Write through a temp file + rename so readers never see a half-written file. */
export function writeTextAtomic(p, text) {
  ensureDir(path.dirname(p));
  const suffix = `${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  const temp = path.join(path.dirname(p), `.${path.basename(p)}.${suffix}`);
  fs.writeFileSync(temp, text);
  fs.renameSync(temp, p);
}

export function writeJsonAtomic(p, value) {
  writeTextAtomic(p, `${JSON.stringify(value, null, 2)}\n`);
}

/** Create the file only when it does not exist. Returns true when it was created. */
export function writeIfMissing(p, text) {
  if (exists(p)) return false;
  writeTextAtomic(p, text);
  return true;
}

/** Names of the files directly inside a directory, sorted. */
export function listFiles(dir) {
  return readEntries(dir)
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .sort();
}

/** Names of the directories directly inside a directory, sorted. */
export function listDirs(dir) {
  return readEntries(dir)
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

/** Absolute paths of every file below a directory, sorted. */
export function walkFiles(dir, { skipDirs = [] } = {}) {
  const skip = new Set(skipDirs);
  const found = [];
  const visit = (current) => {
    for (const entry of readEntries(current)) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!skip.has(entry.name)) visit(full);
      } else if (entry.isFile()) {
        found.push(full);
      }
    }
  };
  visit(dir);
  return found.sort();
}

/** True when the directory exists and contains at least one file at any depth. */
export function dirHasFiles(dir) {
  return isDir(dir) && walkFiles(dir).length > 0;
}

export function toPosix(p) {
  return p.split(path.sep).join('/');
}

/** Path relative to the repository root, with forward slashes. */
export function relPath(root, absolute) {
  return toPosix(path.relative(root, absolute));
}

function readEntries(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

/**
 * Run `fn` while holding a directory lock, so two tutor commands started at the
 * same time (parallel subagents) never lose each other's state updates.
 */
export function withLock(lockDir, fn) {
  ensureDir(path.dirname(lockDir));
  const deadline = Date.now() + 15000;
  const staleAfterMs = 30000;

  for (;;) {
    try {
      fs.mkdirSync(lockDir);
      break;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      if (lockAgeMs(lockDir) > staleAfterMs) {
        removeLock(lockDir);
        continue;
      }
      if (Date.now() > deadline) {
        throw new Error(
          `Another tutor command is holding the state lock (${lockDir}). ` +
            'Wait a moment and run the command again; delete that folder if no tutor command is running.',
        );
      }
      sleepMs(20 + Math.floor(Math.random() * 30));
    }
  }

  try {
    return fn();
  } finally {
    removeLock(lockDir);
  }
}

function lockAgeMs(lockDir) {
  try {
    return Date.now() - fs.statSync(lockDir).mtimeMs;
  } catch {
    return 0;
  }
}

function removeLock(lockDir) {
  try {
    fs.rmdirSync(lockDir);
  } catch {
    // already gone
  }
}

function sleepMs(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}
