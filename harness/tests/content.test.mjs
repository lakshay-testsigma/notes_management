import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import {
  addSource, DOMAIN, init, makeRoot, paths, read, readTopic, recallCards, removeRoot, sourceEntry,
  tutor, tutorJson, write, writeNotes,
} from './support/helpers.mjs';

const ID = `${DOMAIN}/messaging/redis-streams`;

describe('insight', () => {
  let root;
  let p;
  before(() => {
    root = makeRoot();
    init(root);
    p = paths(root, ID);
  });
  after(() => removeRoot(root));

  test('appends a dated entry and keeps everything that was already there', () => {
    const before = read(root, p.insights);
    const handWritten = `${before}\n## My own section\n\nSomething I wrote by hand.\n`;
    write(root, p.insights, handWritten);

    const { code, data } = tutorJson(root, ['insight', ID, '--text', 'XAUTOCLAIM skips deleted entries. It returns their ids in a third array.']);
    assert.equal(code, 0);
    assert.equal(data.heading, '2026-11-14 — XAUTOCLAIM skips deleted entries');
    assert.equal(data.section, 'General');

    const after = read(root, p.insights);
    assert.ok(after.startsWith(handWritten.trimEnd()), 'the old content is untouched');
    assert.match(after, /## General\n\n### 2026-11-14 — XAUTOCLAIM skips deleted entries\n\nXAUTOCLAIM skips deleted entries\. It returns their ids in a third array\.\n$/);
  });

  test('--section files the entry under that heading, before the next section', () => {
    tutor(root, ['insight', ID, '--text', 'Trim with MAXLEN ~ to save CPU.', '--section', 'My own section']);
    const text = read(root, p.insights);
    const own = text.indexOf('## My own section');
    const entry = text.indexOf('### 2026-11-14 — Trim with MAXLEN');
    const general = text.indexOf('## General');
    assert.ok(own < entry && entry < general, 'the entry sits inside "My own section"');
    assert.match(text, /Something I wrote by hand\./);
  });

  test('--target adds a backlink under "## My insights" and keeps the note', () => {
    const before = read(root, p.brief);
    const first = tutorJson(root, ['insight', ID, '--text', 'Consumer names must be stable.', '--target', 'brief']);
    assert.equal(first.data.target, p.brief);
    tutor(root, ['insight', ID, '--text', 'IDs are time based.', '--target', '01-brief-redis-streams.md']);
    tutor(root, ['insight', ID, '--text', 'Use final notes too.', '--target', 'final-notes']);

    const after = read(root, p.brief);
    assert.ok(after.startsWith(before.trimEnd()), 'everything above the backlinks is unchanged');
    assert.match(
      after,
      /## My insights\n\n- \[\[my-insights-redis-streams#2026-11-14 — Consumer names must be stable\|2026-11-14 — Consumer names must be stable\]\]\n- \[\[my-insights-redis-streams#2026-11-14 — IDs are time based\|2026-11-14 — IDs are time based\]\]\n$/,
    );
    assert.match(read(root, p.final_notes), /- \[\[my-insights-redis-streams#2026-11-14 — Use final notes too\|/);
  });

  test('the same first words on the same day get a distinct heading', () => {
    tutor(root, ['insight', ID, '--text', 'Same words here.']);
    const second = tutorJson(root, ['insight', ID, '--text', 'Same words here.']);
    assert.equal(second.data.heading, '2026-11-14 — Same words here (2)');
  });

  test('bad arguments are usage errors and change nothing', () => {
    const before = read(root, p.insights);
    assert.equal(tutor(root, ['insight', ID]).code, 2);
    assert.equal(tutor(root, ['insight', ID, '--text', 'x', '--target', 'no-such-note']).code, 2);
    assert.equal(read(root, p.insights), before);
  });
});

describe('map', () => {
  let root;
  let p;
  before(() => {
    root = makeRoot();
    init(root);
    p = paths(root, ID);
  });
  after(() => removeRoot(root));

  test('only the generated region is replaced; text outside the markers survives', () => {
    const original = read(root, p.start_here);
    const edited = original
      .replace('# Redis Streams — start here', '# Redis Streams — start here\n\nMy own intro line.')
      .replace('## My insights\n', '## My insights\n\n- my own bullet\n');
    write(root, p.start_here, edited);

    tutorJson(root, ['skip', ID, 'intake', '--reason', 'testing the map']);
    const { code, data } = tutorJson(root, ['map', ID]);
    assert.equal(code, 0);
    assert.deepEqual(data.written, [p.start_here, p.resources, `vault/${DOMAIN}/${DOMAIN}.md`, 'vault/Home.md']);

    const text = read(root, p.start_here);
    assert.match(text, /My own intro line\./);
    assert.match(text, /## My insights\n\n- my own bullet\n$/);
    assert.match(text, /\| 0 \| intake \| skipped \|/);
    assert.match(text, /1\. \[\[01-brief-redis-streams\|Brief\]\]/);
    assert.match(text, /9\. \[\[09-resources-redis-streams\|Resources\]\]/);
    assert.ok(text.includes(`## Open the lesson\n\nRun \`npm run site:dev\` in the repository root, then open \`/${ID}/\` on the local address it prints.`));
    assert.doesNotMatch(text, /localhost/);
    assert.match(text, new RegExp(`projects/${ID}/capstone/`));
    assert.equal(text.split('<!-- tutor:generated:start -->').length, 2, 'exactly one generated region');
  });

  test('Home and the domain map keep human text too', () => {
    write(root, 'vault/Home.md', read(root, 'vault/Home.md').replace('# Home', '# Home\n\nPinned: read daily.'));
    tutor(root, ['map']);
    const home = read(root, 'vault/Home.md');
    assert.match(home, /Pinned: read daily\./);
    assert.match(home, /\[\[test-engineering\|Test Engineering\]\] — 1 topic/);
  });

  test('a note whose markers were deleted gets the region back above My insights', () => {
    write(root, p.resources, read(root, p.resources).replace(/<!-- tutor:generated:start -->[\s\S]*<!-- tutor:generated:end -->\n/, 'My reading list.\n'));
    addSource(root, ID, sourceEntry('redis-docs', { title: 'Redis docs' }));
    const text = read(root, p.resources);
    assert.match(text, /My reading list\./);
    assert.ok(text.indexOf('Redis docs') < text.indexOf('## My insights'));
    assert.ok(text.indexOf('<!-- tutor:generated:end -->') < text.indexOf('## My insights'));
  });

  test('a deleted or emptied start-here note is recreated from the template', () => {
    for (const damage of [() => write(root, p.start_here, ''), () => fs.rmSync(path.join(root, p.start_here))]) {
      damage();
      tutor(root, ['map', ID]);
      const text = read(root, p.start_here);
      assert.match(text, /^---\ntitle: "Redis Streams — start here"\n/);
      assert.match(text, /## Read in this order/);
      assert.match(text.trimEnd(), /## My insights$/);
    }
  });
});

describe('recall', () => {
  let root;
  let p;
  const at = (now) => ({ now });
  before(() => {
    root = makeRoot();
    init(root);
    p = paths(root, ID);
    writeNotes(root, ID, { cards: 3 });
  });
  after(() => removeRoot(root));

  test('sync registers new cards in box 1, due today', () => {
    const { code, data } = tutorJson(root, ['recall', 'sync', ID]);
    assert.equal(code, 0);
    assert.deepEqual(data.added, ['rs-01', 'rs-02', 'rs-03']);
    assert.equal(data.total, 3);
    const cards = readTopic(root, ID).recall.cards;
    assert.equal(cards['rs-01'].box, 1);
    assert.equal(cards['rs-01'].due, '2026-11-14');
    assert.deepEqual(cards['rs-01'].history, []);
  });

  test('due lists the cards with question and answer', () => {
    const { data } = tutorJson(root, ['recall', 'due', ID]);
    assert.equal(data.total, 3);
    assert.deepEqual(
      { topic: data.cards[0].topic, id: data.cards[0].id, box: data.cards[0].box, question: data.cards[0].question, answer: data.cards[0].answer },
      { topic: ID, id: 'rs-01', box: 1, question: 'Question number 1?', answer: 'Answer number 1.' },
    );
    assert.equal(tutorJson(root, ['recall', 'due']).data.total, 3, 'without a topic it covers all topics');
  });

  test('grade moves the box by the Leitner rule and schedules by the interval table', () => {
    const good = tutorJson(root, ['recall', 'grade', ID, 'rs-01', 'good']).data;
    assert.deepEqual([good.from, good.to, good.due, good.interval_days], [1, 2, '2026-11-17', 3]);

    const easy = tutorJson(root, ['recall', 'grade', ID, 'rs-02', 'easy']).data;
    assert.deepEqual([easy.from, easy.to, easy.due], [1, 3, '2026-11-21']);

    const hard = tutorJson(root, ['recall', 'grade', ID, 'rs-03', 'hard']).data;
    assert.deepEqual([hard.from, hard.to, hard.due], [1, 1, '2026-11-15']);

    const nothing = tutorJson(root, ['recall', 'due', ID]).data;
    assert.equal(nothing.total, 0);
    assert.equal(nothing.next_due, '2026-11-15');

    const later = tutorJson(root, ['recall', 'due', ID], at('2026-11-17T10:00:00Z')).data;
    assert.deepEqual(later.cards.map((c) => c.id), ['rs-03', 'rs-01']);

    const again = tutorJson(root, ['recall', 'grade', ID, 'rs-01', 'again'], at('2026-11-17T10:00:00Z')).data;
    assert.deepEqual([again.from, again.to, again.due], [2, 1, '2026-11-18']);

    const card = readTopic(root, ID).recall.cards['rs-01'];
    assert.equal(card.reviews, 2);
    assert.deepEqual(card.history, [
      { date: '2026-11-14', grade: 'good', from: 1, to: 2 },
      { date: '2026-11-17', grade: 'again', from: 2, to: 1 },
    ]);
  });

  test('the box never goes past 8 (365 days)', () => {
    let last;
    for (let i = 0; i < 6; i++) last = tutorJson(root, ['recall', 'grade', ID, 'rs-02', 'easy']).data;
    assert.equal(last.to, 8);
    assert.equal(last.interval_days, 365);
    assert.equal(last.due, '2027-11-14');
  });

  test('sync drops cards that left the note and keeps the progress of the others', () => {
    const text = read(root, p.recall);
    write(root, p.recall, text.replace(/<!-- card: rs-03 -->[\s\S]*?\n\n/, `${recallCards(1, 'new')}`));
    const { data } = tutorJson(root, ['recall', 'sync', ID]);
    assert.deepEqual(data.added, ['new-01']);
    assert.deepEqual(data.removed, ['rs-03']);
    const cards = readTopic(root, ID).recall.cards;
    assert.equal(cards['rs-02'].box, 8);
    assert.equal(cards['new-01'].box, 1);
  });

  test('malformed cards are reported, bad arguments are usage errors', () => {
    write(root, p.recall, `${read(root, p.recall).replace('## My insights', '<!-- card: broken -->\nNo separator here\n\n## My insights')}`);
    const { data } = tutorJson(root, ['recall', 'sync', ID]);
    assert.match(data.problems[0], /card "broken" has no line containing only "\?"/);

    assert.equal(tutor(root, ['recall', 'grade', ID, 'rs-01', 'perfect']).code, 2);
    assert.equal(tutor(root, ['recall', 'grade', ID, 'nope', 'good']).code, 2);
    assert.equal(tutor(root, ['recall', 'explode']).code, 2);
  });
});
