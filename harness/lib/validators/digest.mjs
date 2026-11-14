// Gate: digest. An index plus one note per planned digest, each citing its source id.

import path from 'node:path';
import { listFiles } from '../io.mjs';
import { extractWikilinks } from '../markdown.mjs';
import { CLI } from '../root.mjs';
import { failure, stageFailure } from './context.mjs';
import { checkNote } from './note.mjs';

/** How many digests this topic needs: the plan's number, else the depth minimum. */
export function digestTarget(ctx) {
  const planned = ctx.topic.plan?.digest_targets;
  return Number.isInteger(planned) && planned > 0 ? planned : ctx.profile.digests[0];
}

export function digestGate(ctx) {
  const { topic, paths } = ctx;
  const failures = [];
  const indexName = path.basename(paths.digests_index);
  const suffix = `-${topic.slug}.md`;

  const index = checkNote(ctx, paths.digests_index, { stage: 'digest' });
  failures.push(...index.failures);

  const notes = listFiles(ctx.abs(paths.digests_dir)).filter((name) => name.endsWith('.md') && name !== indexName);
  const target = digestTarget(ctx);
  if (notes.length < target) {
    failures.push(stageFailure(paths.digests_dir, `has ${notes.length} digest notes, the plan needs ${target}`, `write one note per digested source, named \`<source-id>${suffix}\``));
  }

  const linked = new Set(index.note ? extractWikilinks(index.note.body) : []);
  for (const name of notes) {
    const relative = `${paths.digests_dir}/${name}`;
    const result = checkNote(ctx, relative, { stage: 'digest', requireInsights: false });
    failures.push(...result.failures);

    if (!name.endsWith(suffix)) {
      failures.push(failure(relative, 'file name does not end with the topic slug', `rename it to \`<source-id>${suffix}\` so the note name is unique in the vault`));
    } else if (result.note) {
      const sourceId = name.slice(0, -suffix.length);
      const cited = Array.isArray(result.note.data.sources) ? result.note.data.sources.map(String) : [];
      if (!ctx.sourceIds.has(sourceId)) {
        failures.push(failure(relative, `file name starts with "${sourceId}", which is not a source id in sources.json`, `name the file after its source id (see \`${CLI} sources ${topic.id} list\`)`));
      } else if (!cited.includes(sourceId)) {
        failures.push(failure(relative, 'does not cite its source id', `add \`sources: [${sourceId}]\` to the frontmatter`));
      }
    }

    if (index.note && !linked.has(name.slice(0, -3))) {
      failures.push(failure(paths.digests_index, `does not link to ${name}`, `add \`[[${name.slice(0, -3)}|<title>]]\` to the list of digests`));
    }
  }
  return failures;
}
