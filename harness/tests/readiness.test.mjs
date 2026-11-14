import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {test} from 'node:test';
import {completionOf, blockersOf} from '../lib/stages.mjs';
import {buildVaultIndex,resolveWikilink} from '../lib/vault-index.mjs';
import {sourceEntryProblems} from '../lib/sources.mjs';
import {stageDigest} from '../lib/freshness.mjs';
import {qualityProblems} from '../lib/quality.mjs';
import {DOMAIN,makeRoot,removeRoot,init,setPlan,planFor,tutorJson,write,read,readTopic,writeBrief,addSources,writeDigests,writeMiniProjects,writeNotes,sourceEntry} from './support/helpers.mjs';
const id=`${DOMAIN}/messaging/redis-streams`;
function fixture(fn){const root=makeRoot();try{init(root);setPlan(root,id,planFor(5));return fn(root);}finally{removeRoot(root);}}

test('failed required work stays degraded after a waiver, including a forced final stage',()=>{
 const topic={stages:[{id:'capstone',wave:4,status:'skipped',scope:'required',note:'FAILED'},{id:'finalize',wave:5,status:'done',fresh:true,validation:{forced:true}}]};
 assert.equal(completionOf(topic).complete,false);assert.equal(completionOf(topic).generation_finished,true);
 assert.deepEqual(completionOf(topic).failed_required,['capstone','finalize']);
 topic.stages[0]={id:'capstone',wave:4,status:'failed',continue_after_failure:true};
 assert.equal(completionOf(topic).generation_finished,true);assert.equal(completionOf(topic).completion,'degraded');
});
test('same-wave dependencies are enforced even when a prerequisite was waived',()=>{
 const topic={stages:[{id:'research',wave:1,status:'pending'},{id:'brief',wave:1,status:'pending'}]};
 assert.deepEqual(blockersOf(topic,topic.stages[1]).map(s=>s.id),['research']);
 topic.stages[0].status='skipped';assert.equal(blockersOf(topic,topic.stages[1]).length,1);
 assert.equal(blockersOf({stages:[{id:'notes',wave:5,status:'pending'},{id:'finalize',wave:5,status:'pending'}]},{id:'finalize',wave:5}).length,1);
});
test('done regates previously completed artifacts and plan edits reopen stale work',()=>fixture(root=>{
 assert.equal(tutorJson(root,['done',id,'intake']).code,0);
 addSources(root,id,5);assert.equal(tutorJson(root,['done',id,'research']).code,0);writeBrief(root,id);
 assert.equal(tutorJson(root,['done',id,'brief']).code,0);
 write(root,`vault/${id}/01-brief-redis-streams.md`,'broken');
 assert.equal(tutorJson(root,['done',id,'brief']).code,1);
 assert.ok(tutorJson(root,['status',id]).data.stale_stages.includes('brief'));
 setPlan(root,id,{summary:'Changed scope'});
 assert.equal(tutorJson(root,['next',id]).data.wave,0);
}));
test('failed units block a structurally valid stage and handoffs must exist',()=>fixture(root=>{
 addSources(root,id,5);writeBrief(root,id);for(const stage of ['intake','research','brief'])assert.equal(tutorJson(root,['done',id,stage]).code,0);
 writeDigests(root,id,2);tutorJson(root,['start',id,'digest']);
 assert.equal(tutorJson(root,['unit',id,'digest','fail','worker','--handoff','absent.md']).code,2);
 tutorJson(root,['unit',id,'digest','fail','worker']);
 const r=tutorJson(root,['done',id,'digest']);assert.equal(r.code,1);
 assert.match(JSON.stringify(r.data),/unit worker is failed/);
}));
test('executable checks reject broken JavaScript and stale project evidence',()=>fixture(root=>{
 writeMiniProjects(root,id,2);
 const topic=readTopic(root,id);assert.equal(qualityProblems(root,topic,'mini-projects').length,0);
 const before=stageDigest(root,topic,'mini-projects');
 write(root,`${topic.paths.projects}/mini-01-project-1/solution/verify.mjs`,'this is invalid JavaScript !!!');
 assert.notEqual(stageDigest(root,topic,'mini-projects'),before);
 assert.match(qualityProblems(root,topic,'mini-projects').join(' '),/stale execution/);
 const r=tutorJson(root,['check',id,'mini-projects']);assert.equal(r.code,1);assert.ok(r.data.checks.some(c=>!c.ok));
}));
test('a failing build is captured and a self-declared failed review cannot finalize',()=>fixture(root=>{
 write(root,'site/scripts/build.mjs','process.exit(7)');
 const fingerprint=stageDigest(root,readTopic(root,id),'finalize');
 write(root,'site/scripts/build.mjs','process.exit(0)');
 assert.notEqual(stageDigest(root,readTopic(root,id),'finalize'),fingerprint,'site check implementation must be fingerprinted');
 write(root,'site/package.json',JSON.stringify({scripts:{build:'node -e "process.exit(7)"',smoke:'node -e "process.exit(0)"','manifest:check':'node -e "process.exit(0)"'}}));
 const r=tutorJson(root,['check',id,'finalize']);assert.equal(r.code,1);assert.equal(r.data.checks[0].exit,7);
 write(root,'tmp/review.json',JSON.stringify({scope:'content',reviewer:'Independent test reviewer',verdict:'fix-needed',checks:['sources','reading-order','activity-correctness','diagram-semantics','beginner-readability','insights'],findings:[{severity:'error',problem:'Wrong diagram'}],not_checked:[]}));
 assert.equal(tutorJson(root,['review',id,'--file',path.join(root,'tmp/review.json')]).code,0);
 assert.match(qualityProblems(root,readTopic(root,id),'finalize').join(' '),/independent content review/);
}));
test('reader sequence must list every child exactly once in authored index order',()=>fixture(root=>{
 addSources(root,id,5);writeDigests(root,id,2);
 const topic=readTopic(root,id);topic.reader_order.digest.reverse();write(root,'tmp/order.json',JSON.stringify(topic.reader_order));
 const r=tutorJson(root,['order',id,'set','--file',path.join(root,'tmp/order.json')]);assert.equal(r.code,1);
 assert.match(r.data.error,/authored index order differs/);
}));
test('duplicate basenames reject ambiguous links and accept qualified identities',()=>fixture(root=>{
 write(root,'vault/a/repo-overview.md','one');write(root,'vault/b/repo-overview.md','two');
 const index=buildVaultIndex(root);assert.equal(resolveWikilink(index,'repo-overview').ok,false);
 assert.equal(resolveWikilink(index,'a/repo-overview').ok,true);assert.equal(resolveWikilink(index,'b/repo-overview.md').ok,true);
}));
test('typed source policy rejects zero-star repos with no adopter and stale verification',()=>{
 const failures=sourceEntryProblems(sourceEntry('bad-repo',{type:'repo',verified_at:'1900-01-01',evidence:{stars:0,last_commit:'1900-01-01',citations:null,venue:null,publisher:null,used_by:[]}}));
 for(const field of ['evidence.stars','evidence.used_by','evidence.last_commit','verified_at'])assert.ok(failures.some(f=>f.field===field),field);
});
test('guarded regeneration and rerun preserve insight tails and recall history',()=>fixture(root=>{
 addSources(root,id,5);writeBrief(root,id);writeNotes(root,id);
 const file=`vault/${id}/01-brief-redis-streams.md`,tail='## My insights\n\nMy exact words, whitespace and [[link]].\n';
 write(root,file,read(root,file).split('## My insights')[0]+tail);
 write(root,'tmp/draft.md','New generated prose.\n\n## My insights\nMalicious replacement');
 assert.equal(tutorJson(root,['write-note',id,file,'--file',path.join(root,'tmp/draft.md')]).code,0);
 assert.ok(read(root,file).endsWith(tail));
 tutorJson(root,['recall','sync',id]);tutorJson(root,['recall','grade',id,'rs-01','good']);const before=readTopic(root,id).recall;
 assert.equal(tutorJson(root,['rerun',id]).code,0);assert.deepEqual(readTopic(root,id).recall,before);
 write(root,file,'New generated prose.\n## My insights\n');
 assert.match(qualityProblems(root,readTopic(root,id),'brief').join(' '),/protected learner content changed/);
}));
test('browser recall events import once and conflicting IDs fail atomically',()=>fixture(root=>{
 writeNotes(root,id);tutorJson(root,['recall','sync',id]);
 const event={id:'browser-event-1',card_id:'rs-01',grade:'good',at:'2026-11-14T10:00:00Z'};
 const batch={schema:1,topic:id,events:[event]};write(root,'tmp/events.json',JSON.stringify(batch));
 const args=['recall','import',id,'--file',path.join(root,'tmp/events.json')];
 assert.equal(tutorJson(root,args).data.imported,1);const first=readTopic(root,id).recall;
 assert.equal(tutorJson(root,args).data.duplicates,1);assert.deepEqual(readTopic(root,id).recall,first);
 batch.events[0].grade='again';write(root,'tmp/events.json',JSON.stringify(batch));assert.equal(tutorJson(root,args).code,2);assert.deepEqual(readTopic(root,id).recall,first);
}));
test('unknown model capacity is conservative and oversized files have complete bounded ranges',()=>fixture(root=>{
 const text='abcdefgh\n'.repeat(8000);write(root,'repo/long.c',text);
 const r=tutorJson(root,['slice',path.join(root,'repo'),'--window','16000','--reserve','2400']);assert.equal(r.data.budget,4000);
 const ranges=r.data.slices.flatMap(s=>s.ranges??[]);assert.equal(ranges[0].start_char,0);assert.equal(ranges.at(-1).end_char,text.length);
 let previous=0;for(const range of ranges){assert.equal(range.start_char,previous);assert.ok(range.tokens<=4000);previous=range.end_char;}
 const range=ranges[0],readResult=tutorJson(root,['read',path.join(root,'repo/long.c'),'--start',String(range.start_char),'--end',String(range.end_char),'--window','16000','--reserve','2400']);assert.equal(readResult.data.text,text.slice(range.start_char,range.end_char));
 assert.ok(tutorJson(root,['budget',path.join(root,'repo/long.c')]).data.budget<13108);
}));

test('generated maps qualify same-slug topic links without renaming notes',()=>fixture(root=>{
 init(root,'Redis Streams',{subdomain:'storage'});tutorJson(root,['map',id]);
 const home=read(root,'vault/Home.md');
 assert.ok(home.includes(`[[${id}/00-start-here-redis-streams|`));
 assert.ok(home.includes(`[[${DOMAIN}/storage/redis-streams/00-start-here-redis-streams|`));
}));
test('project recipes cannot declare failing solutions successful',()=>fixture(root=>{
 writeMiniProjects(root,id,2);const file=`projects/${id}/mini-01-project-1/verification.json`,spec=JSON.parse(read(root,file));
 spec.checks.find(c=>c.kind==='solution-tests').expected_exit=1;write(root,file,JSON.stringify(spec));
 const r=tutorJson(root,['check',id,'mini-projects']);assert.equal(r.code,1);assert.match(r.data.error,/must exit successfully/);
}));

test('legacy scope comes from the domain/depth configuration, never the skip reason',()=>fixture(root=>{
 const topic=readTopic(root,id);for(const stage of topic.stages)delete stage.scope;
 write(root,`state/topics/${id}/topic.json`,JSON.stringify(topic));
 tutorJson(root,['skip',id,'research','--reason','depth "quick" has no research']);
 const state=readTopic(root,id);assert.equal(state.stages.find(s=>s.id==='research').scope,'required');
 assert.equal(tutorJson(root,['validate',id,'research']).code,1);
}));
