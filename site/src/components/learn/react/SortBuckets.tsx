import { useMemo, useState, type DragEvent } from 'react';
import { gradeSort, initialPool, type SortItem } from './activity-logic';
import { Frame, TextButton } from './ui';

export interface SortBucketsProps {
	prompt: string;
	buckets: string[];
	items: SortItem[];
	explanation?: string;
}

export default function SortBuckets({ prompt, buckets, items, explanation }: SortBucketsProps) {
	const pool = useMemo(() => initialPool(prompt, items), [prompt, items]);
	/** item index -> bucket name */
	const [placement, setPlacement] = useState<Record<number, string | undefined>>({});
	/** order in which items were placed, so each bucket lists them stably */
	const [order, setOrder] = useState<number[]>([]);
	const [checked, setChecked] = useState(false);
	const [dragging, setDragging] = useState<number | null>(null);
	const [over, setOver] = useState<string | null>(null);

	const grade = gradeSort(items, placement);
	const unplaced = pool.filter((i) => placement[i] === undefined);
	const place = (item: number, bucket: string | undefined) => {
		setChecked(false);
		setPlacement((current) => ({ ...current, [item]: bucket }));
		setOrder((current) => [...current.filter((i) => i !== item), ...(bucket === undefined ? [] : [item])]);
	};

	const dropTarget = (bucket: string | undefined) => ({
		onDragOver: (event: DragEvent<HTMLElement>) => {
			event.preventDefault();
			setOver(bucket ?? '');
		},
		onDragLeave: () => setOver(null),
		onDrop: (event: DragEvent<HTMLElement>) => {
			event.preventDefault();
			const item = Number(event.dataTransfer.getData('text/plain'));
			if (Number.isInteger(item) && item >= 0 && item < items.length) place(item, bucket);
			setDragging(null);
			setOver(null);
		},
	});

	const chip = (item: number) => {
		const verdict = checked && placement[item] !== undefined ? (grade.verdicts[item] ? 'is-right' : 'is-wrong') : '';
		return (
			<li
				key={item}
				className={`lc-sort-item ${verdict} ${dragging === item ? 'is-dragging' : ''}`}
				draggable
				onDragStart={(event) => {
					event.dataTransfer.setData('text/plain', String(item));
					event.dataTransfer.effectAllowed = 'move';
					setDragging(item);
				}}
				onDragEnd={() => {
					setDragging(null);
					setOver(null);
				}}
			>
				<span className="lc-sort-text">
					{items[item].text}
					{verdict && <span className={`lc-verdict ${verdict}`}>{verdict === 'is-right' ? ' — right' : ` — belongs in ${items[item].bucket}`}</span>}
				</span>
				<span className="lc-sort-moves" role="group" aria-label={`Move "${items[item].text}"`}>
					{buckets
						.filter((bucket) => bucket !== placement[item])
						.map((bucket) => (
							<button key={bucket} type="button" className="lc-btn" onClick={() => place(item, bucket)} aria-label={`Put "${items[item].text}" in ${bucket}`}>
								{bucket}
							</button>
						))}
					{placement[item] !== undefined && (
						<button type="button" className="lc-btn" onClick={() => place(item, undefined)} aria-label={`Take "${items[item].text}" back out`}>
							Back
						</button>
					)}
				</span>
			</li>
		);
	};

	return (
		<Frame name="sortbuckets">
			<p className="lc-prompt">
				<span className="lc-kicker">Sort into groups</span>
				{prompt} <span className="lc-quiet">Drag each item into a group, or use the group names beside it.</span>
			</p>
			<section className={`lc-sort-pool ${over === '' ? 'is-over' : ''}`} aria-label="Not sorted yet" {...dropTarget(undefined)}>
				<h4 className="lc-sort-heading">
					Not sorted yet <span className="lc-quiet">({unplaced.length})</span>
				</h4>
				{unplaced.length === 0 ? <p className="lc-quiet">Every item is in a group.</p> : <ul className="lc-sort-list">{unplaced.map(chip)}</ul>}
			</section>
			<div className="lc-sort-buckets" style={{ gridTemplateColumns: `repeat(${Math.min(buckets.length, 4)}, minmax(0, 1fr))` }}>
				{buckets.map((bucket) => {
					const inside = order.filter((i) => placement[i] === bucket);
					return (
						<section key={bucket} className={`lc-sort-bucket ${over === bucket ? 'is-over' : ''}`} aria-label={bucket} {...dropTarget(bucket)}>
							<h4 className="lc-sort-heading">
								{bucket} <span className="lc-quiet">({inside.length})</span>
							</h4>
							{inside.length === 0 ? <p className="lc-quiet lc-sort-empty">Drop items here.</p> : <ul className="lc-sort-list">{inside.map(chip)}</ul>}
						</section>
					);
				})}
			</div>
			<div className="lc-controls">
				<TextButton onClick={() => setChecked(true)} disabled={grade.placed === 0}>
					Check
				</TextButton>
				<TextButton
					onClick={() => {
						setPlacement({});
						setOrder([]);
						setChecked(false);
					}}
					disabled={grade.placed === 0}
				>
					Reset
				</TextButton>
			</div>
			<div aria-live="polite">
				{checked && (
					<div className="lc-feedback">
						<p>
							<strong className={grade.correct === grade.total ? 'lc-good' : 'lc-bad'}>
								{grade.correct === grade.total ? 'All sorted correctly.' : `${grade.correct} of ${grade.total} are in the right group.`}
							</strong>
							{grade.placed < grade.total && ` ${grade.total - grade.placed} not sorted yet.`}
						</p>
						{explanation && <p>{explanation}</p>}
					</div>
				)}
			</div>
		</Frame>
	);
}
