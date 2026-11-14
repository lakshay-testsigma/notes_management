// `tutor insight`: appends the learner's own note to my-insights-<slug>.md and
// adds a backlink under "## My insights" in a related note.

import path from 'node:path';
import { isFile, readText, relPath, walkFiles, writeTextAtomic } from './io.mjs';
import { findSection, insertAtSectionEnd, INSIGHTS_HEADING } from './markdown.mjs';
import { renderTemplate, topicVars, TOPIC_TEMPLATES } from './templates.mjs';
import { topicPaths } from './topic-store.mjs';
import { today } from './clock.mjs';
import { UsageError } from './errors.mjs';

const DEFAULT_SECTION = 'General';

/** Short names accepted by --target, mapped to topicPaths keys. */
const TARGET_KEYS = {
  'start-here': 'start_here',
  brief: 'brief',
  lesson: 'lesson',
  'mini-projects': 'mini_projects',
  digests: 'digests_index',
  digest: 'digests_index',
  'repo-intel': 'repo_intel_index',
  capstone: 'capstone',
  'final-notes': 'final_notes',
  notes: 'final_notes',
  recall: 'recall',
  resources: 'resources',
};

export const TARGET_NAMES = Object.keys(TARGET_KEYS);

/** First words of the first sentence, cleaned so they are safe inside a heading and a wikilink. */
function firstWords(text, count = 6) {
  const firstLine = text.trim().split('\n')[0];
  const firstSentence = firstLine.split(/(?<=[.!?])\s+/)[0];
  const clean = firstSentence.replace(/[[\]|#^`*_<>]/g, '').replace(/\s+/g, ' ').trim();
  const words = clean.split(' ').slice(0, count).join(' ');
  return words.replace(/[.,;:!?]+$/, '').slice(0, 70) || 'insight';
}

/** Resolve --target to a note inside the vault. Returns a repository-relative path. */
export function resolveTarget(root, topic, target) {
  const paths = topicPaths(topic);
  const key = TARGET_KEYS[String(target).trim().toLowerCase().replace(/_/g, '-')];
  if (key) return paths[key];

  const vaultRoot = path.join(root, 'vault');
  const withExtension = target.endsWith('.md') ? target : `${target}.md`;
  const candidates = [
    path.resolve(root, withExtension),
    path.resolve(root, paths.vault_dir, withExtension),
    path.resolve(vaultRoot, withExtension),
  ];
  let found = candidates.find((candidate) => isFile(candidate));

  if (!found) {
    const baseName = path.basename(withExtension);
    const inTopic = walkFiles(path.join(root, paths.vault_dir)).filter((f) => path.basename(f) === baseName);
    const pool = inTopic.length ? inTopic : walkFiles(vaultRoot, { skipDirs: ['.obsidian'] }).filter((f) => path.basename(f) === baseName);
    if (pool.length === 1) found = pool[0];
  }

  const insideVault = found && !path.relative(vaultRoot, found).startsWith('..');
  if (!found || !insideVault) {
    throw new UsageError(
      `Cannot find the --target note "${target}".`,
      `Use one of: ${TARGET_NAMES.join(', ')} — or the file name or path of a note in the vault.`,
    );
  }
  const relative = relPath(root, found);
  if (relative === paths.insights) {
    throw new UsageError('The --target cannot be the my-insights note itself.');
  }
  return relative;
}

/**
 * Append the insight. Returns { file, heading, section, target, backlink }.
 * Existing content of both files is kept exactly as it is.
 */
export function addInsight(root, topic, { text, section, target }) {
  const paths = topicPaths(topic);
  const targetPath = target ? resolveTarget(root, topic, target) : null;
  const insightsFile = path.join(root, paths.insights);

  const current = isFile(insightsFile)
    ? readText(insightsFile)
    : renderTemplate(TOPIC_TEMPLATES.insights, topicVars(topic));
  let lines = current.replace(/\s*$/, '').split('\n');

  const sectionTitle = (section ?? DEFAULT_SECTION).replace(/^#+\s*/, '').trim() || DEFAULT_SECTION;
  let sectionLine = findSection(lines, sectionTitle);
  if (sectionLine === -1) {
    lines = [...lines, '', `## ${sectionTitle}`];
    sectionLine = lines.length - 1;
  }

  const heading = uniqueHeading(lines, `${today()} — ${firstWords(text)}`);
  lines = insertAtSectionEnd(lines, sectionLine, [`### ${heading}`, '', text.trim()]);
  writeTextAtomic(insightsFile, `${lines.join('\n').replace(/\s*$/, '')}\n`);

  let backlink = null;
  if (targetPath) {
    const insightsName = path.basename(paths.insights, '.md');
    backlink = `- [[${insightsName}#${heading}|${heading}]]`;
    addBacklink(path.join(root, targetPath), backlink);
  }
  return { file: paths.insights, heading, section: sectionTitle, target: targetPath, backlink };
}

function uniqueHeading(lines, wanted) {
  const existing = new Set(lines.filter((l) => l.startsWith('### ')).map((l) => l.slice(4).trim()));
  if (!existing.has(wanted)) return wanted;
  for (let n = 2; ; n++) {
    const candidate = `${wanted} (${n})`;
    if (!existing.has(candidate)) return candidate;
  }
}

/** Add a bullet at the end of the "## My insights" section, creating the heading if needed. */
function addBacklink(file, bullet) {
  let lines = readText(file).replace(/\s*$/, '').split('\n');
  let heading = -1;
  lines.forEach((line, index) => {
    if (/^##\s+My insights\s*$/i.test(line)) heading = index;
  });
  if (heading === -1) {
    lines = [...lines, '', INSIGHTS_HEADING];
    heading = lines.length - 1;
  }
  lines = insertAtSectionEnd(lines, heading, [bullet], { tight: true });
  writeTextAtomic(file, `${lines.join('\n').replace(/\s*$/, '')}\n`);
}
