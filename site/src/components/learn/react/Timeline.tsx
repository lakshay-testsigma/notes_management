import { useState, type KeyboardEvent } from 'react';
import { useElementWidth } from './hooks';
import { Frame, TextButton } from './ui';

interface TimelineEvent {
	when: string;
	title: string;
	detail?: string;
}

export interface TimelineProps {
	title?: string;
	events: TimelineEvent[];
	/** index of the event that starts selected (default 0) */
	initial?: number;
}

export default function Timeline({ title, events, initial = 0 }: TimelineProps) {
	const [selected, setSelected] = useState(Math.min(Math.max(0, initial), Math.max(0, events.length - 1)));
	const [ref, measured] = useElementWidth<HTMLDivElement>();
	const width = measured && measured > 0 ? measured : 704;
	// Show every date when they fit; otherwise only the ends and the selected one.
	const roomy = width / Math.max(1, events.length) >= 78;
	const event = events[selected];

	const onKey = (e: KeyboardEvent) => {
		const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
		if (!delta) return;
		e.preventDefault();
		const next = Math.min(events.length - 1, Math.max(0, selected + delta));
		setSelected(next);
		ref.current?.querySelectorAll<HTMLButtonElement>('button.lc-tl-stop')[next]?.focus();
	};

	return (
		<Frame name="timeline" title={title}>
			<div ref={ref} className="lc-tl-track" role="group" aria-label={title ?? 'Timeline'} onKeyDown={onKey}>
				{events.map((item, i) => (
					<button
						key={i}
						type="button"
						className={`lc-tl-stop ${i === selected ? 'is-selected' : ''} ${i < selected ? 'is-past' : ''}`}
						aria-pressed={i === selected}
						aria-label={`${item.when}: ${item.title}`}
						onClick={() => setSelected(i)}
					>
						<span className="lc-tl-dot" aria-hidden="true" />
						<span className={`lc-tl-when ${roomy || i === selected ? '' : 'is-hidden'}`} aria-hidden="true">
							{item.when}
						</span>
					</button>
				))}
			</div>
			{event && (
				<div className="lc-detail" aria-live="polite">
					<p>
						<span className="lc-count">{event.when}</span>
						<strong>{event.title}.</strong> {event.detail}
					</p>
				</div>
			)}
			<div className="lc-controls">
				<TextButton onClick={() => setSelected((s) => Math.max(0, s - 1))} disabled={selected === 0}>
					Earlier
				</TextButton>
				<TextButton onClick={() => setSelected((s) => Math.min(events.length - 1, s + 1))} disabled={selected >= events.length - 1}>
					Later
				</TextButton>
			</div>
		</Frame>
	);
}
