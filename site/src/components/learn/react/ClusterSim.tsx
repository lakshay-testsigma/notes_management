import { useEffect, useId, useMemo, useState } from 'react';
import {
	addServer,
	CLIENT,
	createCluster,
	isQuiet,
	MAX_SERVERS,
	metricLabels,
	MIN_SERVERS,
	removeServer,
	reset,
	sendWrite,
	serverStatus,
	setLatency,
	step,
	sync,
	toggleFail,
	type ClusterMode,
	type ClusterState,
} from './cluster-engine';
import { px, useReducedMotion } from './hooks';
import { Frame, TextButton } from './ui';

export interface ClusterSimProps {
	title?: string;
	mode: ClusterMode;
	servers?: number;
	latency?: number;
	failures?: string[];
	intro?: string;
	explain?: Record<string, string>;
	/** Called with a state snapshot after every change (used by <Experience> checkpoints). */
	onState?: (snapshot: ClusterSnapshot) => void;
}

/** The observable state an experience checkpoint can test. */
export interface ClusterSnapshot {
	tick: number;
	mode: ClusterMode;
	leader: string | null;
	term: number;
	latency: number;
	servers: number;
	live: number;
	failed: string[];
	committed: number;
	pending: number;
	delivered: number;
	rerouted: number;
	explanation: string;
	writes: number;
}

export function clusterSnapshot(s: ClusterState): ClusterSnapshot {
	return {
		tick: s.tick,
		mode: s.mode,
		leader: s.leader,
		term: s.term,
		latency: s.latency,
		servers: s.servers.length,
		live: s.servers.filter((x) => !x.failed).length,
		failed: s.servers.filter((x) => x.failed).map((x) => x.id),
		committed: s.metrics.committed,
		pending: s.metrics.pending,
		delivered: s.metrics.delivered,
		rerouted: s.metrics.rerouted,
		explanation: s.explanation.key,
		writes: s.ops.length,
	};
}

const TICK_MS = 750;
const W = 360;
const H = 320;
const CX = W / 2;
const CY = 158;
const RADIUS = 108;
const NODE_R = 22;

const SEND_LABEL: Record<ClusterMode, string> = {
	replication: 'Send write',
	broadcast: 'Send update',
	'load-balance': 'Send request',
};
const CENTER_LABEL: Record<ClusterMode, string> = {
	replication: 'client',
	broadcast: 'client',
	'load-balance': 'balancer',
};

function positions(state: ClusterState): Record<string, { x: number; y: number }> {
	const out: Record<string, { x: number; y: number }> = { [CLIENT]: { x: CX, y: CY } };
	const n = state.servers.length;
	state.servers.forEach((s, i) => {
		const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
		out[s.id] = { x: px(CX + RADIUS * Math.cos(angle)), y: px(CY + RADIUS * Math.sin(angle)) };
	});
	return out;
}

export default function ClusterSim(props: ClusterSimProps) {
	const { title, mode, intro } = props;
	const config = useMemo(
		() => ({ mode, servers: props.servers, latency: props.latency, failures: props.failures, explain: props.explain }),
		[mode, props.servers, props.latency, props.failures, props.explain],
	);
	const reduced = useReducedMotion();
	const sliderId = useId();
	const [state, setState] = useState<ClusterState>(() => createCluster(config));
	const [playing, setPlaying] = useState(false);
	const [phase, setPhase] = useState(0);
	const { onState } = props;
	useEffect(() => {
		onState?.(clusterSnapshot(state));
	}, [state, onState]);

	// The clock: one tick every TICK_MS. Messages glide between ticks unless the
	// learner asked for less motion; then they jump once per tick.
	useEffect(() => {
		if (!playing) return;
		if (isQuiet(state)) {
			setPlaying(false);
			setPhase(0);
			return;
		}
		if (reduced) {
			const timer = setTimeout(() => setState((s) => step(s)), TICK_MS);
			return () => clearTimeout(timer);
		}
		let start: number | null = null;
		let frame = 0;
		const loop = (now: number) => {
			start ??= now;
			const p = (now - start) / TICK_MS;
			if (p >= 1) {
				setPhase(0);
				setState((s) => step(s));
				return;
			}
			setPhase(p);
			frame = requestAnimationFrame(loop);
		};
		frame = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(frame);
	}, [playing, state, reduced]);

	const act = (fn: (s: ClusterState) => ClusterState, play = true) => {
		setPhase(0);
		setState((s) => fn(s));
		if (play) setPlaying(true);
	};

	const pos = positions(state);
	const labels = metricLabels(mode);
	const servers = state.servers;
	const live = servers.filter((s) => !s.failed).length;
	const mesh = mode !== 'load-balance';

	const dots = state.messages.map((m) => {
		const a = pos[m.from];
		const b = pos[m.to];
		if (!a || !b) return null;
		const span = Math.max(1, m.arriveAt - m.sentAt);
		const t = Math.min(1, Math.max(0, (state.tick + (reduced ? 0 : phase) - m.sentAt) / span));
		return { id: m.id, kind: m.kind, x: px(a.x + (b.x - a.x) * t), y: px(a.y + (b.y - a.y) * t) };
	});

	return (
		<Frame name="sim" title={title}>
			{intro && <p className="lc-sim-intro">{intro}</p>}
			{mode === 'replication' && (
				<p className="lc-quiet lc-sim-note">Simplified teaching model: real Raft also compares log freshness during elections.</p>
			)}
			<div className="lc-sim-stage">
				<svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={`${title ?? 'Cluster simulation'}: ${live} of ${servers.length} servers up`}>
					<g className="lc-sim-edges" aria-hidden="true">
						{servers.map((s) => (
							<line key={`c-${s.id}`} x1={CX} y1={CY} x2={pos[s.id].x} y2={pos[s.id].y} />
						))}
						{mesh &&
							servers.flatMap((a, i) =>
								servers.slice(i + 1).map((b) => (
									<line key={`${a.id}-${b.id}`} className="is-mesh" x1={pos[a.id].x} y1={pos[a.id].y} x2={pos[b.id].x} y2={pos[b.id].y} />
								)),
							)}
					</g>
					<g className="lc-sim-client" aria-hidden="true">
						<rect x={CX - 34} y={CY - 13} width={68} height={26} rx={13} />
						<text x={CX} y={CY + 4.5} textAnchor="middle">
							{CENTER_LABEL[mode]}
						</text>
					</g>
					{servers.map((s) => {
						const p = pos[s.id];
						const status = serverStatus(state, s);
						const isLeader = mode === 'replication' && s.id === state.leader && !s.failed;
						const below = p.y >= CY;
						return (
							<g
								key={s.id}
								className={`lc-sim-node${s.failed ? ' is-failed' : ''}${isLeader ? ' is-leader' : ''}`}
								role="button"
								tabIndex={0}
								aria-label={`${s.id}, ${status}. Press to ${s.failed ? 'recover' : 'fail'} it.`}
								onClick={() => act((st) => toggleFail(st, s.id))}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										act((st) => toggleFail(st, s.id));
									}
								}}
							>
								<circle cx={p.x} cy={p.y} r={NODE_R} />
								<text x={p.x} y={p.y + 4.5} textAnchor="middle" className="lc-sim-id">
									{s.id}
								</text>
								<text x={p.x} y={below ? p.y + NODE_R + 14 : p.y - NODE_R - 7} textAnchor="middle" className="lc-sim-status">
									{status}
								</text>
							</g>
						);
					})}
					<g aria-hidden="true">
						{dots.map((d) => d && <circle key={d.id} className={`lc-sim-msg is-${d.kind}`} cx={d.x} cy={d.y} r={5} />)}
					</g>
				</svg>
			</div>
			<div className="lc-controls">
				<TextButton onClick={() => act((s) => sendWrite(s, 1))}>{SEND_LABEL[mode]}</TextButton>
				<TextButton onClick={() => act((s) => sendWrite(s, 3))}>Send 3 at once</TextButton>
				{mode === 'broadcast' && <TextButton onClick={() => act((s) => sync(s), false)}>Sync</TextButton>}
				<TextButton onClick={() => act((s) => addServer(s), mode === 'replication')} disabled={servers.length >= MAX_SERVERS}>
					Add server
				</TextButton>
				<TextButton onClick={() => act((s) => removeServer(s), mode === 'replication')} disabled={servers.length <= MIN_SERVERS}>
					Remove server
				</TextButton>
			</div>
			<div className="lc-controls">
				<TextButton onClick={() => setPlaying((p) => !p)} pressed={playing}>
					{playing ? 'Pause' : 'Play'}
				</TextButton>
				<TextButton
					onClick={() => {
						setPlaying(false);
						setPhase(0);
						setState((s) => step(s));
					}}
				>
					Step
				</TextButton>
				<TextButton
					onClick={() => {
						setPlaying(false);
						setPhase(0);
						setState((s) => reset(s));
					}}
				>
					Reset
				</TextButton>
				<span className="lc-controls-note lc-quiet">Select a server to fail or recover it.</span>
			</div>
			<label className="lc-slider lc-sim-latency" htmlFor={sliderId}>
				<span className="lc-slider-label">
					Message latency
					<strong>
						{state.latency} {state.latency === 1 ? 'tick' : 'ticks'}
					</strong>
				</span>
				<input id={sliderId} type="range" min={1} max={5} step={1} value={state.latency} onChange={(e) => act((s) => setLatency(s, Number(e.target.value)), false)} />
			</label>
			<p className="lc-sim-metrics">
				{(Object.keys(labels) as (keyof typeof labels)[]).map((key) => (
					<span key={key}>
						<span className="lc-quiet">{labels[key]}</span> <strong>{state.metrics[key]}</strong>
					</span>
				))}
				<span>
					<span className="lc-quiet">tick</span> <strong>{state.tick}</strong>
				</span>
			</p>
			<p className="lc-detail lc-sim-why">
				<strong>Why: </strong>
				{state.explanation.text}
			</p>
			<ol className="lc-sim-log" aria-live="polite" aria-label="Event log">
				{state.events.length === 0 ? <li className="lc-quiet">No events yet.</li> : state.events.map((event, i) => <li key={`${i}-${event}`}>{event}</li>)}
			</ol>
		</Frame>
	);
}
