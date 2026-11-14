import { useEffect, useMemo, useRef, useState } from 'react';
import { GraphCanvas, type Direction, type GEdge, type GNode, type Packet } from './graph';
import { useReducedMotion } from './hooks';
import { Frame, TextButton } from './ui';

interface Move {
	from: string;
	to: string;
	packet?: string;
}

interface StepInput extends Partial<Move> {
	moves?: Move[];
	caption: string;
	fallback?: Partial<Move> & { moves?: Move[]; caption: string };
}

export interface FlowAnimationProps {
	title?: string;
	nodes: GNode[];
	edges?: GEdge[];
	steps: StepInput[];
	breakable?: string[];
	brokenCaptions?: Record<string, string>;
	direction?: Direction;
	intro?: string;
	autoplay?: boolean;
}

interface Resolved {
	moves: (Move & { failed?: boolean })[];
	caption: string;
	halted: boolean;
}

const movesOf = (step: Partial<Move> & { moves?: Move[] }): Move[] =>
	step.moves?.length ? step.moves : step.from && step.to ? [{ from: step.from, to: step.to, packet: step.packet }] : [];

const SPEEDS = [1, 2, 0.5];

export default function FlowAnimation(props: FlowAnimationProps) {
	const { nodes, steps, breakable = [], brokenCaptions = {}, direction } = props;
	const reduced = useReducedMotion();
	const [index, setIndex] = useState(-1);
	const [t, setT] = useState(1);
	const [playing, setPlaying] = useState(false);
	const [speed, setSpeed] = useState(1);
	const [broken, setBroken] = useState<string[]>([]);
	const skipTween = useRef(false);

	const labelOf = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n.label])), [nodes]);

	// Declared edges plus any edge a step (or fallback) needs.
	const edges = useMemo(() => {
		const list: GEdge[] = [...(props.edges ?? [])];
		const has = (m: Move) => list.some((e) => (e.from === m.from && e.to === m.to) || (e.from === m.to && e.to === m.from));
		for (const step of steps) {
			for (const move of [...movesOf(step), ...(step.fallback ? movesOf(step.fallback) : [])]) {
				if (!has(move)) list.push({ from: move.from, to: move.to, dashed: true });
			}
		}
		return list;
	}, [props.edges, steps]);

	const resolve = (step: StepInput): Resolved => {
		const moves = movesOf(step);
		const hit = (list: Move[]) => list.flatMap((m) => [m.from, m.to]).find((id) => broken.includes(id));
		const down = hit(moves);
		if (!down) return { moves, caption: step.caption, halted: false };
		if (step.fallback && !hit(movesOf(step.fallback))) {
			return { moves: movesOf(step.fallback), caption: step.fallback.caption, halted: false };
		}
		// When the fallback is blocked too, name the node that blocks it.
		const blocker = (step.fallback && hit(movesOf(step.fallback))) || down;
		return {
			moves: moves.filter((m) => !broken.includes(m.from)).map((m) => ({ ...m, failed: broken.includes(m.to) })),
			caption: brokenCaptions[blocker] ?? `${labelOf[blocker] ?? blocker} is down, so the flow stops here.`,
			halted: true,
		};
	};

	const resolved = useMemo(
		() => steps.slice(0, Math.max(0, index + 1)).map(resolve),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[steps, index, broken],
	);
	const current = index >= 0 ? resolved[index] : null;
	// A stopped route cannot advance while its last packet is still tweening.
	// Playback waits for t separately; navigation must respect the halt immediately.
	const finished = index >= 0 && (index === steps.length - 1 || current?.halted === true);

	useEffect(() => {
		if (props.autoplay && !reduced) {
			setIndex(0);
			setPlaying(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Tween the packets of the current step.
	useEffect(() => {
		if (index < 0) return;
		if (reduced || skipTween.current) {
			skipTween.current = false;
			setT(1);
			return;
		}
		setT(0);
		const duration = 1150 / speed;
		let frame = 0;
		let start: number | null = null;
		const tick = (now: number) => {
			start ??= now;
			const raw = Math.min(1, (now - start) / duration);
			setT(raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2);
			if (raw < 1) frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [index, broken]);

	// While playing, move on after a short pause on each step.
	useEffect(() => {
		if (!playing || t < 1 || index < 0) return;
		if (finished) {
			setPlaying(false);
			return;
		}
		const timer = setTimeout(() => setIndex((i) => i + 1), (reduced ? 2200 : 1000) / speed);
		return () => clearTimeout(timer);
	}, [playing, t, index, finished, speed, reduced]);

	const edgeIndex = (move: Move) => {
		const forward = edges.findIndex((e) => e.from === move.from && e.to === move.to);
		if (forward !== -1) return { edge: forward, reverse: false };
		return { edge: edges.findIndex((e) => e.from === move.to && e.to === move.from), reverse: true };
	};

	const nodeClass: Record<string, string> = {};
	const edgeClass: Record<number, string> = {};
	const packets: Packet[] = [];
	resolved.forEach((step, i) => {
		const isCurrent = i === index;
		for (const move of step.moves) {
			const { edge, reverse } = edgeIndex(move);
			if (edge === -1) continue;
			edgeClass[edge] = isCurrent ? 'is-active' : edgeClass[edge] === 'is-active' ? 'is-active' : 'is-visited';
			if (isCurrent) {
				if (t < 1) packets.push({ edge, reverse, t, label: move.packet, failed: false });
				else if (move.failed) packets.push({ edge, reverse, t: 0.86, label: move.packet, failed: true });
				nodeClass[move.from] = t < 1 ? 'is-active' : 'is-visited';
				if (t >= 1 && !move.failed) nodeClass[move.to] = 'is-active';
			} else {
				nodeClass[move.from] ??= 'is-visited';
				if (!move.failed) nodeClass[move.to] ??= 'is-visited';
			}
		}
	});
	for (const id of broken) nodeClass[id] = 'is-broken';

	const restart = () => {
		setPlaying(false);
		setIndex(-1);
		setT(1);
	};
	const play = () => {
		if (playing) return setPlaying(false);
		if (finished || index < 0) setIndex(0);
		setPlaying(true);
	};
	const step = () => {
		setPlaying(false);
		if (!finished) setIndex((i) => Math.min(steps.length - 1, i + 1));
	};
	const back = () => {
		setPlaying(false);
		skipTween.current = true;
		setIndex((i) => Math.max(-1, i - 1));
	};
	const toggleBroken = (id: string) => {
		restart();
		setBroken((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
	};

	const intro =
		broken.length > 0
			? `${broken.map((id) => labelOf[id] ?? id).join(' and ')} ${broken.length > 1 ? 'are' : 'is'} switched off. Press Play to see what changes.`
			: (props.intro ?? 'Press Play to watch the whole flow, or Step to move one message at a time.');

	return (
		<Frame name="flow" title={props.title}>
			<GraphCanvas
				nodes={nodes}
				edges={edges}
				direction={direction}
				ariaLabel={props.title ?? 'Animated flow diagram'}
				nodeClass={nodeClass}
				edgeClass={edgeClass}
				packets={packets}
			/>
			<div className="lc-controls">
				<TextButton onClick={play}>{playing ? 'Pause' : finished ? 'Replay' : 'Play'}</TextButton>
				<TextButton onClick={back} disabled={index < 0}>
					Back
				</TextButton>
				<TextButton onClick={step} disabled={finished}>
					Step
				</TextButton>
				<TextButton onClick={restart} disabled={index < 0}>
					Restart
				</TextButton>
				<TextButton onClick={() => setSpeed((s) => SPEEDS[(SPEEDS.indexOf(s) + 1) % SPEEDS.length])} label={`Speed ${speed} times. Change speed`}>
					Speed {speed}×
				</TextButton>
			</div>
			{breakable.length > 0 && (
				<div className="lc-controls lc-break">
					<span className="lc-controls-label">Break a node:</span>
					{breakable.map((id) => (
						<TextButton key={id} pressed={broken.includes(id)} onClick={() => toggleBroken(id)}>
							{labelOf[id] ?? id}
						</TextButton>
					))}
				</div>
			)}
			<p className="lc-caption" aria-live="polite">
				{current ? (
					<>
						<span className="lc-count">
							Step {index + 1} of {steps.length}
						</span>
						{current.caption}
					</>
				) : (
					intro
				)}
			</p>
		</Frame>
	);
}
