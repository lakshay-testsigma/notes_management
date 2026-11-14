import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { Frame, TextButton } from './ui';

export interface CodeToken {
	c: string;
	l?: string;
	d?: string;
}

export interface CodeWalkthroughIslandProps {
	title?: string;
	/** highlighted tokens per line, prepared at build time by CodeWalkthrough.astro */
	lines: CodeToken[][];
	steps: { ranges: [number, number][]; caption: string; title?: string }[];
}

export default function CodeWalkthrough({ title, lines, steps }: CodeWalkthroughIslandProps) {
	const [index, setIndex] = useState(0);
	const scroller = useRef<HTMLPreElement | null>(null);
	const step = steps[index];
	const isOn = (line: number) => !step || step.ranges.some(([a, b]) => line >= a && line <= b);

	// Keep the highlighted lines in view inside the code area (never scrolls the page).
	useEffect(() => {
		const el = scroller.current;
		const first = el?.querySelector<HTMLElement>('.lc-code-line.is-on');
		if (!el || !first) return;
		const top = first.offsetTop - el.offsetTop;
		if (top < el.scrollTop + 8 || top > el.scrollTop + el.clientHeight - 60) el.scrollTop = Math.max(0, top - 48);
	}, [index]);

	const onKey = (event: KeyboardEvent) => {
		if (event.key === 'ArrowRight') setIndex((i) => Math.min(steps.length - 1, i + 1));
		else if (event.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
	};

	return (
		<Frame name="codewalk" title={title}>
			<pre ref={scroller} className={`lc-code ${steps.length ? 'has-steps' : ''}`} tabIndex={0} onKeyDown={onKey} aria-label={title ?? 'Code walkthrough'}>
				<code>
					{lines.map((tokens, i) => (
						<span key={i} className={`lc-code-line ${isOn(i + 1) ? 'is-on' : ''}`}>
							<span className="lc-code-n" aria-hidden="true">
								{i + 1}
							</span>
							<span className="lc-code-text">
								{tokens.map((token, j) => (
									<span key={j} className="lc-tok" style={{ '--l': token.l, '--d': token.d } as CSSProperties}>
										{token.c}
									</span>
								))}
								{'\n'}
							</span>
						</span>
					))}
				</code>
			</pre>
			{steps.length > 0 && (
				<>
					<div className="lc-controls">
						<TextButton onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
							Back
						</TextButton>
						<TextButton onClick={() => setIndex((i) => Math.min(steps.length - 1, i + 1))} disabled={index >= steps.length - 1}>
							Next
						</TextButton>
					</div>
					<p className="lc-caption" aria-live="polite">
						<span className="lc-count">
							Step {index + 1} of {steps.length}
						</span>
						{step.title && <strong>{step.title}. </strong>}
						{step.caption}
					</p>
				</>
			)}
		</Frame>
	);
}
