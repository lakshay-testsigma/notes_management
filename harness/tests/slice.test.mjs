import assert from 'node:assert/strict';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import { makeRoot, removeRoot, tutor, tutorJson, write } from './support/helpers.mjs';

/** A file of exactly `tokens` estimated tokens (4 characters per token). */
function fileOf(tokens) {
  return 'abc\n'.repeat(tokens);
}

describe('slice and budget', () => {
  let root;
  let repo;
  before(() => {
    root = makeRoot();
    repo = path.join(root, 'repo');
    // small top-level directories
    write(root, 'repo/README.md', fileOf(500));
    write(root, 'repo/docs/guide.md', fileOf(1000));
    write(root, 'repo/scripts/build.sh', fileOf(200));
    // one directory far over the budget: must be split along its sub-directories
    write(root, 'repo/src/core/a.ts', fileOf(4000));
    write(root, 'repo/src/core/b.ts', fileOf(4000));
    write(root, 'repo/src/net/c.ts', fileOf(3000));
    write(root, 'repo/src/util/d.ts', fileOf(1000));
    write(root, 'repo/src/util/e.ts', fileOf(1000));
    write(root, 'repo/src/index.ts', fileOf(500));
    // things that must be skipped
    write(root, 'repo/node_modules/dep/index.js', fileOf(9000));
    write(root, 'repo/.git/HEAD', 'ref');
    write(root, 'repo/dist/bundle.js', fileOf(9000));
    write(root, 'repo/vendor/lib.go', fileOf(9000));
    write(root, 'repo/package-lock.json', fileOf(9000));
    write(root, 'repo/assets/logo.png', 'PNG');
    write(root, 'repo/assets/blob.dat', 'x');
    write(root, 'repo/assets/raw', 'ab\u0000cd');
    write(root, 'repo/big.txt', 'x'.repeat(401 * 1024));
  });
  after(() => removeRoot(root));

  test('every slice fits the budget and every readable file is in exactly one slice', () => {
    const { code, data } = tutorJson(root, ['slice', repo, '--budget', '5000']);
    assert.equal(code, 0);

    const files = data.slices.flatMap((s) => s.files).sort();
    assert.deepEqual(files, [
      'README.md', 'docs/guide.md', 'scripts/build.sh',
      'src/core/a.ts', 'src/core/b.ts', 'src/index.ts', 'src/net/c.ts', 'src/util/d.ts', 'src/util/e.ts',
    ]);
    for (const slice of data.slices) {
      assert.ok(slice.tokens <= 5000, `${slice.id} has ${slice.tokens} tokens`);
      assert.ok(slice.files.length > 0);
      assert.ok(!slice.oversized);
    }
    assert.equal(new Set(data.slices.map((s) => s.id)).size, data.slices.length, 'slice ids are unique');
    assert.deepEqual(data.totals, { files: 9, tokens: 15200, slices: data.slices.length, skipped: data.totals.skipped, oversized_slices: 0 });
    assert.equal(data.slices.reduce((sum, s) => sum + s.tokens, 0), 15200);
  });

  test('top-level directories are separate slices; an oversized one is split by sub-directory', () => {
    const { data } = tutorJson(root, ['slice', repo, '--budget', '5000']);
    const byId = Object.fromEntries(data.slices.map((s) => [s.id, s]));

    assert.deepEqual(byId.docs.files, ['docs/guide.md']);
    assert.deepEqual(byId.scripts.files, ['scripts/build.sh']);
    assert.deepEqual(byId['root-files'].files, ['README.md']);

    const src = data.slices.filter((s) => s.files.some((f) => f.startsWith('src/')));
    assert.ok(src.length >= 3, 'src (14,500 tokens) is cut into several slices');
    assert.ok(src.every((s) => s.files.every((f) => f.startsWith('src/'))), 'src slices only hold src files');
    // src/core is itself over the budget, so its two files land in different slices
    const sliceOf = (file) => data.slices.find((s) => s.files.includes(file)).id;
    assert.notEqual(sliceOf('src/core/a.ts'), sliceOf('src/core/b.ts'));
    // small neighbours inside the split directory are packed together
    assert.equal(sliceOf('src/util/d.ts'), sliceOf('src/util/e.ts'));
  });

  test('skips .git, node_modules, dist, vendor, lockfiles, images, binaries, and large files', () => {
    const { data } = tutorJson(root, ['slice', repo]);
    assert.equal(data.budget, 60000);
    assert.equal(data.slices.length, 4, 'docs, scripts, src, root files at the default budget');
    assert.equal(data.skipped['directory node_modules'], 1);
    assert.equal(data.skipped['directory .git'], 1);
    assert.equal(data.skipped['directory dist'], 1);
    assert.equal(data.skipped['directory vendor'], 1);
    assert.equal(data.skipped.lockfile, 1);
    assert.equal(data.skipped.image, 1);
    assert.equal(data.skipped.binary, 2);
    assert.equal(data.skipped['larger than 400KB'], 1);
  });

  test('a single file over the budget is its own slice, flagged oversized', () => {
    const { data } = tutorJson(root, ['slice', repo, '--budget', '3500']);
    const big = data.slices.filter((s) => s.oversized);
    assert.deepEqual(big.map((s) => s.files), [['src/core/a.ts'], ['src/core/b.ts']]);
    assert.equal(data.totals.oversized_slices, 2);
  });

  test('--include filters by glob; --pack joins small top-level groups', () => {
    const ts = tutorJson(root, ['slice', repo, '--include', '*.ts']).data;
    assert.deepEqual(ts.slices.map((s) => s.id), ['src']);
    assert.equal(ts.totals.files, 6);

    const deep = tutorJson(root, ['slice', repo, '--include', 'src/**/*.ts,docs/**']).data;
    assert.deepEqual(deep.slices.flatMap((s) => s.files).sort(), ['docs/guide.md', 'src/core/a.ts', 'src/core/b.ts', 'src/index.ts', 'src/net/c.ts', 'src/util/d.ts', 'src/util/e.ts']);

    const packed = tutorJson(root, ['slice', repo, '--pack']).data;
    assert.equal(packed.slices.length, 1);
    assert.equal(packed.slices[0].tokens, 15200);
  });

  test('the human output ends with a totals line', () => {
    const { stdout } = tutor(root, ['slice', repo, '--budget', '5000']);
    assert.match(stdout, /Total: 9 files, ~15,200 tokens, \d+ slices \(budget 5,000\)\./);
    assert.match(stdout, /Skipped: /);
  });

  test('budget estimates each file and flags a total over 60,000', () => {
    const small = tutorJson(root, ['budget', path.join(repo, 'README.md'), path.join(repo, 'docs/guide.md')]).data;
    assert.deepEqual(small.files.map((f) => f.tokens), [500, 1000]);
    assert.equal(small.total, 1500);
    assert.equal(small.over_budget, false);

    write(root, 'huge.md', fileOf(60001));
    const over = tutorJson(root, ['budget', path.join(root, 'huge.md')]);
    assert.equal(over.code, 0);
    assert.equal(over.data.over_budget, true);
    assert.match(tutor(root, ['budget', path.join(root, 'huge.md')]).stdout, /OVER BUDGET/);
  });

  test('bad arguments are usage errors', () => {
    assert.equal(tutor(root, ['slice', path.join(root, 'missing')]).code, 2);
    assert.equal(tutor(root, ['slice', repo, '--budget', 'lots']).code, 2);
    assert.equal(tutor(root, ['budget', path.join(root, 'missing.md')]).code, 2);
    assert.equal(tutor(root, ['budget']).code, 2);
  });
});
