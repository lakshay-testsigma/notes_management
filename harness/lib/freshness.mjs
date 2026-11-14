// Content receipts deliberately exclude logs, progress, generated maps and learner
// insight tails. Rechecking a stage never regenerates its authored artifacts.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

export const RECEIPT_VERSION = 2;
const ignored = new Set(['node_modules', 'dist', '.git', '.cache', 'coverage', '.astro', '.venv', '__pycache__']);
export const hash = (value) => createHash('sha256').update(value).digest('hex');
export function filesUnder(root, relative) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) return [];
  if (!fs.statSync(file).isDirectory()) return [relative];
  return fs.readdirSync(file, { withFileTypes: true }).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(e =>
    ignored.has(e.name) || e.name === '.env' || e.name.endsWith('.tsbuildinfo') ? [] : filesUnder(root, path.join(relative, e.name)));
}
function generatedText(file, bytes, includeInsights) {
  if (includeInsights || !file.endsWith('.md')) return bytes;
  return bytes.toString('utf8').split(/^## My insights\s*$/m)[0];
}
export function stageDigest(root, topic, stage) {
  const v = topic.paths.vault, p = topic.paths.projects, l = topic.paths.lessons, slug = topic.slug;
  const locations = {
    intake: [], research: [`${topic.paths.state}/sources.json`],
    brief: [`${v}/01-brief-${slug}.md`], digest: [`${v}/04-digests`],
    'repo-intel': [`${v}/05-repo-intel`], lesson: [l, `${v}/02-lesson-${slug}.md`],
    'mini-projects': [`${v}/03-mini-projects-${slug}.md`, ...filesUnder(root,p).filter(f=>!f.startsWith(`${p}/capstone/`))],
    capstone: [`${p}/capstone`, `${v}/06-capstone-${slug}.md`],
    notes: [`${v}/07-final-notes-${slug}.md`, `${v}/08-recall-${slug}.md`],
  };
  const selected = stage === 'finalize'
    ? [...filesUnder(root,'vault').filter(f=> (f.split(path.sep).length > 3 || /^vault[/\\]_(tech|concepts)[/\\]/.test(f)) && !/^0[09]-/.test(path.basename(f))),
       ...filesUnder(root,'site/src'), ...filesUnder(root,'site/scripts'), 'site/astro.config.mjs', ...filesUnder(root,p), 'site/package.json','site/package-lock.json','site/components.manifest.json','site/COMPONENTS.md',
       ...filesUnder(root,'state/topics').filter(f=>path.basename(f)==='sources.json')]
    : (locations[stage] ?? []).flatMap(f=>filesUnder(root,f));
  const content = [...new Set([...selected, ...filesUnder(root,'harness/lib'), `harness/domains/${topic.domain}/pack.json`])].sort().map(f => {
    try { return [f,hash(generatedText(f,fs.readFileSync(path.join(root,f)),stage==='finalize'))]; }
    catch { return [f,'missing']; }
  });
  let sources = null;
  if (stage !== 'intake') {
    try { sources=JSON.parse(fs.readFileSync(path.join(root,topic.paths.state,'sources.json'),'utf8')); } catch {}
  }
  const siteInputs = stage === 'finalize' ? filesUnder(root,'state/topics').filter(f=>path.basename(f)==='topic.json').map(f=>{
    const t=JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
    return {id:t.id,title:t.title,depth:t.depth,plan:t.plan,reader_order:t.reader_order,
      stages:t.stages.filter(s=>!['intake','finalize'].includes(s.id)).map(s=>[s.id,s.status])};
  }) : undefined;
  return hash(JSON.stringify({ version:RECEIPT_VERSION, siteInputs, stage, run_id:topic.quality?.run_id, plan:topic.plan, profile:topic.profile,
    reader_order: stage==='finalize' ? topic.reader_order : topic.reader_order?.[stage], sources, content }));
}
export function markFreshness(root, topic) {
  for (const stage of topic.stages) {
    stage.fresh = stage.status !== 'done' || Boolean(stage.validation?.version === RECEIPT_VERSION && stage.validation.fingerprint === stageDigest(root,topic,stage.id) && !stage.validation.forced &&
      (!(stage.id in (topic.quality?.executions??{})) || topic.quality.executions[stage.id].ok) &&
      (stage.id !== 'finalize' || ['content','projects'].every(scope=>topic.quality?.reviews?.[scope]?.verdict==='pass')));
  }
  return topic;
}
