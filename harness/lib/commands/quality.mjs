import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { resolveTopic, saveTopic, appendLog, topicPaths } from '../topic-store.mjs';
import { readJsonInput, readInputFile, saveAndRefresh, requireArg } from './shared.mjs';
import { stringFlag } from '../args.mjs';
import { isoNow } from '../clock.mjs';
import { UsageError, ValidationError } from '../errors.mjs';
import { filesUnder, stageDigest, RECEIPT_VERSION } from '../freshness.mjs';
import { READER_STAGES, indexOrder, readingProblems } from '../reading-order.mjs';
import { executeChecks, projectChecks, sourceChecks, REVIEW_CHECKS } from '../quality.mjs';
import { withLock, writeTextAtomic } from '../io.mjs';
import { lockDir } from '../root.mjs';
import { isOmitted } from '../stages.mjs';

export function orderCommand({root,args,flags}) {
  const topic=resolveTopic(root,requireArg(args[0],'<topic>','order <topic> import-indexes|set --file <json>'));
  if(args[1]==='import-indexes')topic.reader_order=Object.fromEntries(Object.keys(READER_STAGES).map(s=>[s,indexOrder(root,topic,s)]));
  else if(args[1]==='set')topic.reader_order=readJsonInput(requireArg(stringFlag(flags,'file'),'--file','order'),'--file');
  else return {data:{topic:topic.id,reader_order:topic.reader_order??{}},text:JSON.stringify(topic.reader_order??{},null,2)};
  const problems=Object.keys(READER_STAGES).flatMap(s=>readingProblems(root,topic,s));
  if(problems.length)throw new ValidationError(problems.join('\n'));
  appendLog(topic,'reader-order','Imported explicit authored child-note sequence');saveAndRefresh(root,topic);
  return {data:{topic:topic.id,reader_order:topic.reader_order},text:'Reader sequence saved; authored indexes and navigation share this sequence.'};
}
export function writeNoteCommand({root,args,flags}) {
  const topic=resolveTopic(root,requireArg(args[0],'<topic>','write-note <topic> <note> --file <draft>'));
  const target=path.resolve(root,requireArg(args[1],'<note>','write-note'));
  const p=topicPaths(topic), base=path.resolve(root,p.vault_dir);
  if(!target.startsWith(base+path.sep)||target===path.resolve(root,p.insights)||!target.endsWith('.md'))throw new UsageError('Generated writes must target a Markdown stage note inside this topic, never my-insights.');
  const draft=readInputFile(requireArg(stringFlag(flags,'file'),'--file','write-note'),'--file');
  const old=fs.existsSync(target)?fs.readFileSync(target,'utf8'):'';
  const marker=/^## My insights\s*$/m;
  const m=marker.exec(old), nextMarker=marker.exec(draft);
  if(old&&!m)throw new ValidationError('Existing note has no protected insights boundary; inspect it instead of overwriting it.');
  const suffix=m?old.slice(m.index):'## My insights\n';
  const prefix=nextMarker?draft.slice(0,nextMarker.index):draft.replace(/\s*$/,'')+'\n\n';
  writeTextAtomic(target,prefix+suffix);
  appendLog(topic,'write-note',path.relative(root,target));saveAndRefresh(root,topic);
  return {data:{topic:topic.id,path:path.relative(root,target),insights_preserved:true},text:'Generated region written; existing insights preserved byte-for-byte.'};
}
export function rerunCommand({root,args}) {
  const topic=resolveTopic(root,requireArg(args[0],'<topic>','rerun <topic>'));
  for(const s of topic.stages)if(!isOmitted(s)) {
    s.history=[...(s.history??[]),{at:isoNow(),status:s.status,validation:s.validation,units:s.units,note:s.note}].slice(-10);
    s.status='pending';s.units=[];s.note='';s.continue_after_failure=false;delete s.validation;s.fresh=true;
  }
  const protectedInsights={};
  for(const file of filesUnder(root,'vault').filter(f=>f.endsWith('.md'))) {
    const text=fs.readFileSync(path.join(root,file),'utf8'),m=/^## My insights\s*$/m.exec(text);
    if(path.basename(file).startsWith('my-insights-'))protectedInsights[file]=text;
    else if(m)protectedInsights[file]=text.slice(m.index);
  }
  topic.quality={...(topic.quality??{}),protected_insights:protectedInsights,run_id:randomUUID(),run_started_at:isoNow()};
  appendLog(topic,'rerun','Reopened required checkpoints; artifacts, insights and recall history preserved');saveAndRefresh(root,topic);
  return {data:{topic:topic.id,run_id:topic.quality.run_id},text:'Workflow reopened without regenerating or removing existing content.'};
}
export function checkCommand({root,args}) {
  const topic=resolveTopic(root,requireArg(args[0],'<topic>','check <topic> research|mini-projects|capstone|finalize'));
  const stage=args[1];
  if(!['research','mini-projects','capstone','finalize'].includes(stage))throw new UsageError('Unknown execution checkpoint.');
  const fingerprint=stageDigest(root,topic,stage);
  const checks=stage==='research'?sourceChecks(root,topic):executeChecks(stage==='finalize'?
    ['build','smoke','manifest:check'].map(script=>({command:'npm',args:['--prefix','site','run',script],cwd:root,label:`site ${script}`,timeout_ms:180000})):
    projectChecks(root,topic,stage));
  const ok=checks.length>0&&checks.every(c=>c.ok);
  withLock(lockDir(root),()=>{
    const current=resolveTopic(root,topic.id);
    if(stageDigest(root,current,stage)!==fingerprint)throw new ValidationError('Inputs changed while checks ran; rerun checks against current content.');
    current.quality??={};current.quality.executions??={};
    current.quality.executions[stage]={version:RECEIPT_VERSION,fingerprint,at:isoNow(),ok,checks};
    appendLog(current,'execution-check',`${stage}: ${ok?'pass':'failed'}`,stage);saveAndRefresh(root,current);
  });
  return {exitCode:ok?0:1,data:{topic:topic.id,stage,ok,checks},text:checks.map(c=>`${c.ok?'PASS':'FAIL'} ${c.label}${c.problem?'\n'+c.problem:''}`).join('\n')};
}
export function reviewCommand({root,args,flags}) {
  const topic=resolveTopic(root,requireArg(args[0],'<topic>','review <topic> --file <review.json>'));
  const review=readJsonInput(requireArg(stringFlag(flags,'file'),'--file','review'),'--file');
  const required=REVIEW_CHECKS[review.scope];
  if(!required||!['pass','fix-needed'].includes(review.verdict)||!review.reviewer?.trim()||!Array.isArray(review.findings)||!Array.isArray(review.not_checked)||!required.every(x=>review.checks?.includes(x)))throw new UsageError('Review needs scope, reviewer, verdict, findings, not_checked and all documented checks.');
  if(review.verdict==='pass'&&review.findings.some(f=>f.severity!=='warning'))throw new ValidationError('A passing review cannot contain unresolved errors.');
  if(review.verdict==='pass'&&review.not_checked.some(x=>required.includes(x)))throw new ValidationError('Required review checks cannot be left unreviewed.');
  topic.quality??={};topic.quality.reviews??={};topic.quality.reviews[review.scope]={...review,at:isoNow(),fingerprint:stageDigest(root,topic,'finalize')};
  appendLog(topic,'quality-review',`${review.scope}: ${review.verdict}`,'finalize');saveAndRefresh(root,topic);
  return {data:{topic:topic.id,review:topic.quality.reviews[review.scope]},text:`Recorded ${review.scope} review: ${review.verdict}.`};
}
