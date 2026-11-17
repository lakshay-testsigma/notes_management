// A small, deterministic check of the writing standard
// (harness/rubrics/writing-standard.md). The target is about 80% of the
// ASD-STE100 style, so it only warns: short sentences, active voice, and
// terms defined before heavy use. A human or reviewer decides the rest.

export const STYLE_LIMITS = {
  sentenceWords: 25, // ASD-STE100 procedural limit is 20, descriptive 25
  averageWords: 20,
  longShare: 0.2, // at most this share of sentences may exceed sentenceWords
  passiveShare: 0.25, // at most this share of sentences may look passive
};

const IRREGULAR_PARTICIPLES = [
  'built', 'chosen', 'done', 'drawn', 'driven', 'found', 'given', 'held', 'hidden', 'kept', 'known', 'lost', 'made',
  'meant', 'paid', 'read', 'run', 'sent', 'set', 'shown', 'sold', 'spent', 'taken', 'thrown', 'told', 'written',
];
const PASSIVE = new RegExp(`\\b(is|are|was|were|be|been|being|gets|got)\\s+(\\w+ly\\s+)?(\\w+ed|${IRREGULAR_PARTICIPLES.join('|')})\\b`, 'i');
// Words that read as academic filler; STE prefers the short word in brackets.
export const PLAIN_WORDS = {
  utilize: 'use', utilise: 'use', facilitate: 'help', leverage: 'use', commence: 'start', terminate: 'stop',
  subsequently: 'then', approximately: 'about', 'in order to': 'to', numerous: 'many', methodology: 'method',
  aforementioned: 'this', paradigm: 'model', endeavor: 'try', ascertain: 'find out', demonstrate: 'show',
};

/** Strip markdown and MDX noise so only sentences remain. */
export function plainText(markdown) {
  return markdown
    .replace(/^---\n[\s\S]*?\n---\n?/, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/`[^`\n]*`/g, 'code')
    .replace(/!\[\[[^\]]*\]\]/g, ' ')
    .replace(/\[\[([^\]|]*\|)?([^\]]*)\]\]/g, '$2')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#+\s.*$/gm, ' ')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*\|.*\|\s*$/gm, ' ')
    .replace(/[*_]{1,3}/g, '');
}

export function sentences(text) {
  return plainText(text)
    .split(/(?<=[.!?])\s+|\n{2,}/)
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter((s) => s.split(' ').length >= 3);
}

/**
 * Returns { sentences, averageWords, long: [sentence], passive: [sentence],
 *           plainWords: [{ word, use }], score, warnings: [text] }.
 * `score` is the share of sentences that follow the length and voice rules.
 */
export function styleReport(text) {
  const list = sentences(text);
  const words = list.map((s) => s.split(' ').length);
  const total = words.reduce((a, b) => a + b, 0);
  const long = list.filter((_, i) => words[i] > STYLE_LIMITS.sentenceWords);
  const passive = list.filter((s) => PASSIVE.test(s));
  const lower = plainText(text).toLowerCase();
  const plainWords = Object.entries(PLAIN_WORDS)
    .filter(([word]) => new RegExp(`\\b${word}\\b`).test(lower))
    .map(([word, use]) => ({ word, use }));
  const good = list.filter((s, i) => words[i] <= STYLE_LIMITS.sentenceWords && !PASSIVE.test(s)).length;
  const averageWords = list.length ? Math.round((total / list.length) * 10) / 10 : 0;

  const warnings = [];
  if (list.length >= 3 && averageWords > STYLE_LIMITS.averageWords) {
    warnings.push(`average sentence is ${averageWords} words (aim for ${STYLE_LIMITS.averageWords} or fewer)`);
  }
  if (list.length >= 3 && long.length / list.length > STYLE_LIMITS.longShare) {
    warnings.push(`${long.length} of ${list.length} sentences have more than ${STYLE_LIMITS.sentenceWords} words, e.g. "${long[0].slice(0, 70)}…"`);
  }
  if (list.length >= 4 && passive.length / list.length > STYLE_LIMITS.passiveShare) {
    warnings.push(`${passive.length} of ${list.length} sentences look passive, e.g. "${passive[0].slice(0, 70)}…"; prefer active voice`);
  }
  if (plainWords.length) {
    warnings.push(`uses ${plainWords.map((p) => `"${p.word}" (use "${p.use}")`).join(', ')}`);
  }
  return {
    sentences: list.length,
    averageWords,
    long,
    passive,
    plainWords,
    score: list.length ? Math.round((good / list.length) * 100) : 100,
    warnings,
  };
}
