import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import {
  addSource, addSources, DOMAIN, init, lessonPage, makeRoot, paths, planFor, read, removeRoot, setPlan,
  sourceEntry, tutor, tutorJson, write, writeBrief, writeLessons,
} from './support/helpers.mjs';

const ID = `${DOMAIN}/messaging/redis-streams`;
const LESSONS = `site/src/content/lessons/${ID}`;

function validate(root, stage) {
  return tutorJson(root, ['validate', ID, stage]);
}

function problemsOf(result, file) {
  return result.data.failures.filter((f) => f.path.endsWith(file)).map((f) => f.problem);
}

describe('validate: lesson pages (§12)', () => {
  let root;
  before(() => {
    root = makeRoot();
    init(root);
    setPlan(root, ID, planFor(5));
    writeLessons(root, ID, 5);
  });
  after(() => removeRoot(root));

  /** Replace page 02 and validate the lesson stage. */
  function withPage(options, name = '02-page-2.mdx') {
    write(root, `${LESSONS}/${name}`, typeof options === 'string' ? options : lessonPage({ order: 2, ...options }));
    const result = validate(root, 'lesson');
    return { result, problems: problemsOf(result, name) };
  }

  test('good pages pass', () => {
    const result = validate(root, 'lesson');
    assert.equal(result.code, 0, JSON.stringify(result.data.failures));
  });

  test('code blocks and components are not counted as prose', () => {
    const { result } = withPage({ words: 255 });
    assert.equal(result.code, 0, JSON.stringify(result.data.failures));
  });

  test('too many words fails', () => {
    const { result, problems } = withPage({ words: 300 });
    assert.equal(result.code, 1);
    assert.deepEqual(problems, ['has 300 words of prose, the maximum is 260']);
  });

  test('too few words fails', () => {
    const { problems } = withPage({ words: 60 });
    assert.deepEqual(problems, ['has 60 words of prose, the minimum is 110']);
  });

  test('a blockquote fails', () => {
    const { result, problems } = withPage({ extra: '> Remember this important thing.' });
    assert.equal(result.code, 1);
    assert.equal(problems.length, 1);
    assert.match(problems[0], /has a blockquote/);
    assert.match(result.data.failures[0].fix, /\*\*Note\.\*\*/);
  });

  test('asides, details, and callout markup fail', () => {
    assert.match(withPage({ extra: ':::note\nBe careful.\n:::' }).problems.join('|'), /`:::` aside/);
    assert.match(withPage({ extra: '<details><summary>More</summary>Hidden</details>' }).problems.join('|'), /<details> element/);
    assert.match(withPage({ extra: '<aside>Side note</aside>' }).problems.join('|'), /<aside> element/);
    assert.match(withPage({ extra: '<div class="callout">Hey</div>' }).problems.join('|'), /card or callout markup/);
    assert.match(withPage({ extra: '<Callout>Hey</Callout>' }).problems.join('|'), /<Callout>, which is card or callout markup/);
  });

  test('a missing activity fails', () => {
    const { result, problems } = withPage({ activity: false });
    assert.equal(result.code, 1);
    assert.deepEqual(problems, ['has no activity component']);
  });

  test('a missing visual fails', () => {
    const { problems } = withPage({ visual: false });
    assert.deepEqual(problems, ['has no visual component']);
  });

  test('importing a shared component fails, and so does a client: directive on one', () => {
    const imported = withPage({ imports: "import Quiz from '../../../../components/Quiz.astro';" });
    assert.match(imported.problems.join('|'), /imports the shared component Quiz/);

    const directive = withPage({ extra: '<Chart client:load data={[1, 2]} />' });
    assert.match(directive.problems.join('|'), /<Chart> has a `client:` directive/);
  });

  test('an unknown component fails', () => {
    const { problems } = withPage({ extra: '<Sparkle size={3} />' });
    assert.match(problems.join('|'), /<Sparkle>, which is not a shared lesson component/);
  });

  test('a topic-specific imported component counts as a visual', () => {
    const { result } = withPage({
      visual: false,
      imports: "import StreamLab from '../../../../components/topics/redis-streams/StreamLab.astro';",
      extra: '<StreamLab client:load\n  entries={[{ id: 1 }]}\n/>',
    });
    assert.equal(result.code, 0, JSON.stringify(result.data.failures));
  });

  test('frontmatter must be complete and match the file number', () => {
    const noOrder = withPage(lessonPage({ order: 2 }).replace('order: 2\n', ''));
    assert.match(noOrder.problems.join('|'), /`order` is not a whole number/);

    const wrongOrder = withPage(lessonPage({ order: 4 }));
    assert.match(wrongOrder.problems.join('|'), /`order` is 4 but the file name starts with 02/);

    const noDescription = withPage(lessonPage({ order: 2 }).replace(/description: .*\n/, ''));
    assert.match(noDescription.problems.join('|'), /no `description`/);
  });

  test('the final page must end with <Resources />', () => {
    write(root, `${LESSONS}/02-page-2.mdx`, lessonPage({ order: 2 }));
    write(root, `${LESSONS}/05-page-5.mdx`, lessonPage({ order: 5, last: false }));
    const result = validate(root, 'lesson');
    assert.deepEqual(problemsOf(result, '05-page-5.mdx'), ['is the final lesson page but does not end with `<Resources />`']);
    write(root, `${LESSONS}/05-page-5.mdx`, lessonPage({ order: 5, last: true }));
    assert.equal(validate(root, 'lesson').code, 0);
  });

  test('the page count must fit the depth, and the topic needs an animated flow', () => {
    write(root, `${LESSONS}/06-page-6.mdx`, lessonPage({ order: 6 }));
    write(root, `${LESSONS}/07-page-7.mdx`, lessonPage({ order: 7 }));
    write(root, `${LESSONS}/08-page-8.mdx`, lessonPage({ order: 8, last: true }));
    const tooMany = validate(root, 'lesson');
    assert.match(tooMany.data.failures.map((f) => f.problem).join('|'), /has 8 lesson pages, depth "standard" needs 5–7/);
  });

  test('the component kinds come from site/components.manifest.json when it exists', () => {
    const other = makeRoot();
    try {
      init(other);
      writeLessons(other, ID, 5);
      write(other, 'site/components.manifest.json', JSON.stringify({ visual: ['FlowAnimation', 'Sparkle'], activity: ['Puzzle'], utility: ['Resources'] }));
      const result = validate(other, 'lesson');
      assert.equal(result.code, 1);
      assert.match(result.data.failures.map((f) => f.problem).join('|'), /uses <Quiz>, which is not a shared lesson component/);
      assert.match(result.data.failures.map((f) => f.problem).join('|'), /has no activity component/);
    } finally {
      removeRoot(other);
    }
  });
});

describe('validate: sources gate (§9)', () => {
  let root;
  before(() => {
    root = makeRoot();
    init(root);
  });
  after(() => removeRoot(root));

  test('sources add rejects an entry with missing or malformed fields', () => {
    const bad = sourceEntry('bad-one', { tier: 'C', url: 'ftp://example.com', verified_at: '14/11/2026', type: 'tweet' });
    delete bad.why_trusted;
    const { code, data } = addSource(root, ID, bad);
    assert.equal(code, 1);
    const text = data.failures.map((f) => f.problem).join('|');
    assert.match(text, /tier must be "A" or "B"/);
    assert.match(text, /url must be an http\(s\) URL/);
    assert.match(text, /verified_at must be a YYYY-MM-DD date/);
    assert.match(text, /type must be one of/);
    assert.match(text, /why_trusted is missing/);
    assert.equal(tutorJson(root, ['sources', ID, 'list']).data.count, 0);
  });

  test('sources add rejects evidence without any value', () => {
    const empty = sourceEntry('no-proof', { evidence: { stars: null, last_commit: null, citations: null, venue: null, publisher: null, used_by: [] } });
    const { code, data } = addSource(root, ID, empty);
    assert.equal(code, 1);
    assert.match(data.failures[0].problem, /evidence has no value at all/);
  });

  test('sources add appends a valid entry and rejects duplicates by id or url', () => {
    const first = addSource(root, ID, sourceEntry('source-1'));
    assert.equal(first.code, 0);
    assert.equal(first.data.total, 1);

    const sameId = addSource(root, ID, sourceEntry('source-1', { url: 'https://example.com/other' }));
    assert.equal(sameId.code, 1);
    assert.match(sameId.data.failures[0].problem, /id is already in sources\.json/);

    const sameUrl = addSource(root, ID, sourceEntry('source-9', { url: 'https://example.com/source-1/' }));
    assert.equal(sameUrl.code, 1);
    assert.match(sameUrl.data.failures[0].problem, /url is already in sources\.json/);
    assert.equal(tutorJson(root, ['sources', ID, 'list']).data.count, 1);
  });

  test('the research gate needs enough sources and a tier A source', () => {
    const tooFew = validate(root, 'research');
    assert.equal(tooFew.code, 1);
    assert.match(tooFew.data.failures[0].problem, /has 1 sources, depth "standard" needs 5–12/);

    for (let i = 2; i <= 5; i++) addSource(root, ID, sourceEntry(`source-${i}`, { tier: 'B' }));
    assert.equal(validate(root, 'research').code, 0);
  });

  test('the research gate fails without a tier A source, and on hand-written bad entries', () => {
    const p = paths(root, ID);
    const entries = [1, 2, 3, 4, 5].map((i) => sourceEntry(`b-${i}`, { tier: 'B' }));
    write(root, p.sources_json, JSON.stringify(entries));
    tutor(root, ['map', ID]);
    const noTierA = validate(root, 'research');
    assert.deepEqual(noTierA.data.failures.map((f) => f.problem), ['has no tier A source']);

    entries[0].tier = 'A';
    delete entries[1].verified_via;
    write(root, p.sources_json, JSON.stringify(entries));
    tutor(root, ['map', ID]);
    assert.deepEqual(validate(root, 'research').data.failures.map((f) => f.problem), ['entry "b-2": verified_via must start with an http(s) URL']);

    write(root, p.sources_json, '{ not json');
    assert.match(validate(root, 'research').data.failures[0].problem, /is not valid JSON/);
  });

  test('the resources note lists sources by type with tier A first', () => {
    const other = makeRoot();
    try {
      init(other);
      addSource(other, ID, sourceEntry('zeta-docs', { tier: 'B', title: 'Zeta docs' }));
      addSource(other, ID, sourceEntry('alpha-docs', { tier: 'A', title: 'Alpha docs' }));
      addSource(other, ID, sourceEntry('the-paper', { tier: 'A', type: 'paper', title: 'The paper' }));
      const text = read(other, paths(other, ID).resources);
      assert.ok(text.indexOf('## Official documentation') < text.indexOf('## Papers'));
      assert.ok(text.indexOf('Alpha docs') < text.indexOf('Zeta docs'));
      assert.match(text, /Why it is trusted: It is the official documentation/);
    } finally {
      removeRoot(other);
    }
  });
});

describe('validate: vault notes (§11)', () => {
  let root;
  before(() => {
    root = makeRoot();
    init(root);
    addSources(root, ID, 5);
  });
  after(() => removeRoot(root));

  test('the brief gate checks placeholder, words, sections, links, and frontmatter', () => {
    const scaffold = validate(root, 'brief');
    assert.equal(scaffold.code, 1);
    assert.match(scaffold.data.failures.map((f) => f.problem).join('|'), /still contains the scaffold placeholder/);

    writeBrief(root, ID);
    assert.equal(validate(root, 'brief').code, 0);

    writeBrief(root, ID, { words: 450 });
    assert.match(validate(root, 'brief').data.failures[0].problem, /words, the maximum is 400/);

    const p = paths(root, ID);
    writeBrief(root, ID);
    write(root, p.brief, read(root, p.brief).replace('## The problem it solves', '## Background'));
    assert.deepEqual(validate(root, 'brief').data.failures.map((f) => f.problem), ['section "## The problem it solves" is missing']);

    write(root, p.brief, read(root, p.brief).replace('## Background', '## Why it exists'));
    assert.equal(validate(root, 'brief').code, 0);
  });

  test('links must resolve, by file name', () => {
    const p = paths(root, ID);
    writeBrief(root, ID);
    const good = read(root, p.brief);

    write(root, p.brief, good.replace('## My insights', 'See [[Consumer Group]] and [[01-BRIEF-redis-streams#What it is|me]].\n\n## My insights'));
    const broken = validate(root, 'brief');
    const problems = broken.data.failures.map((f) => f.problem);
    assert.ok(problems.includes('link [[Consumer Group]] does not resolve to a file in the vault'));
    assert.ok(problems.includes('link [[01-BRIEF-redis-streams]] does not resolve to a file in the vault'));
    assert.match(broken.data.failures.find((f) => f.problem.includes('01-BRIEF')).fix, /\[\[01-brief-redis-streams\]\]/);

    const created = tutorJson(root, ['concept', 'Consumer Group']);
    assert.equal(created.data.created, true);
    assert.equal(created.data.path, 'vault/_concepts/Consumer Group.md');
    write(root, p.brief, good.replace('## My insights', `See [[Consumer Group]], [[Consumer Group|groups]], [[${ID}/01-brief-redis-streams#What it is]] and \`[[not a link]]\`.\n\n## My insights`));
    assert.equal(validate(root, 'brief').code, 0, JSON.stringify(validate(root, 'brief').data.failures));
  });

  test('frontmatter and the My insights rule are enforced', () => {
    const p = paths(root, ID);
    writeBrief(root, ID);
    const good = read(root, p.brief);

    write(root, p.brief, good.replace('stage: brief', 'stage: summary').replace(`topic: ${ID}`, 'topic: wrong/id/here'));
    const problems = validate(root, 'brief').data.failures.map((f) => f.problem).join('|');
    assert.match(problems, /frontmatter `stage` is "summary"/);
    assert.match(problems, /frontmatter `topic` is "wrong\/id\/here"/);

    write(root, p.brief, good.replace(/^---[\s\S]*?---\n/, ''));
    assert.match(validate(root, 'brief').data.failures.map((f) => f.problem).join('|'), /has no frontmatter/);

    write(root, p.brief, `${good}\n## Generated later\n\nmore text\n`);
    assert.match(validate(root, 'brief').data.failures.map((f) => f.problem).join('|'), /has a heading below `## My insights`/);

    write(root, p.brief, good.replace('\n## My insights\n', '\n'));
    assert.match(validate(root, 'brief').data.failures.map((f) => f.problem).join('|'), /has no `## My insights` heading/);

    write(root, p.brief, good.replace('sources: [source-1]', 'sources: [made-up-id]'));
    assert.match(validate(root, 'brief').data.failures.map((f) => f.problem).join('|'), /names "made-up-id", which is not in sources\.json/);
  });

  test('concept never overwrites and reuses an existing note name', () => {
    write(root, 'vault/_concepts/Consumer Group.md', 'my text\n');
    const again = tutorJson(root, ['concept', 'consumer group']);
    assert.equal(again.data.created, false);
    assert.equal(again.data.path, 'vault/_concepts/Consumer Group.md');
    assert.equal(read(root, 'vault/_concepts/Consumer Group.md'), 'my text\n');

    const tech = tutorJson(root, ['concept', 'Redis', '--tech']);
    assert.equal(tech.data.path, 'vault/_tech/Redis.md');
    assert.match(read(root, 'vault/_tech/Redis.md'), /\nstage: tech\n/);
  });
});
