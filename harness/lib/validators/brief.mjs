// Gate: brief. 01-brief exists, is 150–400 words, and has its core sections.

import { listHeadings } from '../markdown.mjs';
import { failure } from './context.mjs';
import { checkNote, noteWords, wordRangeFailure } from './note.mjs';

export const BRIEF_WORDS = [150, 400];

/**
 * The three ideas a brief must cover (§3.1: what it is, why it exists, where
 * it is used). A section counts when its heading starts with one of the
 * accepted wordings.
 */
export const BRIEF_SECTIONS = [
  { heading: 'What it is', accept: ['what it is', 'what is it'] },
  { heading: 'The problem it solves', accept: ['the problem it solves', 'why it exists', 'why it matters'] },
  { heading: 'Where it is used', accept: ['where it is used'] },
];

export function briefGate(ctx) {
  const relative = ctx.paths.brief;
  const { failures, note } = checkNote(ctx, relative, { stage: 'brief' });
  if (!note) return failures;

  const range = wordRangeFailure(relative, noteWords(note), ...BRIEF_WORDS);
  if (range) failures.push(range);

  const headings = listHeadings(note.body).map((h) => h.text.toLowerCase());
  for (const section of BRIEF_SECTIONS) {
    const present = headings.some((text) => section.accept.some((wording) => text.startsWith(wording)));
    if (!present) {
      failures.push(failure(relative, `section "## ${section.heading}" is missing`, `add the heading \`## ${section.heading}\` with a short paragraph under it`));
    }
  }
  return failures;
}
