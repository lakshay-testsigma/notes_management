import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const source = readFileSync(new URL('../src/components/learn/react/cluster-engine.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const engine = {};
new Function('exports', compiled)(engine);
const { createCluster, step, sendWrite, toggleFail, addServer, removeServer, setLatency, sync, reset, isQuiet, MAX_SERVERS } = engine;

/** Step until nothing is in flight (bounded). */
function settle(state, limit = 40) {
  for (let i = 0; i < limit && !isQuiet(state); i++) state = step(state);
  return state;
}
const ticks = (state, n) => { for (let i = 0; i < n; i++) state = step(state); return state; };

test('replication commits a write once 3 of 5 servers store it', () => {
  let s = createCluster({ mode: 'replication', servers: 5, failures: ['s4', 's5'] });
  assert.equal(s.leader, 's1');
  s = settle(sendWrite(s, 1));
  const op = s.ops[0];
  assert.equal(op.status, 'committed');
  assert.equal(s.metrics.committed, 1);
  assert.match(s.explanation.text, /3 of 5 servers store it and a majority is 3/);
  assert.equal(s.servers.filter((x) => x.log.includes(op.id)).length, 3);
  assert.ok(s.ops[0].replied);
});

test('replication blocks with 2 of 5 reachable and commits after a recovery', () => {
  let s = createCluster({ mode: 'replication', servers: 5, failures: ['s3', 's4', 's5'] });
  // No election is needed: s1 was elected before the failures in this scenario.
  s = { ...s, leader: 's1' };
  s = settle(sendWrite(s, 1));
  assert.equal(s.ops[0].status, 'pending');
  assert.equal(s.explanation.key, 'blocked');
  assert.match(s.explanation.text, /only 2 of 5 servers are reachable and a majority needs 3/);
  s = toggleFail(s, 's3');
  s = settle(s);
  assert.equal(s.ops[0].status, 'committed');
  assert.match(s.explanation.text, /waited until enough servers were reachable/);
});

test('a failed leader is replaced by the lowest-id live server with term + 1', () => {
  let s = createCluster({ mode: 'replication', servers: 3 });
  assert.equal(s.term, 1);
  s = toggleFail(s, 's1');
  s = ticks(s, 3);
  assert.equal(s.leader, 's2');
  assert.equal(s.term, 2);
  assert.equal(s.explanation.key, 'election');
  s = settle(sendWrite(s, 1));
  assert.equal(s.ops[0].status, 'committed');
});

test('no election happens without a majority', () => {
  let s = createCluster({ mode: 'replication', servers: 3 });
  s = toggleFail(toggleFail(s, 's1'), 's2');
  s = ticks(s, 5);
  assert.equal(s.term, 1);
  assert.equal(s.explanation.key, 'blocked');
});

test('broadcast leaves a node that was down stale until Sync', () => {
  let s = createCluster({ mode: 'broadcast', servers: 4, failures: ['s3'] });
  s = settle(sendWrite(s, 1));
  assert.deepEqual(s.servers.map((x) => x.value), [1, 1, 0, 1]);
  s = settle(toggleFail(s, 's3'));
  s = step(s);
  assert.equal(s.servers.find((x) => x.id === 's3').value, 0);
  assert.equal(s.explanation.key, 'stale');
  s = sync(s);
  assert.deepEqual(s.servers.map((x) => x.value), [1, 1, 1, 1]);
  assert.equal(s.explanation.key, 'converged');
});

test('load balancing reroutes requests away from a failed server', () => {
  let s = createCluster({ mode: 'load-balance', servers: 3 });
  s = toggleFail(s, 's2'); // the balancer has not noticed yet
  s = settle(sendWrite(s, 3));
  assert.ok(s.ops.every((op) => op.status === 'committed'));
  assert.ok(s.metrics.rerouted >= 1);
  assert.ok(s.ops.every((op) => op.server !== 's2'));
  assert.equal(s.servers.find((x) => x.id === 's2').completed, 0);
  assert.ok(s.balancerDown.includes('s2'));
});

test('latency changes response time in load balancing', () => {
  const run = (latency) => {
    let s = createCluster({ mode: 'load-balance', servers: 2, latency });
    s = settle(sendWrite(s, 1));
    return s.tick;
  };
  assert.ok(run(4) > run(1));
  assert.equal(setLatency(createCluster({ mode: 'broadcast' }), 9).latency, 5);
});

test('reset restores the initial state exactly', () => {
  const initial = createCluster({ mode: 'replication', servers: 5, latency: 2, failures: ['s5'] });
  let s = settle(sendWrite(addServer(toggleFail(initial, 's1')), 3));
  assert.notDeepEqual(s, initial);
  assert.deepEqual(reset(s), initial);
});

test('add and remove keep the server count between 1 and 7', () => {
  let s = createCluster({ mode: 'broadcast', servers: 3 });
  for (let i = 0; i < 10; i++) s = addServer(s);
  assert.equal(s.servers.length, MAX_SERVERS);
  for (let i = 0; i < 10; i++) s = removeServer(s);
  assert.equal(s.servers.length, 1);
  assert.equal(createCluster({ mode: 'broadcast', servers: 40 }).servers.length, 7);
});

test('the engine is deterministic', () => {
  const script = (mode) => {
    let s = createCluster({ mode, servers: 5, latency: 2 });
    s = sendWrite(s, 3);
    s = ticks(s, 2);
    s = toggleFail(s, 's1');
    s = ticks(s, 6);
    s = sendWrite(s, 2);
    return settle(s);
  };
  for (const mode of ['replication', 'broadcast', 'load-balance']) assert.deepEqual(script(mode), script(mode));
});
