import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sceneProblems, sceneSnapshot } from '../src/components/learn/react/progressive-scene.ts';

const example = () => ({
 title: 'Inspect a queue', intro: 'Follow one job.',
 nodes: [
  {id:'producer',label:'Producer',detail:'Creates a job.',position:[-1,0]},
  {id:'queue',label:'Job queue',detail:'Retains jobs.',position:[0,-1]},
  {id:'worker',label:'Worker',detail:'Processes a job.',position:[1,0]},
 ],
 edges:[{id:'append',from:'producer',to:'queue',label:'Append job'}, {id:'consume',from:'queue',to:'worker',label:'Deliver job'}],
 steps:[
  {title:'Create',description:'Only the producer exists.',nodes:['producer'],edges:[],changes:['Producer added.']},
  {title:'Retain',description:'Append a job to the queue.',nodes:['producer','queue'],edges:['append'],changes:['Queue added.'],metrics:[{label:'Queued',value:'1'}]},
  {title:'Process',description:'The worker accepts the job.',nodes:['producer','queue','worker'],edges:['consume'],focus:['worker'],changes:['Worker added.'],metrics:[{label:'Queued',value:'0'}]},
  {title:'Fail',description:'The failed worker cannot consume.',nodes:['producer','queue','worker'],edges:['append'],failed:['worker'],changes:['Worker unavailable.'],metrics:[{label:'Queued',value:'1'}]},
 ],
});

test('seeking backward or directly restores a complete snapshot without future nodes, traffic or metrics', () => {
 const props=example(); assert.deepEqual(sceneProblems(props),[]);
 assert.equal(sceneSnapshot(props,3).step.failed[0],'worker');
 const before=sceneSnapshot(props,1);
 assert.deepEqual(before.nodes.map(n=>n.id),['producer','queue']);
 assert.deepEqual(before.edges.map(e=>e.id),['append']);
 assert.equal(before.step.metrics[0].value,'1');
 assert.equal(before.step.failed,undefined);
 assert.deepEqual(sceneSnapshot(props,0),sceneSnapshot(props,-99));
 assert.equal(sceneSnapshot(props,999).index,3);
});
test('a connected diagram cannot refer to hidden or missing blocks, or carry traffic through failed blocks', () => {
 const p=example(); p.steps[0].edges=['consume'];
 assert.ok(sceneProblems(p).some(e=>e.includes('hidden endpoint')));
 p.steps[0].edges=[]; p.steps[3].edges=['consume'];
 assert.ok(sceneProblems(p).some(e=>e.includes('failed node')));
 p.edges[0].to='unknown'; assert.ok(sceneProblems(p).some(e=>e.includes('known endpoints')));
});
test('malformed author input fails validation rather than crashing the renderer', () => {
 for (const patch of [{nodes:null},{steps:[]},{nodes:[null]},{edges:[null]}]) assert.ok(sceneProblems({...example(),...patch}).length);
 const p=example(); p.steps[0].nodes={}; p.steps[0].focus=['producer']; p.steps[0].edges={};
 assert.ok(sceneProblems(p).length);
 p.nodes[0].position=[NaN,0]; assert.ok(sceneProblems(p).some(e=>e.includes('finite')));
});
