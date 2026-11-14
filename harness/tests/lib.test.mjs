// Unit tests for the small library modules (no CLI process).

import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { parseArgs } from '../lib/args.mjs';
import { addDays, isIsoDate } from '../lib/clock.mjs';
import {
  countWords, extractWikilinks, replaceGeneratedRegion, slugify, splitFrontmatter, stripFencedCode,
} from '../lib/markdown.mjs';
import { analyzeLessonPage } from '../lib/mdx.mjs';
import { nextBox, parseCards } from '../lib/recall.mjs';
import { globToRegExp } from '../lib/slicer.mjs';
import { buildStages, DEPTH_PROFILES, resolveProfile } from '../lib/stages.mjs';

describe('args', () => {
  test('positionals, value flags, boolean flags, repeated flags', () => {
    const { positionals, flags } = parseArgs(['init', 'My Title', '--domain', 'x', '--json', '--depth=deep', '--include', 'a', '--include', 'b']);
    assert.deepEqual(positionals, ['init', 'My Title']);
    assert.deepEqual(flags, { domain: 'x', json: true, depth: 'deep', include: ['a', 'b'] });
  });

  test('a value may start with dashes, and a flag without a value is an error', () => {
    assert.equal(parseArgs(['--text', '--not-a-flag']).flags.text, '--not-a-flag');
    assert.throws(() => parseArgs(['--reason']), /needs a value/);
  });
});

describe('markdown', () => {
  test('slugify', () => {
    assert.equal(slugify('Redis Streams'), 'redis-streams');
    assert.equal(slugify('  C++ & C# — the Basics! '), 'c-plus-plus-and-c-sharp-the-basics');
    assert.equal(slugify('Café Déjà Vu'), 'cafe-deja-vu');
  });

  test('frontmatter: scalars, inline lists, block lists, quotes, comments', () => {
    const { has, data, body } = splitFrontmatter([
      '---',
      'title: "Redis: \\"Streams\\" — brief"',
      'topic: a/b/c',
      'stage: brief            # a comment',
      'tags: [backend, "has, comma"]',
      'order: 3',
      'created: 2026-11-14',
      'sources:',
      '  - one',
      '  - two',
      '---',
      'Body text',
    ].join('\n'));
    assert.equal(has, true);
    assert.deepEqual(data, {
      title: 'Redis: "Streams" — brief',
      topic: 'a/b/c',
      stage: 'brief',
      tags: ['backend', 'has, comma'],
      order: 3,
      created: '2026-11-14',
      sources: ['one', 'two'],
    });
    assert.equal(body, 'Body text');
    assert.equal(splitFrontmatter('no frontmatter').has, false);
    assert.equal(splitFrontmatter('---\ntitle: x\nnever closed').has, false);
  });

  test('countWords ignores code, comments, and markup', () => {
    const text = [
      '# A heading here',
      '',
      'Three **bold** words, a [link text](https://example.com) and [[note-name|shown alias]].',
      '',
      '```js',
      'const ignored = "all of this";',
      '```',
      '<!-- hidden comment words -->',
      '| a | b |',
      '|---|---|',
    ].join('\n');
    assert.equal(countWords(text), 3 + 4 + 3 + 2 + 2);
  });

  test('stripFencedCode handles nested and tilde fences', () => {
    const text = 'a\n````md\n```js\nx\n```\n````\nb\n~~~\ny\n~~~\nc';
    assert.deepEqual(stripFencedCode(text).split('\n').filter(Boolean), ['a', 'b', 'c']);
  });

  test('extractWikilinks handles aliases, headings, embeds, tables, and code', () => {
    const links = extractWikilinks('[[a]] [[b|alias]] [[c#Heading|x]] ![[d.png]] | [[e\\|f]] | `[[code]]`\n```\n[[fenced]]\n```\n[[#local]]');
    assert.deepEqual(links, ['a', 'b', 'c', 'd.png', 'e']);
  });

  test('replaceGeneratedRegion only touches the region', () => {
    const text = 'top\n<!-- tutor:generated:start -->\nold\n<!-- tutor:generated:end -->\nbottom\n';
    assert.equal(replaceGeneratedRegion(text, 'new'), 'top\n<!-- tutor:generated:start -->\nnew\n<!-- tutor:generated:end -->\nbottom\n');
    const inserted = replaceGeneratedRegion('intro\n\n## My insights\n- mine\n', 'new');
    assert.equal(inserted, 'intro\n\n<!-- tutor:generated:start -->\nnew\n<!-- tutor:generated:end -->\n\n## My insights\n- mine\n');
  });
});

describe('lesson page analysis', () => {
  const page = (body) => `---\ntitle: T\n---\n${body}`;

  test('multi-line self-closing and paired components are stripped from the prose', () => {
    const result = analyzeLessonPage(page([
      'One two three.',
      '',
      '<FlowAnimation',
      '  steps={[{ label: "a > b", note: `x ${1 + 1} }` }]}',
      '  caption="it\'s fine"',
      '/>',
      '',
      '<Figure caption="A figure">',
      '  <Chart data={[1, 2, 3]} />',
      '  Inner words are not prose.',
      '</Figure>',
      '',
      'Four five.',
      '{/* a comment that is not prose */}',
    ].join('\n')));
    assert.equal(result.words, 5);
    assert.deepEqual(result.elements.map((e) => [e.name, e.root]), [['FlowAnimation', true], ['Figure', true], ['Chart', false]]);
    assert.deepEqual(result.unclosed, []);
  });

  test('component names inside prop strings and code are not components', () => {
    const result = analyzeLessonPage(page([
      '<CodeWalkthrough code={`function App() { return <Button label="x" />; }`} />',
      '',
      'Use `<Fake />` in text.',
      '',
      '```jsx',
      '<AlsoFake />',
      '```',
    ].join('\n')));
    assert.deepEqual(result.elements.map((e) => e.name), ['CodeWalkthrough']);
    assert.equal(result.words, 3);
  });

  test('imports and exports are parsed and removed from the prose', () => {
    const result = analyzeLessonPage(page([
      "import StreamLab from '../../components/topics/redis-streams/StreamLab.astro';",
      'import {',
      '  A,',
      '  B as C,',
      "} from './somewhere.js';",
      'export const data = [',
      '  1,',
      '];',
      '',
      'import data from the server is prose here.',
    ].join('\n')));
    assert.deepEqual(result.imports, [
      { names: ['StreamLab'], from: '../../components/topics/redis-streams/StreamLab.astro' },
      { names: ['A', 'C'], from: './somewhere.js' },
    ]);
    assert.equal(result.words, 8);
  });

  test('reports an unclosed component and what the page ends with', () => {
    assert.deepEqual(analyzeLessonPage(page('<Figure>\nnever closed')).unclosed, ['Figure']);
    assert.equal(analyzeLessonPage(page('Text.\n\n<Resources />\n')).endsWith, 'Resources');
    assert.equal(analyzeLessonPage(page('<Resources />\n\nMore text.')).endsWith, null);
  });
});

describe('recall', () => {
  test('parseCards reads multi-line cards and reports broken ones', () => {
    const { cards, problems } = parseCards([
      '<!-- card: a-01 -->',
      'What is',
      'a stream?',
      '?',
      'An append-only log.',
      'Second answer line.',
      '',
      '<!-- card: a-02 -->',
      'No answer?',
      '?',
      '',
      '<!-- card: a-01 -->',
      'Duplicate?',
      '?',
      'Yes.',
      '## My insights',
      '<!-- card: ignored -->',
      'Below insights?',
      '?',
      'Ignored.',
    ].join('\n'));
    assert.deepEqual(cards, [{ id: 'a-01', question: 'What is\na stream?', answer: 'An append-only log.\nSecond answer line.', line: 1 }]);
    assert.equal(problems.length, 2);
    assert.match(problems[0], /card "a-02" has no answer/);
    assert.match(problems[1], /card id "a-01" is used twice/);
  });

  test('nextBox follows the Leitner rule', () => {
    assert.equal(nextBox(4, 'again'), 1);
    assert.equal(nextBox(4, 'hard'), 4);
    assert.equal(nextBox(4, 'good'), 5);
    assert.equal(nextBox(4, 'easy'), 6);
    assert.equal(nextBox(8, 'good'), 8);
    assert.equal(nextBox(7, 'easy'), 8);
  });
});

describe('small helpers', () => {
  test('dates', () => {
    assert.equal(addDays('2026-12-30', 3), '2027-01-02');
    assert.equal(isIsoDate('2026-11-14'), true);
    assert.equal(isIsoDate('2026-02-30'), false);
    assert.equal(isIsoDate('14/11/2026'), false);
  });

  test('globs', () => {
    assert.ok(globToRegExp('src/**/*.ts').test('src/a/b/c.ts'));
    assert.ok(globToRegExp('src/**/*.ts').test('src/c.ts'));
    assert.ok(!globToRegExp('src/*.ts').test('src/a/c.ts'));
    assert.ok(globToRegExp('**/test?.js').test('x/test1.js'));
    assert.ok(!globToRegExp('*.ts').test('a.tsx'));
  });

  test('depth profiles and pack overrides', () => {
    assert.deepEqual(resolveProfile('standard', null), DEPTH_PROFILES.standard);
    const pack = { id: 'p', stages: { capstone: { enabled: false } }, depth_overrides: { deep: { digests: { min: 2, max: 3 }, repos: 1, recall_cards: 12 } } };
    const profile = resolveProfile('deep', pack);
    assert.deepEqual(profile.digests, [2, 3]);
    assert.deepEqual(profile.repos, [1, 1]);
    assert.equal(profile.recall_cards, 12);
    assert.equal(profile.capstone, false);
    const stages = buildStages('deep', pack, profile);
    assert.equal(stages.find((s) => s.id === 'capstone').status, 'skipped');
    assert.equal(stages.find((s) => s.id === 'intake').status, 'pending');
  });
});
