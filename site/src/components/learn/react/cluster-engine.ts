/**
 * The pure, deterministic engine behind <ClusterSim />. No React, no clock, no
 * randomness: the same actions always give the same state, so the server
 * render and the browser render agree, and node tests can drive it.
 *
 * Time moves in discrete ticks. A message sent at tick t with latency L
 * arrives at tick t + L. Every action returns a new state.
 *
 * Modes (simplified teaching models, not full protocols):
 *  - replication: leader-based majority quorum. client → leader appends →
 *    AppendEntries to followers → acks → commit when a majority of ALL
 *    configured servers store the entry → reply. A failed leader is replaced
 *    after a timeout by the lowest-id live server (term + 1), but only when a
 *    majority is alive. Real Raft also compares log freshness in elections.
 *  - broadcast: the first live server takes an update and forwards it to every
 *    other server once (gossip flood). A server that is down misses it and stays
 *    stale after it recovers, until Sync (anti-entropy) copies the newest value.
 *  - load-balance: round-robin over the servers the balancer believes healthy.
 *    The balancer learns failures only at health checks, so requests sent to a
 *    failed server time out and are rerouted.
 */

export type ClusterMode = 'replication' | 'broadcast' | 'load-balance';
export type ExplainKey =
	| 'ready'
	| 'committed'
	| 'blocked'
	| 'election'
	| 'stale'
	| 'converged'
	| 'rerouted'
	| 'served'
	| 'changed';

export interface ClusterConfig {
	mode: ClusterMode;
	servers?: number;
	latency?: number;
	failures?: string[];
	explain?: Record<string, string>;
}

export interface Server {
	id: string;
	failed: boolean;
	/** replication: entry ids stored, in order */
	log: number[];
	/** broadcast: newest version this server holds (0 = initial) */
	value: number;
	/** load-balance: request ids waiting to be served */
	queue: number[];
	/** load-balance: requests served */
	completed: number;
}

export type MessageKind = 'request' | 'append' | 'ack' | 'reply' | 'update' | 'response';

export interface Message {
	id: number;
	from: string;
	to: string;
	kind: MessageKind;
	op: number;
	sentAt: number;
	arriveAt: number;
}

export interface Op {
	id: number;
	status: 'pending' | 'committed';
	/** replication: followers that acknowledged */
	acks: string[];
	/** broadcast: version number */
	value: number;
	/** load-balance: server it was sent to, deadline, creation tick */
	server: string | null;
	deadline: number;
	created: number;
	lastSent: number;
	blockedNoted: boolean;
	replied: boolean;
}

export interface ClusterState {
	config: Required<Omit<ClusterConfig, 'explain'>> & { explain: Record<string, string> };
	mode: ClusterMode;
	tick: number;
	latency: number;
	servers: Server[];
	nextServer: number;
	messages: Message[];
	nextMessage: number;
	ops: Op[];
	nextOp: number;
	/** replication */
	leader: string | null;
	term: number;
	leaderDownSince: number | null;
	/** broadcast */
	version: number;
	/** load-balance */
	rr: number;
	balancerDown: string[];
	metrics: { committed: number; pending: number; delivered: number; rerouted: number };
	events: string[];
	explanation: { key: ExplainKey; text: string };
}

export const CLIENT = 'client';
export const MIN_SERVERS = 1;
export const MAX_SERVERS = 7;
export const ELECTION_TIMEOUT = 3;
export const RETRY_TICKS = 3;
export const HEALTH_INTERVAL = 3;
const EVENT_LIMIT = 6;

export const majority = (n: number) => Math.floor(n / 2) + 1;
const num = (id: string) => Number(id.replace(/\D/g, '')) || 0;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(v)));
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function newServer(id: string, failed = false): Server {
	return { id, failed, log: [], value: 0, queue: [], completed: 0 };
}

export function createCluster(input: ClusterConfig): ClusterState {
	const config = {
		mode: input.mode,
		servers: clamp(input.servers ?? 3, MIN_SERVERS, MAX_SERVERS),
		latency: clamp(input.latency ?? 1, 1, 5),
		failures: [...(input.failures ?? [])],
		explain: { ...(input.explain ?? {}) },
	};
	const servers = Array.from({ length: config.servers }, (_, i) => newServer(`s${i + 1}`, config.failures.includes(`s${i + 1}`)));
	const live = servers.filter((s) => !s.failed);
	const state: ClusterState = {
		config,
		mode: config.mode,
		tick: 0,
		latency: config.latency,
		servers,
		nextServer: config.servers + 1,
		messages: [],
		nextMessage: 1,
		ops: [],
		nextOp: 1,
		leader: config.mode === 'replication' && live.length >= majority(servers.length) ? live[0].id : null,
		term: config.mode === 'replication' ? 1 : 0,
		leaderDownSince: null,
		version: 0,
		rr: 0,
		balancerDown: servers.filter((s) => s.failed).map((s) => s.id),
		metrics: { committed: 0, pending: 0, delivered: 0, rerouted: 0 },
		events: [],
		explanation: { key: 'ready', text: '' },
	};
	explain(state, 'ready', readyText(state));
	return state;
}

export function reset(state: ClusterState): ClusterState {
	return createCluster(state.config);
}

function readyText(s: ClusterState): string {
	const n = s.servers.length;
	if (s.mode === 'replication') {
		return s.leader
			? `${s.leader} leads term ${s.term}. A write commits once ${majority(n)} of ${n} servers store it.`
			: `No leader: only ${liveServers(s).length} of ${n} servers are up and an election needs ${majority(n)}.`;
	}
	if (s.mode === 'broadcast') return 'Send an update. Each server forwards it once to every other server.';
	return 'Send requests. The balancer spreads them round-robin over the servers it believes healthy.';
}

function explain(s: ClusterState, key: ExplainKey, text: string) {
	s.explanation = { key, text: s.config.explain[key] ?? text };
}

function log(s: ClusterState, text: string) {
	s.events = [...s.events, `t${s.tick}: ${text}`].slice(-EVENT_LIMIT);
}

const server = (s: ClusterState, id: string | null) => (id ? s.servers.find((x) => x.id === id) : undefined);
export const liveServers = (s: ClusterState) => s.servers.filter((x) => !x.failed);

function send(s: ClusterState, from: string, to: string, kind: MessageKind, op: number) {
	s.messages.push({ id: s.nextMessage++, from, to, kind, op, sentAt: s.tick, arriveAt: s.tick + s.latency });
}

function updatePending(s: ClusterState) {
	s.metrics.pending = s.ops.filter((o) => o.status === 'pending').length;
}

// ------------------------------------------------------------- actions ----

export function addServer(state: ClusterState): ClusterState {
	const s = clone(state);
	if (s.servers.length >= MAX_SERVERS) {
		log(s, `No more servers: this model allows at most ${MAX_SERVERS}.`);
		return s;
	}
	const id = `s${s.nextServer++}`;
	s.servers.push(newServer(id));
	log(s, `${id} joins with an empty ${s.mode === 'replication' ? 'log' : 'state'}.`);
	if (s.mode === 'replication') {
		explain(s, 'changed', `${s.servers.length} servers now, so a majority is ${majority(s.servers.length)}.`);
	} else {
		explain(s, 'changed', `${id} joins. There are ${s.servers.length} servers now.`);
	}
	return s;
}

export function removeServer(state: ClusterState): ClusterState {
	const s = clone(state);
	if (s.servers.length <= MIN_SERVERS) {
		log(s, `Cannot remove: at least ${MIN_SERVERS} server must remain.`);
		return s;
	}
	const gone = s.servers.reduce((a, b) => (num(b.id) > num(a.id) ? b : a));
	s.servers = s.servers.filter((x) => x.id !== gone.id);
	s.messages = s.messages.filter((m) => m.from !== gone.id && m.to !== gone.id);
	s.balancerDown = s.balancerDown.filter((id) => id !== gone.id);
	for (const op of s.ops) op.acks = op.acks.filter((id) => id !== gone.id);
	log(s, `${gone.id} leaves the cluster.`);
	if (s.mode === 'replication') {
		if (s.leader === gone.id) {
			s.leader = null;
			s.leaderDownSince = s.tick;
		}
		explain(s, 'changed', `${s.servers.length} servers now, so a majority is ${majority(s.servers.length)}.`);
		checkCommits(s);
	} else {
		explain(s, 'changed', `${gone.id} leaves. There are ${s.servers.length} servers now.`);
	}
	updatePending(s);
	return s;
}

export function toggleFail(state: ClusterState, id: string): ClusterState {
	const s = clone(state);
	const target = server(s, id);
	if (!target) return s;
	target.failed = !target.failed;
	if (target.failed) {
		target.queue = [];
		log(s, `${id} fails.`);
		if (s.mode === 'replication' && s.leader === id) {
			s.leaderDownSince = s.tick;
			explain(s, 'changed', `The leader ${id} is down. Followers wait ${ELECTION_TIMEOUT} ticks, then elect a new leader.`);
		} else {
			explain(s, 'changed', `${id} is down. ${liveServers(s).length} of ${s.servers.length} servers are up.`);
		}
	} else {
		log(s, `${id} recovers.`);
		explain(s, 'changed', `${id} is back. ${liveServers(s).length} of ${s.servers.length} servers are up.`);
	}
	return s;
}

export function setLatency(state: ClusterState, ticks: number): ClusterState {
	const s = clone(state);
	s.latency = clamp(ticks, 1, 5);
	explain(s, 'changed', `Each message now takes ${s.latency} ${s.latency === 1 ? 'tick' : 'ticks'} to arrive.`);
	return s;
}

/** Start `count` operations in the same tick (count > 1 = concurrent). */
export function sendWrite(state: ClusterState, count = 1): ClusterState {
	const s = clone(state);
	for (let i = 0; i < count; i++) {
		const op: Op = {
			id: s.nextOp++,
			status: 'pending',
			acks: [],
			value: 0,
			server: null,
			deadline: 0,
			created: s.tick,
			lastSent: s.tick,
			blockedNoted: false,
			replied: false,
		};
		s.ops.push(op);
		if (s.mode === 'replication') {
			const leader = server(s, s.leader);
			if (leader && !leader.failed) send(s, CLIENT, leader.id, 'request', op.id);
			log(s, `Client sends write #${op.id}${leader && !leader.failed ? ` to leader ${leader.id}` : ', but no leader is up'}.`);
		} else if (s.mode === 'broadcast') {
			op.value = ++s.version;
			const entry = liveServers(s)[0];
			if (entry) send(s, CLIENT, entry.id, 'update', op.id);
			log(s, entry ? `Client sends v${op.value} to ${entry.id}.` : `Client cannot send v${op.value}: no server is up.`);
		} else {
			route(s, op, null);
		}
	}
	if (count > 1) explain(s, 'changed', `${count} operations start in the same tick, so they race through the cluster.`);
	updatePending(s);
	return s;
}

/** broadcast: anti-entropy. Every live server copies the newest value any live server holds. */
export function sync(state: ClusterState): ClusterState {
	const s = clone(state);
	const live = liveServers(s);
	const newest = Math.max(0, ...live.map((x) => x.value));
	const behind = live.filter((x) => x.value < newest);
	for (const x of behind) x.value = newest;
	log(s, behind.length ? `Sync: ${behind.map((x) => x.id).join(', ')} catch up to v${newest}.` : 'Sync: every live server already has the newest value.');
	checkConverged(s);
	if (behind.length) explain(s, 'converged', `Anti-entropy compared the servers and copied v${newest} to ${behind.map((x) => x.id).join(', ')}. Gossip alone never repeats an old update.`);
	updatePending(s);
	return s;
}

// --------------------------------------------------------------- ticks ----

export function step(state: ClusterState): ClusterState {
	const s = clone(state);
	s.tick += 1;
	const arriving = s.messages.filter((m) => m.arriveAt <= s.tick).sort((a, b) => a.arriveAt - b.arriveAt || a.id - b.id);
	s.messages = s.messages.filter((m) => m.arriveAt > s.tick);
	for (const m of arriving) {
		if (m.to !== CLIENT) {
			const to = server(s, m.to);
			if (!to || to.failed) {
				if (s.mode === 'broadcast' && to) log(s, `${m.to} is down and misses v${opOf(s, m.op)?.value}.`);
				continue;
			}
		}
		s.metrics.delivered += 1;
		if (s.mode === 'replication') deliverReplication(s, m);
		else if (s.mode === 'broadcast') deliverBroadcast(s, m);
		else deliverBalanced(s, m);
	}
	if (s.mode === 'replication') tickReplication(s);
	else if (s.mode === 'broadcast') tickBroadcast(s);
	else tickBalanced(s);
	updatePending(s);
	return s;
}

const opOf = (s: ClusterState, id: number) => s.ops.find((o) => o.id === id);

/** True when nothing is in flight and nothing can change by waiting. */
export function isQuiet(s: ClusterState): boolean {
	if (s.messages.length > 0) return false;
	if (s.mode === 'replication') {
		const leader = server(s, s.leader);
		const leaderless = !leader || leader.failed;
		if (leaderless && liveServers(s).length >= majority(s.servers.length) && s.servers.length > 0) return false;
		return !s.ops.some((o) => o.status === 'pending') || liveServers(s).length < majority(s.servers.length);
	}
	if (s.mode === 'load-balance') return !s.ops.some((o) => o.status === 'pending') && s.servers.every((x) => x.queue.length === 0);
	return true;
}

// ---- replication

function deliverReplication(s: ClusterState, m: Message) {
	const op = opOf(s, m.op);
	if (!op) return;
	const leader = server(s, s.leader);
	if (m.kind === 'request') {
		if (!leader || leader.failed || leader.id !== m.to) return;
		if (!leader.log.includes(op.id)) leader.log.push(op.id);
		op.lastSent = s.tick;
		for (const f of s.servers) if (f.id !== leader.id) send(s, leader.id, f.id, 'append', op.id);
		log(s, `Leader ${leader.id} appends write #${op.id} and sends AppendEntries.`);
		checkCommits(s);
	} else if (m.kind === 'append') {
		const f = server(s, m.to)!;
		if (!f.log.includes(op.id)) f.log.push(op.id);
		send(s, f.id, m.from, 'ack', op.id);
	} else if (m.kind === 'ack') {
		if (!leader || leader.failed || leader.id !== m.to) return;
		if (!op.acks.includes(m.from)) op.acks.push(m.from);
		checkCommits(s);
	} else if (m.kind === 'reply') {
		op.replied = true;
		log(s, `Client receives OK for write #${op.id}.`);
	}
}

function storedCount(s: ClusterState, op: Op): number {
	const ids = new Set(s.servers.map((x) => x.id));
	const leader = server(s, s.leader);
	const fromLeader = leader && leader.log.includes(op.id) ? 1 : 0;
	return fromLeader + op.acks.filter((id) => ids.has(id) && id !== s.leader).length;
}

function checkCommits(s: ClusterState) {
	const leader = server(s, s.leader);
	if (!leader || leader.failed) return;
	const n = s.servers.length;
	for (const op of s.ops) {
		if (op.status !== 'pending' || !leader.log.includes(op.id)) continue;
		const stored = storedCount(s, op);
		if (stored >= majority(n)) {
			op.status = 'committed';
			s.metrics.committed += 1;
			send(s, leader.id, CLIENT, 'reply', op.id);
			log(s, `Write #${op.id} is committed (${stored} of ${n} servers store it).`);
			explain(
				s,
				'committed',
				`Write #${op.id} committed: ${stored} of ${n} servers store it and a majority is ${majority(n)}. Any future majority overlaps this one, so a minority failure cannot lose it.${op.blockedNoted ? ' It waited until enough servers were reachable again.' : ''}`,
			);
		}
	}
}

function tickReplication(s: ClusterState) {
	const n = s.servers.length;
	const live = liveServers(s);
	const leader = server(s, s.leader);
	if (!leader || leader.failed) {
		if (s.leaderDownSince === null) s.leaderDownSince = s.tick;
		if (s.tick - s.leaderDownSince >= ELECTION_TIMEOUT) {
			if (live.length >= majority(n)) {
				const winner = [...live].sort((a, b) => num(a.id) - num(b.id))[0];
				s.leader = winner.id;
				s.term += 1;
				s.leaderDownSince = null;
				log(s, `Election: ${winner.id} becomes leader for term ${s.term}.`);
				explain(
					s,
					'election',
					`No heartbeat for ${ELECTION_TIMEOUT} ticks, so the live servers elected ${winner.id} (lowest id) for term ${s.term} with ${live.length} of ${n} votes. Simplified: real Raft also checks that the winner's log is up to date.`,
				);
				// Pending writes the new leader never saw are resent by the client.
				for (const op of s.ops) {
					if (op.status === 'pending' && !winner.log.includes(op.id)) send(s, CLIENT, winner.id, 'request', op.id);
					op.acks = [];
					op.lastSent = s.tick;
				}
				for (const op of s.ops) if (op.status === 'pending' && winner.log.includes(op.id)) replicate(s, winner, op);
			} else {
				s.leaderDownSince = s.tick;
				explain(s, 'blocked', `No leader can be elected: only ${live.length} of ${n} servers are reachable and an election needs ${majority(n)} votes.`);
			}
		}
		return;
	}
	for (const op of s.ops) {
		if (op.status !== 'pending') continue;
		if (live.length < majority(n) && !op.blockedNoted) {
			op.blockedNoted = true;
			log(s, `Write #${op.id} is blocked.`);
			explain(s, 'blocked', `Write #${op.id} is blocked: only ${live.length} of ${n} servers are reachable and a majority needs ${majority(n)}. The leader keeps retrying.`);
		}
		if (s.tick - op.lastSent >= RETRY_TICKS) {
			op.lastSent = s.tick;
			if (leader.log.includes(op.id)) replicate(s, leader, op);
			else if (!s.messages.some((m) => m.op === op.id && m.kind === 'request')) send(s, CLIENT, leader.id, 'request', op.id);
		}
	}
	checkCommits(s);
}

function replicate(s: ClusterState, leader: Server, op: Op) {
	for (const f of s.servers) {
		if (f.id === leader.id || f.failed || op.acks.includes(f.id)) continue;
		if (s.messages.some((m) => m.op === op.id && m.kind === 'append' && m.to === f.id)) continue;
		send(s, leader.id, f.id, 'append', op.id);
	}
}

// ---- broadcast

function deliverBroadcast(s: ClusterState, m: Message) {
	const op = opOf(s, m.op);
	const to = server(s, m.to);
	if (!op || !to) return;
	if (op.value > to.value) {
		to.value = op.value;
		log(s, `${to.id} stores v${op.value} and forwards it.`);
		for (const other of s.servers) if (other.id !== to.id && other.id !== m.from) send(s, to.id, other.id, 'update', op.id);
	}
}

function checkConverged(s: ClusterState) {
	const live = liveServers(s);
	for (const op of s.ops) {
		if (op.status !== 'pending') continue;
		if (live.length > 0 && live.every((x) => x.value >= op.value)) {
			op.status = 'committed';
			s.metrics.committed += 1;
		}
	}
}

function tickBroadcast(s: ClusterState) {
	const before = s.metrics.committed;
	checkConverged(s);
	if (s.messages.length > 0) return;
	const live = liveServers(s);
	const newest = Math.max(0, ...s.servers.map((x) => x.value));
	const stale = live.filter((x) => x.value < newest);
	if (stale.length) {
		explain(
			s,
			'stale',
			`${stale.map((x) => `${x.id} still shows v${x.value}`).join(', ')} while others have v${newest}. ${stale.length === 1 ? 'It was' : 'They were'} down when the update spread, and gossip does not repeat old updates. Press Sync to run anti-entropy.`,
		);
	} else if (s.metrics.committed > before || (s.ops.length && s.explanation.key !== 'converged')) {
		const down = s.servers.filter((x) => x.failed);
		explain(
			s,
			'converged',
			`v${newest} reached every live server through forwarding${down.length ? `; ${down.map((x) => x.id).join(', ')} missed it while down` : ''}.`,
		);
	}
}

// ---- load-balance

function route(s: ClusterState, op: Op, avoid: string | null) {
	const healthy = s.servers.filter((x) => !s.balancerDown.includes(x.id) && x.id !== avoid);
	if (healthy.length === 0) {
		op.server = null;
		op.deadline = s.tick + HEALTH_INTERVAL;
		log(s, `Request #${op.id} waits: the balancer knows no healthy server.`);
		return;
	}
	const target = healthy[s.rr % healthy.length];
	s.rr += 1;
	op.server = target.id;
	op.lastSent = s.tick;
	op.deadline = s.tick + 2 * s.latency + 4;
	send(s, CLIENT, target.id, 'request', op.id);
	log(s, `Balancer sends request #${op.id} to ${target.id}.`);
}

function deliverBalanced(s: ClusterState, m: Message) {
	const op = opOf(s, m.op);
	if (!op) return;
	if (m.kind === 'request') {
		server(s, m.to)!.queue.push(op.id);
	} else if (m.kind === 'response' && op.status === 'pending' && op.server === m.from) {
		op.status = 'committed';
		s.metrics.committed += 1;
		const took = s.tick - op.created;
		log(s, `Request #${op.id} served by ${m.from} in ${took} ticks.`);
		explain(
			s,
			'served',
			`Request #${op.id} took ${took} ticks: ${s.latency} to reach ${m.from}, time in its queue, and ${s.latency} back. Higher latency or a longer queue makes every response slower.`,
		);
	}
}

function tickBalanced(s: ClusterState) {
	for (const x of s.servers) {
		if (x.failed || x.queue.length === 0) continue;
		const id = x.queue.shift()!;
		x.completed += 1;
		send(s, x.id, CLIENT, 'response', id);
	}
	if (s.tick % HEALTH_INTERVAL === 0) {
		const down = s.servers.filter((x) => x.failed).map((x) => x.id);
		const newlyDown = down.filter((id) => !s.balancerDown.includes(id));
		const backUp = s.balancerDown.filter((id) => !down.includes(id) && s.servers.some((x) => x.id === id));
		s.balancerDown = down;
		if (newlyDown.length) log(s, `Health check marks ${newlyDown.join(', ')} down.`);
		if (backUp.length) log(s, `Health check marks ${backUp.join(', ')} healthy again.`);
	}
	for (const op of s.ops) {
		if (op.status !== 'pending' || s.tick < op.deadline) continue;
		const from = op.server;
		if (from) {
			s.metrics.rerouted += 1;
			log(s, `Request #${op.id} timed out on ${from}; the balancer retries it.`);
		}
		route(s, op, from && s.servers.length > 1 ? from : null);
		if (from) {
			explain(
				s,
				'rerouted',
				`Request #${op.id} timed out on ${from} and was rerouted to ${op.server ?? 'no server yet'}. The balancer learns about failures only at health checks every ${HEALTH_INTERVAL} ticks, so it kept routing to ${from} until then.`,
			);
		}
	}
}

// ------------------------------------------------------------- display ----

export function serverStatus(s: ClusterState, x: Server): string {
	if (x.failed) return 'down';
	if (s.mode === 'replication') return `${x.id === s.leader ? `leader t${s.term}` : 'follower'} · log ${x.log.length}`;
	if (s.mode === 'broadcast') return `v${x.value}`;
	return `queue ${x.queue.length} · ${x.completed} done`;
}

export function metricLabels(mode: ClusterMode): Record<keyof ClusterState['metrics'], string> {
	if (mode === 'replication') return { committed: 'committed', pending: 'pending', delivered: 'messages', rerouted: 'rerouted' };
	if (mode === 'broadcast') return { committed: 'converged', pending: 'spreading', delivered: 'messages', rerouted: 'rerouted' };
	return { committed: 'served', pending: 'waiting', delivered: 'messages', rerouted: 'rerouted' };
}
