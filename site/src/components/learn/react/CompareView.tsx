import { useState } from 'react';
import { sharedMetrics } from './activity-logic';
import { formatNumber, useElementWidth } from './hooks';
import { Frame, TextButton } from './ui';

export interface CompareSide {
	label: string;
	points: string[];
	metrics?: Record<string, number>;
}

export interface CompareViewProps {
	title?: string;
	left: CompareSide;
	right: CompareSide;
	unit?: string;
	lowerIsBetter?: boolean;
	question?: string;
	verdict?: string;
}

/** Below this container width the two sides are shown one at a time. */
const NARROW = 560;

export default function CompareView({ title, left, right, unit = '', lowerIsBetter = false, question, verdict }: CompareViewProps) {
	const [ref, width] = useElementWidth<HTMLDivElement>();
	const [side, setSide] = useState<'left' | 'right'>('left');
	const [shown, setShown] = useState(false);
	const narrow = width !== null && width < NARROW;
	const rows = sharedMetrics(left?.metrics, right?.metrics, lowerIsBetter);
	const sides = { left, right };
	const value = (n: number) => `${formatNumber(n)}${unit ? ` ${unit}` : ''}`;

	const column = (key: 'left' | 'right') => {
		const data = sides[key];
		return (
			<section className="lc-cmp-col" aria-label={data.label} hidden={narrow && side !== key}>
				<h4 className="lc-cmp-label">{data.label}</h4>
				<ul className="lc-cmp-points">
					{(data.points ?? []).map((point, i) => (
						<li key={i}>{point}</li>
					))}
				</ul>
			</section>
		);
	};

	return (
		<Frame name="compare" title={title}>
			<div ref={ref}>
				{question && (
					<p className="lc-prompt">
						<span className="lc-kicker">Compare</span>
						{question}
					</p>
				)}
				{narrow && (
					<div className="lc-controls" role="group" aria-label="Choose a side">
						<TextButton pressed={side === 'left'} onClick={() => setSide('left')}>
							{left.label}
						</TextButton>
						<TextButton pressed={side === 'right'} onClick={() => setSide('right')}>
							{right.label}
						</TextButton>
					</div>
				)}
				<div className={`lc-cmp ${narrow ? 'is-narrow' : ''}`}>
					{column('left')}
					{column('right')}
				</div>
				{rows.length > 0 && (
					<table className="lc-cmp-metrics">
						<caption className="sr-only">
							Measured side by side{lowerIsBetter ? ', lower is better' : ', higher is better'}
						</caption>
						<thead>
							<tr>
								<th scope="col">Measure</th>
								<th scope="col">{left.label}</th>
								<th scope="col">{right.label}</th>
								<th scope="col">Better</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((row) => (
								<tr key={row.name}>
									<th scope="row">{row.name}</th>
									<td>
										<span className={`lc-cmp-bar ${row.winner === 'left' ? 'is-win' : ''}`} style={{ width: `${Math.round(row.leftShare * 100)}%` }} aria-hidden="true" />
										<span className="lc-cmp-value">{value(row.left)}</span>
									</td>
									<td>
										<span className={`lc-cmp-bar ${row.winner === 'right' ? 'is-win' : ''}`} style={{ width: `${Math.round(row.rightShare * 100)}%` }} aria-hidden="true" />
										<span className="lc-cmp-value">{value(row.right)}</span>
									</td>
									<td className="lc-cmp-winner">{row.winner === 'tie' ? 'Tie' : row.winner === 'left' ? left.label : right.label}</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
				{rows.length > 0 && <p className="lc-quiet lc-cmp-note">{lowerIsBetter ? 'Lower is better.' : 'Higher is better.'}</p>}
				{verdict && (
					<>
						<div className="lc-controls">
							<TextButton onClick={() => setShown(true)} disabled={shown}>
								Show the trade-off
							</TextButton>
							<TextButton onClick={() => setShown(false)} disabled={!shown}>
								Reset
							</TextButton>
						</div>
						<div aria-live="polite">{shown && <p className="lc-feedback">{verdict}</p>}</div>
					</>
				)}
			</div>
		</Frame>
	);
}
