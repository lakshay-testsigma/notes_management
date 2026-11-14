import fs from 'node:fs';
import path from 'node:path';
import { filesUnder } from './freshness.mjs';

export const READER_STAGES = { digest:'04-digests', 'repo-intel':'05-repo-intel' };
export function readerFiles(root,topic,stage) {
  const dir=READER_STAGES[stage];
  return filesUnder(root,`${topic.paths.vault}/${dir}`).filter(f=>f.endsWith('.md')&&!path.basename(f).startsWith('00-')).map(f=>path.relative(topic.paths.vault,f).split(path.sep).join('/'));
}
export function indexOrder(root,topic,stage) {
  const dir=READER_STAGES[stage], name=stage==='digest'?'digests':'repo-intel';
  const file=path.join(root,topic.paths.vault,dir,`00-${name}-${topic.slug}.md`);
  const text=fs.existsSync(file)?fs.readFileSync(file,'utf8').split(/^## My insights\s*$/m)[0]:'';
  const files=readerFiles(root,topic,stage);
  const result=[];
  for(const m of text.matchAll(/\[\[([^\]|#]+)(?:[^\]]*)\]\]/g)) {
    const target=m[1].replace(/\.md$/,'');
    const matches=files.filter(f=>f.replace(/\.md$/,'')===target||target.replace(/^vault\//,'')===`${topic.paths.vault.replace(/^vault\//,'')}/${f.replace(/\.md$/,'')}`||(!target.includes('/')&&path.basename(f,'.md')===target));
    if(matches.length===1&&!result.includes(matches[0]))result.push(matches[0]);
  }
  return result;
}
export function readingProblems(root,topic,stage) {
  const files=readerFiles(root,topic,stage), order=topic.reader_order?.[stage];
  if(!files.length)return [];
  if(!Array.isArray(order))return ['missing reader sequence; run tutor order <topic> import-indexes'];
  const problems=[];
  if(new Set(order).size!==order.length)problems.push('reader sequence contains duplicates');
  for(const f of files)if(!order.includes(f))problems.push(`reader sequence omits ${f}`);
  for(const f of order)if(!files.includes(f))problems.push(`reader sequence names absent or out-of-scope note ${f}`);
  if(JSON.stringify(indexOrder(root,topic,stage))!==JSON.stringify(order))problems.push('authored index order differs from reader sequence; curate the index, then run tutor order <topic> import-indexes');
  return problems;
}
