import { useEffect, useMemo, useRef, useState } from 'react';
import { GraphCanvas, type Direction, type GEdge, type GNode, type Packet } from './graph';
import { useReducedMotion } from './hooks';
import { Frame, TextButton } from './ui';

interface Transition {
	from: string;
	to: string;
	event: string;
	detail?: string;
}

export interface StateMachineProps {
	title?: string;
	states: GNode[];
	transitions: Transition[];
	/** id of the starting state (default: the first state) */
	initial?: string;
	direction?: Direction;
}

export default function StateMachine({ title, states, transitions, initial, direction }: StateMachineProps) {
	const start = initial ?? states[0]?.id ?? '';
	const reduced = useReducedMotion();
	const [history, setHistory] = useState<string[]>([start]);
	const [moving, setMoving] = useState<{ edge: number; t: number; to: string } | null>(null);
	const [lastDetail, setLastDetail] = useState<string | null>(null);
	const frame = useRef(0);
	const current = history[history.length - 1];

	// One drawn edge per from/to pair; several events on the same pair share it.
	const edges = useMemo(() => {
		const list: GEdge[] = [];
		for (const tr of transitions) {
			const existing = list.find((e) => e.from === tr.from && e.to === tr.to);
			if (existing) existing.label = `${existing.label}, ${tr.event}`;
			else list.push({ from: tr.from, to: tr.to, label: tr.event });
		}
		return list;
	}, [transitions]);

	useEffect(() => () => cancelAnimationFrame(frame.current), []);

	const labelOf = (id: string) => states.find((s) => s.id === id)?.label ?? id;
	const state = states.find((s) => s.id === current);
	const available = moving ? [] : transitions.filter((tr) => tr.from === current);

	const fire = (tr: Transition) => {
		const edge = edges.findIndex((e) => e.from === tr.from && e.to === tr.to);
		const arrive = () => {
			setMoving(null);
			setHistory((h) => [...h, tr.to]);
			setLastDetail(tr.detail ?? null);
		};
		if (reduced || edge === -1) return arrive();
		let startTime: number | null = null;
		const tick = (now: number) => {
			startTime ??= now;
			const t = Math.min(1, (now - startTime) / 520);
			if (t >= 1) return arrive();
			setMoving({ edge, t, to: tr.to });
			frame.current = requestAnimationFrame(tick);
		};
		frame.current = requestAnimationFrame(tick);
	};

	const nodeClass: Record<string, string> = { [current]: 'is-selected' };
	for (const id of history.slice(0, -1)) nodeClass[id] ??= 'is-visited';
	const edgeClass: Record<number, string> = {};
	edges.forEach((edge, i) => {
		if (moving?.edge === i) edgeClass[i] = 'is-active';
		else if (edge.from === current) edgeClass[i] = 'is-visited';
	});
	const packets: Packet[] = moving ? [{ edge: moving.edge, t: moving.t }] : [];

	return (
		<Frame name="state" title={title}>
			<GraphCanvas
				nodes={states}
				edges={edges}
				direction={direction}
				ariaLabel={title ?? 'State machine'}
				nodeClass={nodeClass}
				edgeClass={edgeClass}
				packets={packets}
			/>
			<div className="lc-controls">
				<span className="lc-controls-label">{available.length > 0 ? 'Send an event:' : moving ? 'Moving…' : 'No events leave this state.'}</span>
				{available.map((tr, i) => (
					<TextButton key={`${tr.event}-${tr.to}-${i}`} onClick={() => fire(tr)}>
						{tr.event}
					</TextButton>
				))}
				<TextButton
					onClick={() => {
						setHistory([start]);
						setLastDetail(null);
					}}
					disabled={history.length < 2}
				>
					Reset
				</TextButton>
			</div>
			<div className="lc-detail" aria-live="polite">
				<p>
					<strong>{labelOf(current)}.</strong> {lastDetail ?? state?.detail ?? ''}
					{lastDetail && state?.detail ? ` ${state.detail}` : ''}
				</p>
				<p className="lc-quiet">Path so far: {history.map(labelOf).join(' → ')}</p>
			</div>
		</Frame>
	);
}
