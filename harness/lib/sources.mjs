// sources.json: the vetted sources of a topic and the §9 quality-gate fields.

import path from 'node:path';
import { isFile, readJson, writeJsonAtomic } from './io.mjs';
import { isIsoDate, now } from './clock.mjs';
import { topicPaths } from './topic-store.mjs';

export const SOURCE_TYPES = [
  'official-docs',
  'paper',
  'book',
  'repo',
  'engineering-blog',
  'course',
  'talk',
  'standard',
];

export const SOURCE_TYPE_LABELS = {
  'official-docs': 'Official documentation',
  paper: 'Papers',
  book: 'Books',
  repo: 'Repositories',
  'engineering-blog': 'Engineering blogs',
  course: 'Courses',
  talk: 'Talks',
  standard: 'Standards',
};

const EVIDENCE_KEYS = ['stars', 'last_commit', 'citations', 'venue', 'publisher', 'used_by'];

function isHttpUrl(value) {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value.trim().split(/\s+/)[0]);
    return ['http:','https:'].includes(url.protocol) && !url.username && !url.password;
  } catch {
    return false;
  }
}

function isText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Check one entry against the §9 shape. Returns a list of
 * { field, problem, fix } (empty when the entry is valid).
 */
export function sourceEntryProblems(entry) {
  const problems = [];
  const add = (field, problem, fix) => problems.push({ field, problem, fix });

  if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
    add('(entry)', 'is not a JSON object', 'write the entry as an object with the fields of ARCHITECTURE.md §9');
    return problems;
  }

  if (!isText(entry.id) || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(entry.id)) {
    add('id', 'must be a lowercase slug such as "redis-streams-docs"', 'use only a-z, 0-9 and single dashes');
  }
  if (!SOURCE_TYPES.includes(entry.type)) {
    add('type', `must be one of ${SOURCE_TYPES.join(', ')}`, 'pick the type that matches the source');
  }
  if (!isText(entry.title)) add('title', 'is missing', 'add the title of the source');
  if (!isHttpUrl(entry.url)) add('url', 'must be an http(s) URL', 'add the full link to the source');
  if (!isText(entry.authors)) add('authors', 'is missing', 'name the person or organization behind it');

  const maxYear = now().getUTCFullYear() + 1;
  if (!Number.isInteger(entry.year) || entry.year < 1900 || entry.year > maxYear) {
    add('year', `must be a whole number between 1900 and ${maxYear}`, 'use the publication year, or the year of the latest revision for living docs');
  }
  if (entry.tier !== 'A' && entry.tier !== 'B') {
    add('tier', 'must be "A" or "B"', 'use A for canonical sources and B for strong, widely used ones; drop anything weaker');
  }
  if (!isText(entry.why_trusted)) {
    add('why_trusted', 'is missing', 'add one sentence a senior engineer would accept');
  }

  const evidence = entry.evidence;
  if (evidence === null || typeof evidence !== 'object' || Array.isArray(evidence)) {
    add('evidence', 'must be an object', `add an object with the keys ${EVIDENCE_KEYS.join(', ')}`);
  } else {
    for (const key of EVIDENCE_KEYS) {
      if (!(key in evidence)) add(`evidence.${key}`, 'is missing', 'add the key; use null when it does not apply');
    }
    for (const key of ['stars', 'citations']) {
      if (evidence[key] != null && !(typeof evidence[key] === 'number' && evidence[key] >= 0)) {
        add(`evidence.${key}`, 'must be a number or null', 'write the number that the live page shows');
      }
    }
    if (evidence.last_commit != null && !isIsoDate(evidence.last_commit)) {
      add('evidence.last_commit', 'must be a YYYY-MM-DD date or null', 'write the date of the latest commit');
    }
    if ('used_by' in evidence && evidence.used_by != null && !Array.isArray(evidence.used_by)) {
      add('evidence.used_by', 'must be an array or null', 'list the organizations or projects that use it');
    }
    const hasProof = EVIDENCE_KEYS.some((key) => {
      const value = evidence[key];
      return Array.isArray(value) ? value.length > 0 : value != null && value !== '';
    });
    if (!hasProof) {
      add('evidence', 'has no value at all', 'fill at least one of stars, citations, venue, publisher, used_by from a live page');
    }
  }

  if (evidence && typeof evidence==='object') {
    if(entry.type==='repo') {
      if(evidence.archived!==false)add('evidence.archived','must be false','verify that the repository is not archived');
      if(!isText(evidence.license))add('evidence.license','must name the license','verify the license file permits source study');
      const threshold=entry.tier==='A'?10000:3000;
      if(!(evidence.stars>=threshold) && !(entry.niche_reason?.trim() && evidence.stars >= (entry.tier==='A'?2000:1000))) add('evidence.stars','does not meet the repository threshold','choose a sufficiently adopted repository, or document a qualifying niche exception');
      if(!isIsoDate(evidence.last_commit) || now()-new Date(evidence.last_commit)>(entry.use_for?.includes('repo-intel')?90:365)*86400000 || new Date(evidence.last_commit)>now()) add('evidence.last_commit','must show recent maintenance','verify a commit in the last year');
      if(!evidence.used_by?.length) add('evidence.used_by','needs named production adoption','verify a named adopter with a linked primary source');
    }
    if(['official-docs','book','engineering-blog','standard','course','talk'].includes(entry.type) && !isText(evidence.publisher)) add('evidence.publisher','is required for this source type','identify the responsible publisher');
    if(entry.type==='paper' && !(evidence.citations>= (entry.tier==='A'?1000:100)) && !isText(evidence.venue)) add('evidence.venue','needs a recognized venue or qualifying citation evidence','verify the original publication and explain its standing');
  }
  if(isIsoDate(entry.verified_at) && (now()-new Date(entry.verified_at)>365*86400000 || new Date(entry.verified_at)>now())) add('verified_at','is stale or in the future','recheck evidence live and record the current date');

  if (!isIsoDate(entry.verified_at)) {
    add('verified_at', 'must be a YYYY-MM-DD date', 'write the date the evidence was read');
  }
  if (!isHttpUrl(entry.verified_via)) {
    add('verified_via', 'must start with an http(s) URL', 'add the page where the evidence was read');
  }
  if (!Array.isArray(entry.use_for) || entry.use_for.length === 0 || !entry.use_for.every(isText)) {
    add('use_for', 'must be a non-empty array of stage names', 'list the stages that should read it, e.g. ["brief", "digest"]');
  }
  return problems;
}

export function sourcesFile(root, topic) {
  return path.join(root, topicPaths(topic).sources_json);
}

/**
 * Read sources.json. Returns { entries, error }: `error` is a message when the
 * file is missing, is not valid JSON, or is not an array.
 */
export function readSources(root, topic) {
  const file = sourcesFile(root, topic);
  if (!isFile(file)) return { entries: [], error: 'file is missing' };
  try {
    const data = readJson(file);
    if (!Array.isArray(data)) return { entries: [], error: 'is not a JSON array' };
    return { entries: data, error: null };
  } catch (error) {
    return { entries: [], error: `is not valid JSON (${error.message})` };
  }
}

export function writeSources(root, topic, entries) {
  writeJsonAtomic(sourcesFile(root, topic), entries);
}

/** Ids of the valid-looking entries in sources.json. */
export function sourceIds(root, topic) {
  return new Set(
    readSources(root, topic)
      .entries.map((entry) => entry?.id)
      .filter((id) => typeof id === 'string'),
  );
}
