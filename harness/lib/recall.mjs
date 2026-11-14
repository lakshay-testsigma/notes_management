// Recall cards: parsing 08-recall, and Leitner-box scheduling.

import path from 'node:path';
import { readTextIfExists } from './io.mjs';
import { addDays, today } from './clock.mjs';
import { topicPaths } from './topic-store.mjs';

/** Days until the next review, by box (box 1 is index 0). */
export const INTERVALS = [1, 3, 7, 16, 35, 90, 180, 365];
export const GRADES = ['again', 'hard', 'good', 'easy'];
const MAX_BOX = INTERVALS.length;
const MAX_HISTORY = 50;

const CARD_COMMENT = /^\s*<!--\s*card:\s*(\S+?)\s*-->\s*$/;
const INSIGHTS = /^##\s+My insights\s*$/i;

/**
 * Parse cards in the §11 format:
 *
 *   <!-- card: rs-01 -->
 *   question line(s)
 *   ?
 *   answer line(s)        (ends at a blank line or the next card)
 *
 * Returns { cards: [{ id, question, answer, line }], problems: [text] }.
 */
export function parseCards(text) {
  const lines = String(text).split(/\r?\n/);
  const cards = [];
  const problems = [];
  const seen = new Set();
  const stop = lines.findIndex((line) => INSIGHTS.test(line));
  const end = stop === -1 ? lines.length : stop;

  for (let i = 0; i < end; i++) {
    const match = CARD_COMMENT.exec(lines[i]);
    if (!match) continue;
    const id = match[1];
    const lineNumber = i + 1;

    let cursor = i + 1;
    while (cursor < end && lines[cursor].trim() === '') cursor++;

    const question = [];
    while (cursor < end && lines[cursor].trim() !== '' && lines[cursor].trim() !== '?' && !CARD_COMMENT.test(lines[cursor])) {
      question.push(lines[cursor]);
      cursor++;
    }
    const hasSeparator = cursor < end && lines[cursor].trim() === '?';

    const answer = [];
    if (hasSeparator) {
      cursor++;
      while (cursor < end && lines[cursor].trim() !== '' && !CARD_COMMENT.test(lines[cursor])) {
        answer.push(lines[cursor]);
        cursor++;
      }
    }

    if (!/^[A-Za-z0-9][\w.-]*$/.test(id)) {
      problems.push(`line ${lineNumber}: card id "${id}" may only use letters, digits, dot, dash, underscore`);
    } else if (seen.has(id)) {
      problems.push(`line ${lineNumber}: card id "${id}" is used twice`);
    } else if (question.length === 0) {
      problems.push(`line ${lineNumber}: card "${id}" has no question line under the id comment`);
    } else if (!hasSeparator) {
      problems.push(`line ${lineNumber}: card "${id}" has no line containing only "?" between question and answer`);
    } else if (answer.length === 0) {
      problems.push(`line ${lineNumber}: card "${id}" has no answer line directly under the "?" line`);
    } else {
      seen.add(id);
      cards.push({ id, question: question.join('\n').trim(), answer: answer.join('\n').trim(), line: lineNumber });
    }
  }
  return { cards, problems };
}

/** Read and parse the 08-recall note of a topic. */
export function readCards(root, topic) {
  const text = readTextIfExists(path.join(root, topicPaths(topic).recall));
  return text === null ? { cards: [], problems: [] } : parseCards(text);
}

function registry(topic) {
  if (!topic.recall || typeof topic.recall !== 'object') topic.recall = { cards: {} };
  if (!topic.recall.cards || typeof topic.recall.cards !== 'object') topic.recall.cards = {};
  return topic.recall.cards;
}

/**
 * Make topic.recall.cards match the note: new ids start in box 1 and are due
 * today; ids that left the note are dropped. Returns { added, removed, total }.
 */
export function syncCards(topic, cards) {
  const registered = registry(topic);
  const inNote = new Set(cards.map((card) => card.id));
  const added = [];
  const removed = [];

  for (const id of inNote) {
    if (!registered[id]) {
      registered[id] = { box: 1, due: today(), added: today(), last_reviewed: null, reviews: 0, history: [] };
      added.push(id);
    }
  }
  for (const id of Object.keys(registered)) {
    if (!inNote.has(id)) {
      delete registered[id];
      removed.push(id);
    }
  }
  return { added, removed, total: Object.keys(registered).length };
}

/** Leitner move: again -> box 1, hard -> stay, good -> +1, easy -> +2. */
export function nextBox(box, grade) {
  if (grade === 'again') return 1;
  if (grade === 'hard') return box;
  if (grade === 'good') return Math.min(MAX_BOX, box + 1);
  return Math.min(MAX_BOX, box + 2);
}

/** Grade one registered card. Returns { id, grade, from, to, due, interval_days }. */
export function gradeCard(topic, id, grade, date = today()) {
  const card = registry(topic)[id];
  const from = card.box;
  const to = nextBox(from, grade);
  const interval = INTERVALS[to - 1];

  card.box = to;
  card.due = addDays(date, interval);
  card.last_reviewed = date;
  card.reviews = (card.reviews ?? 0) + 1;
  card.history = [...(card.history ?? []), { date, grade, from, to }].slice(-MAX_HISTORY);

  return { id, grade, from, to, due: card.due, interval_days: interval };
}

/**
 * Cards of one topic that are due today or earlier, with their text.
 * Returns { due: [...], unsynced, next_due }.
 */
export function dueCards(root, topic) {
  const registered = registry(topic);
  const { cards } = readCards(root, topic);
  const date = today();
  const due = [];
  let nextDue = null;

  for (const card of cards) {
    const state = registered[card.id];
    if (!state) continue;
    if (state.due <= date) {
      due.push({
        topic: topic.id,
        title: topic.title,
        id: card.id,
        box: state.box,
        due: state.due,
        reviews: state.reviews ?? 0,
        question: card.question,
        answer: card.answer,
      });
    } else if (nextDue === null || state.due < nextDue) {
      nextDue = state.due;
    }
  }

  due.sort((a, b) => a.due.localeCompare(b.due) || a.box - b.box || a.id.localeCompare(b.id));
  const unsynced = cards.filter((card) => !registered[card.id]).length;
  return { due, unsynced, next_due: nextDue, registered: Object.keys(registered).length };
}
