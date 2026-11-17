// Rules every vault note follows (§11): frontmatter, wikilinks that resolve,
// and nothing generated below "## My insights".

import { isFile, readText } from '../io.mjs';
import { isIsoDate } from '../clock.mjs';
import {
  aboveInsights,
  countWords,
  extractWikilinks,
  insightsLine,
  PLACEHOLDER,
  splitFrontmatter,
  stripFencedCode,
} from '../markdown.mjs';
import { resolveWikilink } from '../vault-index.mjs';
import { CLI } from '../root.mjs';
import { failure } from './context.mjs';

export const NOTE_STAGES = [
  'brief', 'lesson', 'mini-projects', 'digest', 'repo-intel', 'capstone', 'final-notes',
  'recall', 'resources', 'insights', 'map', 'concept', 'tech', 'visual',
];

/**
 * Check one vault note.
 * options: {
 *   stage            expected frontmatter `stage` (omit to accept any valid stage)
 *   requireInsights  the note must end with "## My insights" (default true)
 *   allowPlaceholder the scaffold placeholder may still be there (default false)
 * }
 * Returns { failures, note } where note is { text, data, body } or null when missing.
 */
export function checkNote(ctx, relative, options = {}) {
  const { stage = null, requireInsights = true, allowPlaceholder = false } = options;
  const failures = [];
  const file = ctx.abs(relative);

  if (!isFile(file)) {
    failures.push(failure(relative, 'file is missing', `write the note (\`${CLI} init\` with the same title and flags restores an empty scaffold)`));
    return { failures, note: null };
  }

  const text = readText(file);
  const { has, data, body } = splitFrontmatter(text);

  failures.push(...frontmatterFailures(ctx, relative, has, data, stage));

  if (!allowPlaceholder && text.includes(PLACEHOLDER)) {
    failures.push(failure(relative, 'still contains the scaffold placeholder', `write the real content and delete the \`${PLACEHOLDER}\` line and the "Not written yet" line under it`));
  }

  failures.push(...insightsFailures(relative, body, requireInsights));
  failures.push(...linkFailures(ctx, relative, body));

  return { failures, note: { text, data, body } };
}

function frontmatterFailures(ctx, relative, has, data, expectedStage) {
  if (!has) {
    return [failure(relative, 'has no frontmatter', 'start the file with a `---` block that has title, topic, stage, tags, created')];
  }
  const failures = [];
  const isTopicNote = relative.startsWith(`${ctx.paths.vault_dir}/`);

  if (typeof data.title !== 'string' || !data.title.trim()) {
    failures.push(failure(relative, 'frontmatter has no `title`', 'add `title: <human title>`'));
  }
  if (isTopicNote && data.topic !== ctx.topic.id) {
    failures.push(failure(relative, `frontmatter \`topic\` is "${data.topic ?? ''}"`, `set \`topic: ${ctx.topic.id}\``));
  }
  if (!NOTE_STAGES.includes(data.stage)) {
    failures.push(failure(relative, `frontmatter \`stage\` is "${data.stage ?? ''}"`, `set \`stage:\` to ${expectedStage ? `\`${expectedStage}\`` : `one of ${NOTE_STAGES.join(', ')}`}`));
  } else if (expectedStage && data.stage !== expectedStage) {
    failures.push(failure(relative, `frontmatter \`stage\` is "${data.stage}"`, `set \`stage: ${expectedStage}\``));
  }
  if (!Array.isArray(data.tags) || data.tags.length === 0) {
    failures.push(failure(relative, 'frontmatter `tags` is not a list', `set \`tags: [${ctx.topic.domain}, ${ctx.topic.subdomain}]\``));
  }
  if (!isIsoDate(String(data.created ?? ''))) {
    failures.push(failure(relative, 'frontmatter `created` is not a YYYY-MM-DD date', 'set `created:` to the date the note was written, e.g. `created: 2026-11-14`'));
  }
  if (data.sources != null) {
    if (!Array.isArray(data.sources)) {
      failures.push(failure(relative, 'frontmatter `sources` is not a list', 'write it as `sources: [id-one, id-two]` using ids from sources.json'));
    } else if (isTopicNote) {
      for (const id of data.sources) {
        if (!ctx.sourceIds.has(String(id))) {
          failures.push(failure(relative, `frontmatter \`sources\` names "${id}", which is not in sources.json`, `use an id listed by \`${CLI} sources ${ctx.topic.id} list\``));
        }
      }
    }
  }
  return failures;
}

function insightsFailures(relative, body, required) {
  const index = insightsLine(body);
  if (index === -1) {
    if (!required) return [];
    return [failure(relative, 'has no `## My insights` heading', 'add `## My insights` as the last heading of the note and write nothing below it')];
  }
  const below = stripFencedCode(body).split('\n').slice(index + 1);
  if (below.some((line) => /^#{1,2}\s/.test(line))) {
    return [failure(relative, 'has a heading below `## My insights`', 'move generated content above `## My insights`; it must be the last heading (only insight backlinks go below it)')];
  }
  return [];
}

function linkFailures(ctx, relative, body) {
  const failures = [];
  for (const target of extractWikilinks(body)) {
    const { ok, suggestion } = resolveWikilink(ctx.vaultIndex, target);
    if (ok) continue;
    const fix = suggestion
      ? `write it as [[${suggestion}]] (exact file name)`
      : `create that note (for a shared idea: \`${CLI} concept "<Name>"\`, add --tech for a technology) or link to an existing file name`;
    failures.push(failure(relative, `link [[${target}]] does not resolve to a file in the vault`, fix));
  }
  return failures;
}

/** Word count of the note body, without the "## My insights" section. */
export function noteWords(note) {
  return countWords(aboveInsights(note.body));
}

/** A failure when the word count is outside [min, max], else null. */
export function wordRangeFailure(relative, words, min, max) {
  if (words < min) {
    return failure(relative, `has ${words} words, the minimum is ${min}`, `add about ${min - words} more words of real content (target ${min}–${max})`);
  }
  if (words > max) {
    return failure(relative, `has ${words} words, the maximum is ${max}`, `cut about ${words - max} words (target ${min}–${max})`);
  }
  return null;
}
