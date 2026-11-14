// Backlinks of the shared notes. A note in vault/_concepts or vault/_tech is
// what connects topics, so every topic note that links to it gets one bullet
// under its "## Where it shows up" heading. `tutor map <topic>` keeps this in
// sync; lines are only ever added, never removed or rewritten.

import path from 'node:path';
import { listFiles, readText, walkFiles, writeTextAtomic } from './io.mjs';
import { extractWikilinks, findSection, insertAtSectionEnd, sectionEnd } from './markdown.mjs';
import { topicPaths } from './topic-store.mjs';

export const BACKLINKS_HEADING = 'Where it shows up';

/** A wikilink target as a note name: no folders, no `.md`. */
function noteNameOf(target) {
  return target.trim().split('/').pop().replace(/\.md$/i, '');
}

/**
 * Add the missing backlink bullets for one topic.
 * Returns [{ note, added: [linking note names] }] for the shared notes that changed.
 */
export function syncBacklinks(root, topic) {
  const paths = topicPaths(topic);

  // name -> file of every shared note; `byLower` forgives a link whose letter case is off.
  const shared = new Map();
  for (const folder of [paths.concepts_dir, paths.tech_dir]) {
    for (const name of listFiles(path.join(root, folder))) {
      if (name.endsWith('.md')) shared.set(name.slice(0, -3), `${folder}/${name}`);
    }
  }
  if (shared.size === 0) return [];
  const byLower = new Map([...shared.keys()].map((name) => [name.toLowerCase(), name]));

  // shared note name -> names of the topic notes that link to it, in file order
  const linkers = new Map();
  for (const file of walkFiles(path.join(root, paths.vault_dir))) {
    if (!file.endsWith('.md')) continue;
    const linker = path.basename(file, '.md');
    for (const target of extractWikilinks(readText(file))) {
      const name = noteNameOf(target);
      const sharedName = shared.has(name) ? name : byLower.get(name.toLowerCase());
      if (!sharedName) continue;
      if (!linkers.has(sharedName)) linkers.set(sharedName, []);
      if (!linkers.get(sharedName).includes(linker)) linkers.get(sharedName).push(linker);
    }
  }

  const changed = [];
  for (const [name, notes] of linkers) {
    const relative = shared.get(name);
    const added = addBacklinks(path.join(root, relative), notes);
    if (added.length > 0) changed.push({ note: relative, added });
  }
  return changed;
}

/** Add `- [[note]]` under "## Where it shows up" for every note not linked there yet. */
function addBacklinks(file, notes) {
  const text = readText(file);
  let lines = text.replace(/\s*$/, '').split('\n');

  let heading = findSection(lines, BACKLINKS_HEADING);
  if (heading === -1) {
    const insights = lines.findIndex((line) => /^##\s+My insights\s*$/i.test(line));
    if (insights === -1) {
      lines = [...lines, '', `## ${BACKLINKS_HEADING}`];
      heading = lines.length - 1;
    } else {
      lines.splice(insights, 0, `## ${BACKLINKS_HEADING}`, '');
      heading = insights;
    }
  }

  const section = lines.slice(heading + 1, sectionEnd(lines, heading)).join('\n');
  const present = new Set(extractWikilinks(section).map(noteNameOf));
  const added = [];
  for (const note of notes) {
    if (present.has(note)) continue;
    lines = insertAtSectionEnd(lines, heading, [`- [[${note}]]`], { tight: true });
    present.add(note);
    added.push(note);
  }
  if (added.length > 0) writeTextAtomic(file, `${lines.join('\n').replace(/\s*$/, '')}\n`);
  return added;
}
