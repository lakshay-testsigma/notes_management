import { useEffect, useState } from 'react';

type Grade = 'again' | 'hard' | 'good' | 'easy';

interface Card {
	id: string;
	/** HTML rendered from the vault note at build time */
	question: string;
	answer: string;
}

interface Props {
	topicId: string;
	topicTitle: string;
	cards: Card[];
}

interface RecallEvent { id: string; card_id: string; grade: Grade; at: string; }
interface Saved {
	events?: RecallEvent[];
	grades: Record<string, { grade: Grade; at: string }>;
}

const GRADES: { id: Grade; label: string }[] = [
	{ id: 'again', label: 'Again' },
	{ id: 'hard', label: 'Hard' },
	{ id: 'good', label: 'Good' },
	{ id: 'easy', label: 'Easy' },
];

/** The recall page: question, reveal, self-grade. Progress stays in this browser. */
export default function RecallDeck({ topicId, cards }: Props) {
	const storageKey = `tutor:recall:${topicId}`;
	const [queue, setQueue] = useState<string[]>(cards.map((c) => c.id));
	const [position, setPosition] = useState(0);
	const [revealed, setRevealed] = useState(false);
	const [saved, setSaved] = useState<Saved>({ grades: {} });
	const [session, setSession] = useState<Record<string, Grade>>({});
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		try {
			const raw = localStorage.getItem(storageKey);
			if (raw) {
				const parsed = JSON.parse(raw) as Saved;
				if (parsed && typeof parsed.grades === 'object') setSaved({...parsed,events:parsed.events??Object.entries(parsed.grades).map(([id,g])=>({id:`legacy:${topicId}:${id}:${g.at}:${g.grade}`,card_id:id,grade:g.grade,at:g.at+'T00:00:00Z'}))});
			}
		} catch {
			// No storage: the deck still works, it just does not remember.
		}
	}, [storageKey]);

	const card = cards.find((c) => c.id === queue[position]);
	const finished = position >= queue.length;

	const grade = (value: Grade) => {
		if (!card) return;
		const event: RecallEvent={id:crypto.randomUUID(),card_id:card.id,grade:value,at:new Date().toISOString()};
		const next: Saved = { events:[...(saved.events??[]),event], grades: { ...saved.grades, [card.id]: { grade: value, at: new Date().toISOString().slice(0, 10) } } };
		setSaved(next);
		setSession((s) => ({ ...s, [card.id]: value }));
		try {
			localStorage.setItem(storageKey, JSON.stringify(next));
		} catch {
			// Ignore: grading continues for this visit.
		}
		setRevealed(false);
		setPosition((p) => p + 1);
	};

	const exportEvents = () => {
		const blob=new Blob([JSON.stringify({schema:1,topic:topicId,events:saved.events??[]},null,2)],{type:'application/json'});
		const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='recall-events.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
	};

	const restart = (ids: string[]) => {
		setQueue(ids);
		setPosition(0);
		setRevealed(false);
		setSession({});
		setCopied(false);
	};

	if (cards.length === 0) return <p>No recall cards have been written for this topic yet.</p>;

	if (finished) {
		const weak = cards.filter((c) => session[c.id] === 'again' || session[c.id] === 'hard');
		const counts = GRADES.map((g) => ({ ...g, n: Object.values(session).filter((v) => v === g.id).length })).filter((g) => g.n > 0);
		const commands = `node harness/bin/tutor.mjs recall import ${topicId} --file recall-events.json`;
		return (
			<div className="recall">
				<p>
					<strong>Done.</strong> You went through {Object.keys(session).length} card{Object.keys(session).length === 1 ? '' : 's'}:{' '}
					{counts.map((g) => `${g.n} ${g.label.toLowerCase()}`).join(', ')}.
				</p>
				<p>Export your review history to save it with your notes. Import it with <code>node harness/bin/tutor.mjs recall import {topicId} --file recall-events.json</code>. Repeated imports are safe.</p>
				{weak.length > 0 && (
					<>
						<p>These are worth another look:</p>
						<ul>
							{weak.map((c) => (
								<li key={c.id} dangerouslySetInnerHTML={{ __html: c.question }} />
							))}
						</ul>
					</>
				)}
				<div className="lc-controls">
					<button type="button" className="lc-btn" onClick={exportEvents}>Export review history</button>
					<button type="button" className="lc-btn" onClick={() => restart(cards.map((c) => c.id))}>
						Go through all cards again
					</button>
					{weak.length > 0 && weak.length < cards.length && (
						<button type="button" className="lc-btn" onClick={() => restart(weak.map((c) => c.id))}>
							Only the ones I missed
						</button>
					)}
				</div>
				<p className="lc-quiet">
					Export your history, then run this from the repository root to add it to the review schedule:
				</p>
				<pre className="recall-commands">{commands}</pre>
				<div className="lc-controls">
					<button
						type="button"
						className="lc-btn"
						onClick={() => {
							navigator.clipboard?.writeText(commands).then(
								() => setCopied(true),
								() => setCopied(false),
							);
						}}
					>
						{copied ? 'Copied' : 'Copy commands'}
					</button>
				</div>
			</div>
		);
	}

	if (!card) return null;
	const last = saved.grades[card.id];

	return (
		<div className="recall">
			<p className="lc-count recall-progress">
				Card {position + 1} of {queue.length}
				{last && !session[card.id] ? ` · last time: ${last.grade} (${last.at})` : ''}
			</p>
			<div className="recall-question" dangerouslySetInnerHTML={{ __html: card.question }} />
			<div aria-live="polite">
				{revealed ? (
					<>
						<div className="recall-answer" dangerouslySetInnerHTML={{ __html: card.answer }} />
						<div className="lc-controls">
							<span className="lc-controls-label">How well did you know it?</span>
							{GRADES.map((g) => (
								<button key={g.id} type="button" className="lc-btn" onClick={() => grade(g.id)}>
									{g.label}
								</button>
							))}
						</div>
					</>
				) : (
					<div className="lc-controls">
						<button type="button" className="lc-btn recall-reveal" onClick={() => setRevealed(true)}>
							Show the answer
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
