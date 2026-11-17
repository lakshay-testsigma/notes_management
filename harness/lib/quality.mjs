import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { stageDigest, hash, RECEIPT_VERSION } from './freshness.mjs';
import { ValidationError } from './errors.mjs';
import { isOmitted } from './stages.mjs';
import { readVisuals } from './visuals.mjs';

export const REVIEW_CHECKS = {
  content: ['sources','reading-order','activity-correctness','diagram-semantics','beginner-readability','insights'],
  projects: ['solution-tests','starter-behavior','dependency-health','architecture','documented-commands'],
};
/** Extra content checks of a visual-first plan (harness/rubrics/visuals.md, "Review"). */
export const VISUAL_FIRST_CHECKS = ['visual-accuracy', 'visual-efficacy', 'interaction-behavior', 'accessibility-responsive', 'writing-standard'];
export function requiredReviewChecks(topic, scope, root = null) {
  if (typeof scope !== 'string' || !Object.hasOwn(REVIEW_CHECKS, scope)) return null;
  const checks = [...REVIEW_CHECKS[scope]];
  if (scope === 'content' && topic.plan?.curriculum) checks.push('research-coverage', 'practical-depth', 'visual-usefulness', 'learner-fit');
  if (scope === 'content' && topic.plan?.visual_first) {
    checks.push(...VISUAL_FIRST_CHECKS.filter((c) => !checks.includes(c)));
    const entries = root ? readVisuals(root, topic).entries : [];
    if (entries.some((e) => e?.format === 'hyperframes')) checks.push('video-consistency');
    if (topic.plan?.experience_policy === 'adaptive' || entries.some((e) => e?.format === 'experience')) checks.push('experience-behavior');
  }
  if (scope === 'projects' && topic.plan?.visual_first) checks.push('project-diagrams');
  return checks;
}
export function qualityProblems(root,topic,stage) {
  const problems=[];
  for (const [file,tail] of Object.entries(topic.quality?.protected_insights??{})) {
    const text=fs.existsSync(path.join(root,file))?fs.readFileSync(path.join(root,file),'utf8'):'';
    const match=/^## My insights\s*$/m.exec(text);
    const current=path.basename(file).startsWith('my-insights-')?text:(match?text.slice(match.index):'');
    if(!current.startsWith(tail))problems.push(`protected learner content changed in ${file}; restore it before continuing`);
  }
  const target=topic.stages.find(s=>s.id===stage);
  if(target?.status==='skipped'&&!isOmitted(target))problems.push('required work was waived, not delivered; resume it before certifying completion');
  for(const u of target?.units??[]) {
    if(u.status!=='done')problems.push(`required unit ${u.id} is ${u.status}`);
    if(u.handoff&&!fs.existsSync(path.join(root,u.handoff)))problems.push(`unit ${u.id} handoff is missing`);
  }
  if(['research','mini-projects','capstone','finalize'].includes(stage)) {
    const r=topic.quality?.executions?.[stage];
    if(!r?.ok||r.version!==RECEIPT_VERSION||r.fingerprint!==stageDigest(root,topic,stage))problems.push(`missing, failed or stale execution evidence; run tutor check <topic> ${stage}`);
  }
  if(stage==='finalize') {
    for(const s of topic.stages.filter(s=>s.id!=='finalize'&&!isOmitted(s))) {
      if(s.status!=='done'||s.fresh===false||s.validation?.forced)problems.push(`required stage ${s.id} is not currently verified`);
    }
    for(const scope of Object.keys(REVIEW_CHECKS)) {
      const r=topic.quality?.reviews?.[scope];
      const checks = requiredReviewChecks(topic, scope, root);
      if(!r||r.verdict!=='pass'||r.fingerprint!==stageDigest(root,topic,'finalize')||!checks.every(c=>r.checks?.includes(c)))problems.push(`missing, failed or stale independent ${scope} review; record it with tutor review`);
    }
  }
  return problems;
}
export function projectChecks(root,topic,stage) {
  const base=path.join(root,topic.paths.projects);
  const dirs=stage==='capstone'?['capstone']:fs.readdirSync(base).filter(n=>/^mini-\d\d-/.test(n));
  const result=[];
  for(const dir of dirs) {
    const relative=`${topic.paths.projects}/${dir}`, file=path.join(root,relative,'verification.json');
    if(!fs.existsSync(file))throw new ValidationError(`${relative}/verification.json is missing; declare executable checks`);
    const spec=JSON.parse(fs.readFileSync(file,'utf8'));
    const required=stage==='capstone'?['solution-tests']:['solution-tests','starter-tests','starter-start'];
    for(const kind of required)if(!spec.checks?.some(c=>c.kind===kind))throw new ValidationError(`${file}: missing ${kind}`);
    for(const c of spec.checks??[]) {
      const cwd=path.resolve(root,relative,c.cwd??'.');
      if(!cwd.startsWith(path.resolve(root,relative)+path.sep)&&cwd!==path.resolve(root,relative))throw new ValidationError(`${file}: check cwd escapes its project`);
      if(typeof c.command!=='string'||!Array.isArray(c.args)||!c.args.every(x=>typeof x==='string'))throw new ValidationError(`${file}: use command + string args, not shell text`);
      if(!['solution-tests','starter-tests','starter-start','typecheck','audit','integration','e2e','build'].includes(c.kind))throw new ValidationError(`${file}: unknown check kind ${c.kind}`);
      if(!['starter-tests','starter-start'].includes(c.kind)&&(c.expected_exit??0)!==0)throw new ValidationError(`${file}: ${c.kind} must exit successfully`);
      if(c.kind==='starter-start'&&(c.expected_exit??0)!==0&&!c.expect_output)throw new ValidationError(`${file}: a failing starter-start needs its documented error marker`);
      if(c.expected_exit!==undefined&&(!Number.isInteger(c.expected_exit)||c.expected_exit<0))throw new ValidationError(`${file}: invalid expected_exit`);
      if(c.kind==='starter-tests'&&(c.expected_exit!==1||!c.expect_output))throw new ValidationError(`${file}: starter tests must fail on explicit TODO markers`);
      result.push({...c,cwd,label:`${dir}: ${c.kind}`});
    }
    for(const part of stage==='capstone'?['']:['starter','solution']) {
      const pkg=path.join(root,relative,part,'package.json');
      if(fs.existsSync(pkg)&&Object.keys(JSON.parse(fs.readFileSync(pkg,'utf8')).dependencies??{}).length+Object.keys(JSON.parse(fs.readFileSync(pkg,'utf8')).devDependencies??{}).length) {
        if(!spec.checks.some(c=>c.kind==='audit'&&path.resolve(root,relative,c.cwd??'.')===path.dirname(pkg)))throw new ValidationError(`${file}: package dependencies need an audit check for ${part||'capstone'}`);
      }
    }
  }
  return result;
}
export function executeChecks(checks) {
  return checks.map(c=>{
    const command=c.command==='node'?process.execPath:c.command;
    const env={...process.env,...c.env};delete env.NODE_TEST_CONTEXT;
    const child=spawnSync(command,c.args,{cwd:c.cwd,env,encoding:'utf8',timeout:c.timeout_ms??120000,maxBuffer:4*1024*1024,shell:false});
    const output=(child.stdout??'')+(child.stderr??'');
    const ok=!child.error&&child.status===(c.expected_exit??0)&&(!c.expect_output||output.includes(c.expect_output));
    return {label:c.label,command:c.command,args:c.args,expected_exit:c.expected_exit??0,exit:child.status,ok,output_sha256:hash(output),
      ...(ok?{}:{problem:child.error?.message??output.slice(-1800)})};
  });
}
// Fetching happens in a separate process, outside the state lock. The CLI, not
// the authoring model, records the URL, HTTP status, retrieval time and digest.
export function sourceChecks(root,topic) {
  const sources=JSON.parse(fs.readFileSync(path.join(root,topic.paths.state,'sources.json'),'utf8'));
  const result=[];
  for(const s of sources) {
    const urls=[...new Set([...(s.verified_via?.match(/https?:\/\/[^\s;]+/g)??[]),...(s.evidence_urls??[]),...(['official-docs','standard'].includes(s.type)?[s.url]:[])])];
    for(const url of urls) {
      const tmp=fs.mkdtempSync(path.join(process.env.TMPDIR??'/tmp','tutor-source-'));
      let capture;
      try {
        const r=spawnSync('curl',['--location','--fail','--silent','--show-error','--max-time','25','--output',path.join(tmp,'body'),'--write-out','%{http_code}',url],{encoding:'utf8',timeout:30000,maxBuffer:100000});
        const body=fs.existsSync(path.join(tmp,'body'))?fs.readFileSync(path.join(tmp,'body')):Buffer.alloc(0);
        capture={ok:r.status===0&&body.length>0,status:Number(r.stdout),bytes:body.length,sha256:hash(body),...(r.status===0?{}:{problem:r.stderr?.slice(-500)||'fetch failed'})};
        if(s.type==='repo'&&/^https:\/\/api\.github\.com\/repos\/[^/]+\/[^/?]+$/.test(url)&&capture.ok) {
          const metadata=JSON.parse(body);capture.repository={stars:metadata.stargazers_count,archived:metadata.archived,pushed_at:metadata.pushed_at,license:metadata.license?.spdx_id};
          if(metadata.archived!==false||!(metadata.stargazers_count>0)){capture.ok=false;capture.problem='Live repository metadata contradicts its eligibility';}
        }
      } finally { fs.rmSync(tmp,{recursive:true,force:true}); }
      result.push({label:`${s.id}: ${url}`,source:s.id,requested_url:url,...capture});
    }
  }
  return result;
}
