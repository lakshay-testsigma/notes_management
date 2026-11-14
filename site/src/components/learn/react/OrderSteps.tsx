import { useMemo, useRef, useState, type PointerEvent } from 'react';
import { hashString, seededShuffle } from './hooks';
import { Frame, TextButton } from './ui';

export interface OrderStepsProps {
	prompt?: string;
	/** The steps in their correct order. They are shown shuffled. */
	steps: string[];
}

export default function OrderSteps({ prompt = 'Put these steps in the right order.', steps }: OrderStepsProps) {
	const shuffled = useMemo(
		() =>
			seededShuffle(
				steps.map((_, i) => i),
				hashString(steps.join('|')),
			),
		[steps],
	);
	const [order, setOrder] = useState<number[]>(shuffled);
	const [checked, setChecked] = useState(false);
	const [dragging, setDragging] = useState<number | null>(null);
	const list = useRef<HTMLOListElement | null>(null);
	const allRight = order.every((item, position) => item === position);

	const move = (from: number, to: number) => {
		if (to < 0 || to >= order.length || from === to) return;
		setChecked(false);
		setOrder((current) => {
			const next = [...current];
			const [item] = next.splice(from, 1);
			next.splice(to, 0, item);
			return next;
		});
	};

	const onDragStart = (event: PointerEvent<HTMLSpanElement>, position: number) => {
		event.currentTarget.setPointerCapture(event.pointerId);
		setDragging(position);
	};
	const onDragMove = (event: PointerEvent<HTMLSpanElement>) => {
		if (dragging === null || !list.current) return;
		const rows = [...list.current.children] as HTMLElement[];
		const over = rows.findIndex((row) => {
			const box = row.getBoundingClientRect();
			return event.clientY >= box.top && event.clientY <= box.bottom;
		});
		if (over !== -1 && over !== dragging) {
			move(dragging, over);
			setDragging(over);
		}
	};

	return (
		<Frame name="ordersteps">
			<p className="lc-prompt">
				<span className="lc-kicker">Put in order</span>
				{prompt}
			</p>
			<ol className="lc-order" ref={list}>
				{order.map((item, position) => {
					const verdict = checked ? (item === position ? 'is-right' : 'is-wrong') : '';
					return (
						<li key={item} className={`${verdict} ${dragging === position ? 'is-dragging' : ''}`}>
							<span
								className="lc-grip"
								aria-hidden="true"
								onPointerDown={(e) => onDragStart(e, position)}
								onPointerMove={onDragMove}
								onPointerUp={() => setDragging(null)}
								onPointerCancel={() => setDragging(null)}
							>
								<svg viewBox="0 0 10 16" width="10" height="16">
									<circle cx="2" cy="3" r="1.3" />
									<circle cx="8" cy="3" r="1.3" />
									<circle cx="2" cy="8" r="1.3" />
									<circle cx="8" cy="8" r="1.3" />
									<circle cx="2" cy="13" r="1.3" />
									<circle cx="8" cy="13" r="1.3" />
								</svg>
							</span>
							<span className="lc-order-n">{position + 1}</span>
							<span className="lc-order-text">
								{steps[item]}
								{verdict && <span className={`lc-verdict ${verdict}`}>{verdict === 'is-right' ? ' — right place' : ' — wrong place'}</span>}
							</span>
							<span className="lc-order-moves">
								<button type="button" className="lc-btn" onClick={() => move(position, position - 1)} disabled={position === 0} aria-label={`Move "${steps[item]}" up`}>
									Up
								</button>
								<button
									type="button"
									className="lc-btn"
									onClick={() => move(position, position + 1)}
									disabled={position === order.length - 1}
									aria-label={`Move "${steps[item]}" down`}
								>
									Down
								</button>
							</span>
						</li>
					);
				})}
			</ol>
			<div className="lc-controls">
				<TextButton onClick={() => setChecked(true)}>Check order</TextButton>
				{checked && !allRight && (
					<TextButton
						onClick={() => {
							setOrder(steps.map((_, i) => i));
							setChecked(true);
						}}
					>
						Show the answer
					</TextButton>
				)}
				<TextButton
					onClick={() => {
						setOrder(shuffled);
						setChecked(false);
					}}
				>
					Shuffle again
				</TextButton>
			</div>
			<div aria-live="polite">
				{checked && (
					<p className="lc-feedback">
						<strong className={allRight ? 'lc-good' : 'lc-bad'}>{allRight ? 'That is the right order.' : 'Not yet.'}</strong>
						{!allRight && ` ${order.filter((item, position) => item === position).length} of ${order.length} steps are in the right place.`}
					</p>
				)}
			</div>
		</Frame>
	);
}
