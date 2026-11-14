// Gate: research. sources.json holds enough verified, well-formed sources.

import { isFile, readText } from '../io.mjs';
import { CLI } from '../root.mjs';
import { readSources, sourceEntryProblems } from '../sources.mjs';
import { failure } from './context.mjs';

export function researchGate(ctx) {
  const { topic, paths, profile } = ctx;
  const where = paths.sources_json;
  const failures = [];
  const { entries, error } = readSources(ctx.root, topic);

  if (error) {
    return [failure(where, error, `the file must be a JSON array of source entries; add entries with \`${CLI} sources ${topic.id} add --file <entry.json>\``)];
  }

  const [min, max] = profile.sources;
  if (entries.length < min) {
    failures.push(failure(where, `has ${entries.length} sources, depth "${topic.depth}" needs ${min}–${max}`, `verify and add ${min - entries.length} more with \`${CLI} sources ${topic.id} add --file <entry.json>\``));
  } else if (entries.length > max) {
    failures.push(failure(where, `has ${entries.length} sources, depth "${topic.depth}" allows ${min}–${max}`, `keep the best ${max}: delete the weakest tier B entries from the file`));
  }

  const seenIds = new Set();
  const seenUrls = new Set();
  entries.forEach((entry, i) => {
    const label = typeof entry?.id === 'string' ? `entry "${entry.id}"` : `entry [${i}]`;
    for (const problem of sourceEntryProblems(entry)) {
      failures.push(failure(where, `${label}: ${problem.field} ${problem.problem}`, problem.fix));
    }
    if (typeof entry?.id === 'string') {
      if (seenIds.has(entry.id)) failures.push(failure(where, `id "${entry.id}" is used twice`, 'remove the duplicate entry'));
      seenIds.add(entry.id);
    }
    if (typeof entry?.url === 'string') {
      if (seenUrls.has(entry.url)) failures.push(failure(where, `url ${entry.url} is listed twice`, 'remove the duplicate entry'));
      seenUrls.add(entry.url);
    }
  });

  if (entries.length > 0 && !entries.some((entry) => entry?.tier === 'A')) {
    failures.push(failure(where, 'has no tier A source', 'add at least one canonical source (official docs, the defining paper, the standard book, or the reference implementation)'));
  }

  const resources = ctx.abs(paths.resources);
  if (!isFile(resources)) {
    failures.push(failure(paths.resources, 'file is missing', `run \`${CLI} map ${topic.id}\``));
  } else {
    const text = readText(resources);
    const missing = entries.filter((entry) => typeof entry?.url === 'string' && !text.includes(entry.url));
    if (missing.length > 0) {
      failures.push(failure(paths.resources, `is out of date (${missing.length} sources are not listed)`, `run \`${CLI} map ${topic.id}\``));
    }
  }
  return failures;
}
