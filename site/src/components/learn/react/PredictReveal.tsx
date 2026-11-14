import { useId, useState } from 'react';
import { Frame, TextButton } from './ui';

export interface PredictRevealProps {
	prompt: string;
	/** Choices to predict from. Leave out to let the learner type a prediction. */
	options?: string[];
	/** index of the option that turns out to be true (optional) */
	correct?: number;
	answer: string;
	reasoning?: string;
}

export default function PredictReveal({ prompt, options, correct, answer, reasoning }: PredictRevealProps) {
	const [choice, setChoice] = useState<number | null>(null);
	const [text, setText] = useState('');
	const [locked, setLocked] = useState(false);
	const id = useId();
	const ready = options?.length ? choice !== null : text.trim().length > 0;
	const prediction = options?.length ? (choice !== null ? options[choice] : '') : text.trim();

	return (
		<Frame name="predict">
			<p className="lc-prompt">
				<span className="lc-kicker">Predict first</span>
				{prompt}
			</p>
			{!locked &&
				(options?.length ? (
					<div className="lc-options" role="radiogroup" aria-label={prompt}>
						{options.map((option, i) => (
							<button
								key={i}
								type="button"
								role="radio"
								aria-checked={choice === i}
								className={`lc-option ${choice === i ? 'is-picked' : ''}`}
								onClick={() => setChoice(i)}
							>
								<span className="lc-option-mark" aria-hidden="true" />
								<span>{option}</span>
							</button>
						))}
					</div>
				) : (
					<>
						<label className="sr-only" htmlFor={id}>
							Your prediction
						</label>
						<textarea
							id={id}
							className="lc-input"
							rows={2}
							placeholder="Type what you think will happen…"
							value={text}
							onChange={(e) => setText(e.target.value)}
						/>
					</>
				))}
			<div className="lc-controls">
				{locked ? (
					<TextButton
						onClick={() => {
							setLocked(false);
							setChoice(null);
							setText('');
						}}
					>
						Predict again
					</TextButton>
				) : (
					<TextButton onClick={() => setLocked(true)} disabled={!ready}>
						Lock in my prediction
					</TextButton>
				)}
			</div>
			<div aria-live="polite">
				{locked && (
					<div className="lc-feedback">
						<p>
							<span className="lc-quiet">You predicted:</span> {prediction}
							{options?.length && typeof correct === 'number' && (
								<strong className={choice === correct ? 'lc-good' : 'lc-bad'}>{choice === correct ? ' — that is what happens.' : ' — not what happens.'}</strong>
							)}
						</p>
						<p>
							<strong>What happens.</strong> {answer}
						</p>
						{reasoning && (
							<p>
								<strong>Why.</strong> {reasoning}
							</p>
						)}
					</div>
				)}
			</div>
		</Frame>
	);
}
