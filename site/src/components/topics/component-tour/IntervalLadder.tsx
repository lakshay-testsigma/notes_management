import { useState } from 'react';

/**
 * Topic-specific component for the Component Tour fixture: one recall card
 * moving through the review boxes of the tutor's spaced-review schedule.
 *
 * It shows the pattern for every topic component: a default-exported React
 * component, no required props, styled with the site's CSS tokens and the
 * shared `lc-*` classes, imported in the lesson with the `@topics/` alias.
 */
const INTERVALS = [1, 3, 7, 16, 35, 90, 180, 365];

export default function IntervalLadder() {
	const [box, setBox] = useState(0);

	return (
		<div className="lc" style={{ margin: 0 }}>
			<svg viewBox="0 0 640 110" width="100%" role="img" aria-label={`Review box ${box + 1} of ${INTERVALS.length}: next review in ${INTERVALS[box]} days`}>
				<line x1="40" x2="600" y1="46" y2="46" stroke="var(--line)" strokeWidth="2" />
				{INTERVALS.map((days, i) => {
					const x = 40 + (i * 560) / (INTERVALS.length - 1);
					const active = i === box;
					return (
						<g key={days}>
							<circle
								cx={x}
								cy={46}
								r={active ? 13 : 7}
								fill={active ? 'var(--accent)' : i < box ? 'var(--line-strong)' : 'var(--bg)'}
								stroke={active ? 'var(--accent)' : 'var(--line-strong)'}
								strokeWidth="2"
								style={{ transition: 'r 0.25s, fill 0.25s' }}
							/>
							<text x={x} y={86} textAnchor="middle" fontSize="13" fill={active ? 'var(--text)' : 'var(--muted)'} fontWeight={active ? 700 : 400}>
								{days}d
							</text>
						</g>
					);
				})}
			</svg>
			<div className="lc-controls">
				<span className="lc-controls-label">Grade the card:</span>
				<button type="button" className="lc-btn" onClick={() => setBox(0)}>
					Again
				</button>
				<button type="button" className="lc-btn" onClick={() => setBox((b) => Math.min(INTERVALS.length - 1, b + 1))}>
					Good
				</button>
			</div>
			<p className="lc-caption" aria-live="polite">
				Box {box + 1} of {INTERVALS.length}. The card comes back in {INTERVALS[box]} day{INTERVALS[box] === 1 ? '' : 's'}.
			</p>
		</div>
	);
}
