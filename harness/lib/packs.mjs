import path from 'node:path';
import { isFile, listDirs, readJson, readTextIfExists } from './io.mjs';
import { listHeadings } from './markdown.mjs';
import { UsageError, ValidationError } from './errors.mjs';

/** The twelve domains named in ARCHITECTURE.md §8. */
export const EXPECTED_DOMAINS = [
  'frontend-engineering',
  'backend-engineering',
  'system-design',
  'devops',
  'ai-engineering',
  'core-ai',
  'data-engineering',
  'data-analytics',
  'mobile-development',
  'game-development',
  'security',
  'general',
];

/** Fixed playbook headings (§8). Each one is read by exactly one skill. */
export const PLAYBOOK_HEADINGS = [
  'How this domain is learned',
  'Trusted sources',
  'Lesson recipes',
  'Mini project patterns',
  'Repository analysis focus',
  'Capstone shape',
  'Recall focus',
  'Safety and ethics',
];

export function domainsDir(root) {
  return path.join(root, 'harness', 'domains');
}

/** Ids of every folder under harness/domains that has a pack.json. */
export function listPackIds(root) {
  const dir = domainsDir(root);
  return listDirs(dir).filter((name) => isFile(path.join(dir, name, 'pack.json')));
}

/** Load one pack. Unknown domain is a usage error that lists what exists. */
export function loadPack(root, domain) {
  const file = path.join(domainsDir(root), domain, 'pack.json');
  if (!isFile(file)) {
    const available = listPackIds(root);
    const list = available.length ? available.join(', ') : '(none found in harness/domains)';
    throw new UsageError(`Unknown domain "${domain}".`, `Available domains: ${list}`);
  }
  try {
    return readJson(file);
  } catch (error) {
    throw new ValidationError(
      `harness/domains/${domain}/pack.json is not valid JSON: ${error.message}`,
    );
  }
}

/** Load a pack, or return null when it is missing or broken. */
export function tryLoadPack(root, domain) {
  try {
    return loadPack(root, domain);
  } catch {
    return null;
  }
}

/** Problems with the shape of a pack (empty array when it is fine). */
export function packProblems(pack, folderName) {
  const problems = [];
  const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

  if (!isObject(pack)) return ['pack.json must be a JSON object'];
  if (pack.id !== folderName) problems.push(`"id" must be "${folderName}" (the folder name)`);
  for (const field of ['title', 'description']) {
    if (typeof pack[field] !== 'string' || !pack[field].trim()) {
      problems.push(`"${field}" must be a non-empty string`);
    }
  }
  if (!Array.isArray(pack.subdomains) || pack.subdomains.length === 0) {
    problems.push('"subdomains" must be a non-empty array');
  } else {
    pack.subdomains.forEach((sub, i) => {
      if (!isObject(sub) || typeof sub.id !== 'string' || typeof sub.title !== 'string') {
        problems.push(`subdomains[${i}] needs "id" and "title"`);
      } else if (!Array.isArray(sub.examples)) {
        problems.push(`subdomains[${i}] ("${sub.id}") needs an "examples" array`);
      }
    });
  }
  if (!isObject(pack.stages)) problems.push('"stages" must be an object');
  if (!isObject(pack.depth_overrides)) problems.push('"depth_overrides" must be an object');
  if (!isObject(pack.default_stack)) problems.push('"default_stack" must be an object');
  if (!Array.isArray(pack.safety)) problems.push('"safety" must be an array');
  return problems;
}

/** Missing fixed headings in a playbook (empty array when all are present). */
export function playbookProblems(text) {
  const present = new Set(
    listHeadings(text)
      .filter((h) => h.level === 2)
      .map((h) => h.text.toLowerCase()),
  );
  return PLAYBOOK_HEADINGS.filter((heading) => !present.has(heading.toLowerCase())).map(
    (heading) => `missing heading "## ${heading}"`,
  );
}

export function readPlaybook(root, domain) {
  return readTextIfExists(path.join(domainsDir(root), domain, 'playbook.md'));
}
