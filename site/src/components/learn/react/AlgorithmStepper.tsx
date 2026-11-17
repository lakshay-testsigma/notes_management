import { useEffect, useId, useState, type KeyboardEvent } from 'react';
import { formatNumber, useReducedMotion } from './hooks';
import { back, clampFrame, forward, playTick, resetStepper, seek, togglePlay, type StepperState } from './stepper';
import { Frame, TextButton } from './ui';

type Cell = number | string;

export interface AlgoFrame {
	caption: string;
	array?: Cell[];
	highlight?: number[];
	pointers?: Record<string, number>;
	vars?: Record<string, string | number>;
	grid?: Cell[][];
	line?: number;
}

export interface AlgorithmStepperProps {
	title?: string;
	frames: AlgoFrame[];
	view?: 'array' | 'bars' | 'grid';
	code?: string;
	lang?: string;
	speed?: number;
	/** Called with a snapshot whenever the frame changes (used by <Experience> checkpoints). */
	onState?: (snapshot: StepperSnapshot) => void;
}

export interface StepperSnapshot {
	frame: number;
	frames: number;
	done: boolean;
	caption: string;
	vars: Record<string, string | number>;
	pointers: Record<string, number>;
}

const show = (value: Cell) => (typeof value === 'number' ? formatNumber(value) : value);

export default function AlgorithmStepper({ title, frames = [], view = 'array', code, lang, speed = 1200, onState }: AlgorithmStepperProps) {
	const count = frames.length;
	const reduced = useReducedMotion();
	const scrubId = useId();
	const [state, setState] = useState<StepperState>(resetStepper);
	const index = clampFrame(state.index, count);
	const frame = frames[index];
	useEffect(() => {
		const f = frames[index];
		if (!f || !onState) return;
		onState({ frame: index, frames: count, done: index === count - 1, caption: f.caption, vars: f.vars ?? {}, pointers: f.pointers ?? {} });
	}, [index, count, frames, onState]);

	useEffect(() => {
		if (!state.playing) return;
		const timer = setTimeout(() => setState((s) => playTick(s, count)), Math.max(250, speed));
		return () => clearTimeout(timer);
	}, [state, count, speed]);

	if (!frame) return <Frame name="algo" title={title}><p className="lc-error">This stepper has no frames.</p></Frame>;

	const onKey = (e: KeyboardEvent<HTMLElement>) => {
		if ((e.target as HTMLElement).tagName === 'INPUT') return;
		if (e.key === 'ArrowRight') {
			e.preventDefault();
			setState((s) => forward(s, count));
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			setState((s) => back(s, count));
		}
	};

	const highlight = new Set(frame.highlight ?? []);
	const pointersAt = (i: number) =>
		Object.entries(frame.pointers ?? {})
			.filter(([, at]) => at === i)
			.map(([name]) => name)
			.join(', ');
	const numbers = (frame.array ?? []).map((v) => (typeof v === 'number' ? v : Number(v)));
	const max = Math.max(1, ...numbers.filter(Number.isFinite).map(Math.abs));
	const vars = Object.entries(frame.vars ?? {});
	const lines = code ? code.replace(/\s+$/, '').split('\n') : [];

	return (
		<Frame name="algo" title={title}>
			<div className={`lc-algo${reduced ? ' is-still' : ''}`} tabIndex={0} onKeyDown={onKey} aria-label={`${title ?? 'Algorithm'} stepper. Use the left and right arrow keys to move between steps.`}>
				{view === 'grid' && frame.grid ? (
					<table className="lc-algo-grid">
						<tbody>
							{frame.grid.map((row, r) => (
								<tr key={r}>
									{row.map((cell, c) => (
										<td key={c} className={highlight.has(r * row.length + c) ? 'is-hot' : undefined}>
											{show(cell)}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				) : frame.array ? (
					<ol className={`lc-algo-cells is-${view === 'bars' ? 'bars' : 'array'}`} aria-label="Values">
						{frame.array.map((value, i) => {
							const pointer = pointersAt(i);
							const height = view === 'bars' && Number.isFinite(numbers[i]) ? Math.max(4, (Math.abs(numbers[i]) / max) * 100) : null;
							return (
								<li key={i} className={highlight.has(i) ? 'is-hot' : undefined}>
									{height !== null && (
										<span className="lc-algo-bar-wrap" aria-hidden="true">
											<span className="lc-algo-bar" style={{ height: `${height}%` }} />
										</span>
									)}
									<span className="lc-algo-value">{show(value)}</span>
									<span className="lc-algo-index">{i}</span>
									<span className="lc-algo-pointer">{pointer}</span>
								</li>
							);
						})}
					</ol>
				) : null}
				{vars.length > 0 && (
					<dl className="lc-algo-vars">
						{vars.map(([name, value]) => (
							<div key={name}>
								<dt>{name}</dt>
								<dd>{typeof value === 'number' ? formatNumber(value) : value}</dd>
							</div>
						))}
					</dl>
				)}
				{lines.length > 0 && (
					<pre className="lc-algo-code" data-lang={lang}>
						{lines.map((text, i) => (
							<span key={i} className={frame.line === i + 1 ? 'is-current' : undefined}>
								{text || ' '}
								{'\n'}
							</span>
						))}
					</pre>
				)}
				<p className="lc-caption" aria-live="polite">
					<span className="lc-count">
						Step {index + 1} of {count}
					</span>
					{frame.caption}
				</p>
			</div>
			<div className="lc-controls">
				<TextButton onClick={() => setState((s) => back(s, count))} disabled={index === 0}>
					Back
				</TextButton>
				<TextButton onClick={() => setState((s) => togglePlay(s, count))} pressed={state.playing} disabled={count <= 1}>
					{state.playing ? 'Pause' : 'Play'}
				</TextButton>
				<TextButton onClick={() => setState((s) => forward(s, count))} disabled={index >= count - 1}>
					Forward
				</TextButton>
				<TextButton onClick={() => setState(resetStepper())} disabled={index === 0 && !state.playing}>
					Reset
				</TextButton>
			</div>
			<label className="lc-slider lc-algo-scrub" htmlFor={scrubId}>
				<span className="lc-slider-label">
					Step {index + 1} of {count}
				</span>
				<input id={scrubId} type="range" min={0} max={Math.max(0, count - 1)} step={1} value={index} onChange={(e) => setState((s) => seek(s, Number(e.target.value), count))} />
			</label>
		</Frame>
	);
}
