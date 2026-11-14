import { useMemo, useState } from 'react';
import { hashString, seededShuffle } from './hooks';
import { Frame, TextButton } from './ui';

export interface MatchPairsProps {
	prompt?: string;
	pairs: { term: string; definition: string }[];
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export default function MatchPairs({ prompt = 'Match each term to its meaning.', pairs }: MatchPairsProps) {
	const definitions = useMemo(
		() =>
			seededShuffle(
				pairs.map((_, i) => i),
				hashString(pairs.map((p) => p.term).join('|')),
			),
		[pairs],
	);
	/** term index -> definition index */
	const [matches, setMatches] = useState<Record<number, number>>({});
	const [active, setActive] = useState<number | null>(0);
	const [checked, setChecked] = useState(false);

	const termOf = (definition: number) => {
		const hit = Object.entries(matches).find(([, d]) => d === definition);
		return hit ? Number(hit[0]) : null;
	};
	const complete = Object.keys(matches).length === pairs.length;
	const score = Object.entries(matches).filter(([term, definition]) => Number(term) === definition).length;

	const pickTerm = (term: number) => {
		setChecked(false);
		setActive((current) => (current === term ? null : term));
	};
	const pickDefinition = (definition: number) => {
		setChecked(false);
		const owner = termOf(definition);
		if (active === null) {
			if (owner !== null) {
				setMatches((m) => Object.fromEntries(Object.entries(m).filter(([term]) => Number(term) !== owner)));
				setActive(owner);
			}
			return;
		}
		setMatches((m) => {
			const next = Object.fromEntries(Object.entries(m).filter(([term, d]) => Number(term) !== active && d !== definition));
			next[active] = definition;
			return next;
		});
		const nextFree = pairs.findIndex((_, term) => term !== active && matches[term] === undefined);
		setActive(nextFree === -1 ? null : nextFree);
	};

	return (
		<Frame name="matchpairs">
			<p className="lc-prompt">
				<span className="lc-kicker">Match the pairs</span>
				{prompt} <span className="lc-quiet">Choose a term on the left, then its meaning on the right.</span>
			</p>
			<div className="lc-match">
				<div className="lc-match-col" role="group" aria-label="Terms">
					{pairs.map((pair, term) => {
						const verdict = checked && matches[term] !== undefined ? (matches[term] === term ? 'is-right' : 'is-wrong') : '';
						return (
							<button
								key={term}
								type="button"
								className={`lc-match-item ${active === term ? 'is-active' : ''} ${matches[term] !== undefined ? 'is-matched' : ''} ${verdict}`}
								aria-pressed={active === term}
								onClick={() => pickTerm(term)}
							>
								<span className="lc-letter">{LETTERS[term % 26]}</span>
								<span>{pair.term}</span>
							</button>
						);
					})}
				</div>
				<div className="lc-match-col" role="group" aria-label="Meanings">
					{definitions.map((definition) => {
						const owner = termOf(definition);
						const verdict = checked && owner !== null ? (owner === definition ? 'is-right' : 'is-wrong') : '';
						return (
							<button
								key={definition}
								type="button"
								className={`lc-match-item ${owner !== null ? 'is-matched' : ''} ${verdict}`}
								onClick={() => pickDefinition(definition)}
								aria-label={`${pairs[definition].definition}${owner !== null ? `. Matched with ${pairs[owner].term}` : ''}`}
							>
								<span className="lc-letter">{owner !== null ? LETTERS[owner % 26] : ''}</span>
								<span>
									{pairs[definition].definition}
									{verdict && <span className={`lc-verdict ${verdict}`}>{verdict === 'is-right' ? ' — correct' : ' — not a match'}</span>}
								</span>
							</button>
						);
					})}
				</div>
			</div>
			<div className="lc-controls">
				<TextButton onClick={() => setChecked(true)} disabled={!complete}>
					Check matches
				</TextButton>
				<TextButton
					onClick={() => {
						setMatches({});
						setActive(0);
						setChecked(false);
					}}
					disabled={Object.keys(matches).length === 0}
				>
					Clear
				</TextButton>
			</div>
			<div aria-live="polite">
				{checked && (
					<p className="lc-feedback">
						<strong className={score === pairs.length ? 'lc-good' : 'lc-bad'}>{score === pairs.length ? 'All matched.' : 'Not yet.'}</strong>
						{score !== pairs.length && ` ${score} of ${pairs.length} pairs are right. Select a wrong meaning to free it, then match again.`}
					</p>
				)}
			</div>
		</Frame>
	);
}
