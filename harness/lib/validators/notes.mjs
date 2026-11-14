// Gate: notes. Final notes of 200–600 words and enough well-formed recall cards.

import { parseCards } from '../recall.mjs';
import { failure } from './context.mjs';
import { checkNote, noteWords, wordRangeFailure } from './note.mjs';

export const FINAL_NOTES_WORDS = [200, 600];

export function notesGate(ctx) {
  const { topic, paths, profile } = ctx;
  const failures = [];

  const finalNotes = checkNote(ctx, paths.final_notes, { stage: 'final-notes' });
  failures.push(...finalNotes.failures);
  if (finalNotes.note) {
    const range = wordRangeFailure(paths.final_notes, noteWords(finalNotes.note), ...FINAL_NOTES_WORDS);
    if (range) failures.push(range);
  }

  const recall = checkNote(ctx, paths.recall, { stage: 'recall' });
  failures.push(...recall.failures);
  if (recall.note) {
    const { cards, problems } = parseCards(recall.note.text);
    for (const problem of problems) {
      failures.push(failure(paths.recall, problem, 'write each card as: `<!-- card: id -->`, the question, a line with only `?`, the answer, then a blank line'));
    }
    if (cards.length < profile.recall_cards) {
      failures.push(failure(paths.recall, `has ${cards.length} valid recall cards, depth "${topic.depth}" needs at least ${profile.recall_cards}`, `add ${profile.recall_cards - cards.length} more cards, each with its own \`<!-- card: id -->\` comment`));
    }
  }
  return failures;
}
