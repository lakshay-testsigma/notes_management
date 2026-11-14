import { useEffect, useState } from 'react';
import { wrapLabel } from './graph';
import { useElementWidth, useReducedMotion } from './hooks';
import { Frame, TextButton } from './ui';

type Actor = string | { id: string; label: string };

interface Message {
	from: string;
	to: string;
	label: string;
	note?: string;
	kind?: 'call' | 'reply';
}

export interface SequenceDiagramProps {
	title?: string;
	actors: Actor[];
	messages: Message[];
	autoplay?: boolean;
}

const ROW = 48;
const TOP = 58;

export default function SequenceDiagram({ title, actors, messages, autoplay }: SequenceDiagramProps) {
	const list = actors.map((a) => (typeof a === 'string' ? { id: a, label: a } : a));
	const [ref, measured] = useElementWidth<HTMLDivElement>();
	const reduced = useReducedMotion();
	const [index, setIndex] = useState(-1);
	const [playing, setPlaying] = useState(false);

	const width = measured && measured > 0 ? measured : 704;
	const column = width / Math.max(1, list.length);
	const xOf = (id: string) => {
		const i = list.findIndex((a) => a.id === id);
		return column * ((i === -1 ? 0 : i) + 0.5);
	};
	const height = TOP + messages.length * ROW + 12;
	const done = index >= messages.length - 1;

	useEffect(() => {
		if (autoplay && !reduced) setPlaying(true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!playing) return;
		if (done) {
			setPlaying(false);
			return;
		}
		const timer = setTimeout(() => setIndex((i) => i + 1), index < 0 ? 250 : reduced ? 2200 : 1500);
		return () => clearTimeout(timer);
	}, [playing, index, done, reduced]);

	const current = index >= 0 ? messages[index] : null;
	const nameOf = (id: string) => list.find((a) => a.id === id)?.label ?? id;

	return (
		<Frame name="sequence" title={title}>
			<div ref={ref} className="lc-graph">
				<svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} role="img" aria-label={title ?? 'Sequence diagram'}>
					{list.map((actor) => {
						const x = xOf(actor.id);
						const lines = wrapLabel(actor.label, column - 10, 7.2);
						const talking = current && (current.from === actor.id || current.to === actor.id);
						return (
							<g key={actor.id} className={`lc-seq-actor ${talking ? 'is-active' : ''}`}>
								<text x={x} y={lines.length > 1 ? 14 : 24} textAnchor="middle">
									{lines.map((line, i) => (
										<tspan key={i} x={x} dy={i === 0 ? 0 : '1.2em'}>
											{line}
										</tspan>
									))}
								</text>
								<line x1={x} x2={x} y1={42} y2={height - 4} />
							</g>
						);
					})}
					{messages.map((message, i) => {
						const y = TOP + i * ROW + 22;
						const x1 = xOf(message.from);
						const x2 = xOf(message.to);
						const self = message.from === message.to;
						const dir = x2 >= x1 ? 1 : -1;
						const state = i === index ? 'is-current' : i < index ? 'is-past' : 'is-future';
						const span = self ? width - x1 - 36 : Math.abs(x2 - x1) - 14;
						const text = wrapLabel(message.label, Math.max(span, 40), 6.6, 1)[0];
						const tip = x2 - dir * 2;
						return (
							<g key={i} className={`lc-seq-msg ${state} ${message.kind === 'reply' ? 'is-reply' : ''}`}>
								{self ? (
									<>
										<path d={`M${x1},${y - 8} h22 v14 h-20`} pathLength={i === index ? 1 : undefined} />
										<polygon points={`${x1 + 2},${y + 6} ${x1 + 10},${y + 2} ${x1 + 10},${y + 10}`} />
										<text x={x1 + 30} y={y + 3}>
											{text}
										</text>
									</>
								) : (
									<>
										<path d={`M${x1},${y} L${tip},${y}`} pathLength={i === index ? 1 : undefined} />
										<polygon points={`${tip},${y} ${tip - dir * 9},${y - 4.5} ${tip - dir * 9},${y + 4.5}`} />
										<text x={(x1 + x2) / 2} y={y - 8} textAnchor="middle">
											{text}
										</text>
									</>
								)}
							</g>
						);
					})}
				</svg>
			</div>
			<div className="lc-controls">
				<TextButton
					onClick={() => {
						if (playing) return setPlaying(false);
						if (done) setIndex(-1);
						setPlaying(true);
					}}
				>
					{playing ? 'Pause' : done ? 'Replay' : 'Play'}
				</TextButton>
				<TextButton
					onClick={() => {
						setPlaying(false);
						setIndex((i) => Math.max(-1, i - 1));
					}}
					disabled={index < 0}
				>
					Back
				</TextButton>
				<TextButton
					onClick={() => {
						setPlaying(false);
						setIndex((i) => Math.min(messages.length - 1, i + 1));
					}}
					disabled={done}
				>
					Step
				</TextButton>
				<TextButton
					onClick={() => {
						setPlaying(false);
						setIndex(-1);
					}}
					disabled={index < 0}
				>
					Restart
				</TextButton>
			</div>
			<p className="lc-caption" aria-live="polite">
				{current ? (
					<>
						<span className="lc-count">
							Message {index + 1} of {messages.length}
						</span>
						<strong>
							{nameOf(current.from)} → {nameOf(current.to)}:
						</strong>{' '}
						{current.label}
						{current.note ? `. ${current.note}` : ''}
					</>
				) : (
					'Press Play to watch the messages in order, or Step to send them one at a time.'
				)}
			</p>
		</Frame>
	);
}
