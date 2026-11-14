import { useState } from 'react';
import { Frame, TextButton } from './ui';

export interface QuizProps {
	question: string;
	options: string[];
	/** index of the right option (0-based), or an array of indexes for multiple choice */
	answer: number | number[];
	explanation?: string;
}

export default function Quiz({ question, options, answer, explanation }: QuizProps) {
	const multiple = Array.isArray(answer);
	const correct = multiple ? answer : [answer];
	const [picked, setPicked] = useState<number[]>([]);
	const [checked, setChecked] = useState(false);
	const right = checked && picked.length === correct.length && picked.every((i) => correct.includes(i));

	const toggle = (i: number) => {
		if (checked) return;
		setPicked((list) => (multiple ? (list.includes(i) ? list.filter((x) => x !== i) : [...list, i]) : [i]));
	};

	return (
		<Frame name="quiz">
			<p className="lc-prompt">
				<span className="lc-kicker">{multiple ? 'Quiz · choose all that apply' : 'Quiz'}</span>
				{question}
			</p>
			<div className="lc-options" role={multiple ? 'group' : 'radiogroup'} aria-label={question}>
				{options.map((option, i) => {
					const isPicked = picked.includes(i);
					const mark = checked ? (correct.includes(i) ? 'is-right' : isPicked ? 'is-wrong' : '') : '';
					return (
						<button
							key={i}
							type="button"
							role={multiple ? 'checkbox' : 'radio'}
							aria-checked={isPicked}
							className={`lc-option ${multiple ? 'is-multi' : ''} ${isPicked ? 'is-picked' : ''} ${mark}`}
							onClick={() => toggle(i)}
							aria-disabled={checked}
						>
							<span className="lc-option-mark" aria-hidden="true" />
							<span>
								{option}
								{mark === 'is-right' && <span className="lc-verdict is-right"> — correct</span>}
								{mark === 'is-wrong' && <span className="lc-verdict is-wrong"> — not this one</span>}
							</span>
						</button>
					);
				})}
			</div>
			<div className="lc-controls">
				{checked ? (
					<TextButton
						onClick={() => {
							setChecked(false);
							setPicked([]);
						}}
					>
						Try again
					</TextButton>
				) : (
					<TextButton onClick={() => setChecked(true)} disabled={picked.length === 0}>
						Check answer
					</TextButton>
				)}
			</div>
			<div aria-live="polite">
				{checked && (
					<p className="lc-feedback">
						<strong className={right ? 'lc-good' : 'lc-bad'}>{right ? 'Correct.' : 'Not quite.'}</strong> {explanation}
					</p>
				)}
			</div>
		</Frame>
	);
}
