import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import {
	answerChoice,
	clearStore,
	crossedCheckpoint,
	deckPosition,
	emptyStore,
	evalCondition,
	exportProgress,
	islandJson,
	loadStore,
	reduce,
	saveStore,
	sceneAt,
	sceneIndex,
	weakSummary,
	type Action,
	type BuiltExperience,
	type Checkpoint,
	type CheckpointRecord,
	type ProgressStore,
	type Scene,
	type TabId,
	type VideoPart,
} from '../../../lib/experience-logic';
import AlgorithmStepper from './AlgorithmStepper';
import ClusterSim from './ClusterSim';
import { useReducedMotion } from './hooks';

/** The custom element of @hyperframes/player, as far as this component uses it. */
type PlayerElement = HTMLElement & {
	play(): void;
	pause(): void;
	seek(t: number): void;
	currentTime: number;
	playbackRate: number;
	readonly paused: boolean;
	readonly ready: boolean;
	readonly duration: number;
};

export interface ExperienceProps {
	config: BuiltExperience;
	/** Transcript HTML by video id, rendered on the server. */
	transcripts: Record<string, string>;
	/** Deck outline HTML (the text alternative of the slideshow). */
	outlineHtml: string;
}

const TAB_LABELS: Record<TabId, string> = { watch: 'Watch', explore: 'Explore', guided: 'Guided', deepdive: 'Deep dive', practice: 'Practice' };
const TAB_HINTS: Record<TabId, string> = {
	watch: 'A short explainer video.',
	explore: 'Change the simulation yourself.',
	guided: 'Step through the animation; it pauses for questions.',
	deepdive: 'Choose a path through the slides and open the deep dives.',
	practice: 'Every question in one place, and your progress.',
};
const MODE_LABELS = { explainer: 'Explainer video', interactive: 'Interactive lesson', branching: 'Branching presentation', hybrid: 'Learning lab' } as const;
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const now = () => new Date().toISOString();

let playerModule: Promise<unknown> | null = null;
let slideshowModule: Promise<unknown> | null = null;
/** The player library loads only when a tab needs it. */
function loadPlayer() {
	playerModule ??= import('@hyperframes/player');
	return playerModule;
}
function loadSlideshow() {
	slideshowModule ??= loadPlayer().then(() => import('@hyperframes/player/slideshow'));
	return slideshowModule;
}

// --------------------------------------------------------------- player ----

interface PlayerProps {
	src: string;
	label: string;
	controls?: boolean;
	onReady?: (el: PlayerElement) => void;
	onTime?: (t: number) => void;
	onPlayState?: (playing: boolean) => void;
	onEnded?: () => void;
	onError?: () => void;
	children?: ReactNode;
}

/** <hyperframes-player> in an opaque sandbox: the composition cannot reach the page. */
function HfPlayer({ src, label, controls = false, onReady, onTime, onPlayState, onEnded, onError, children }: PlayerProps) {
	const host = useRef<HTMLDivElement>(null);
	const handlers = useRef({ onReady, onTime, onPlayState, onEnded, onError });
	handlers.current = { onReady, onTime, onPlayState, onEnded, onError };
	const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading');
	useEffect(() => {
		let cancelled = false;
		let el: PlayerElement | null = null;
		loadPlayer()
			.then(() => {
				if (cancelled || !host.current) return;
				el = document.createElement('hyperframes-player') as PlayerElement;
				el.setAttribute('src', src);
				el.setAttribute('sandbox-origin', 'opaque');
				if (controls) el.setAttribute('controls', '');
				el.setAttribute('aria-label', label);
				el.className = 'lc-exp-hf';
				el.addEventListener('ready', () => {
					setState('ready');
					handlers.current.onReady?.(el!);
				});
				el.addEventListener('timeupdate', (e) => handlers.current.onTime?.((e as CustomEvent<{ currentTime: number }>).detail?.currentTime ?? el!.currentTime));
				el.addEventListener('play', () => handlers.current.onPlayState?.(true));
				el.addEventListener('pause', () => handlers.current.onPlayState?.(false));
				el.addEventListener('ended', () => {
					handlers.current.onPlayState?.(false);
					handlers.current.onEnded?.();
				});
				el.addEventListener('error', () => {
					setState('failed');
					handlers.current.onError?.();
				});
				host.current.prepend(el);
			})
			.catch(() => {
				if (cancelled) return;
				setState('failed');
				handlers.current.onError?.();
			});
		return () => {
			cancelled = true;
			el?.remove();
		};
	}, [src, controls, label]);
	return (
		<div className="lc-exp-stage" ref={host} data-player-state={state}>
			{state === 'loading' && <p className="lc-exp-loading lc-quiet">Loading the animation…</p>}
			{children}
		</div>
	);
}

// ---------------------------------------------------------- simulation ----

interface SimProps {
	config: NonNullable<BuiltExperience['simulation']>;
	preset: string | null;
	resetCount: number;
	onState: (snapshot: unknown) => void;
}

/** The simulation of an experience. Its state stays here; the video timeline only picks presets. */
function SimHost({ config, preset, resetCount, onState }: SimProps) {
	const props = { ...config.props, ...(preset ? config.presets[preset] ?? {} : {}) } as Record<string, unknown>;
	const key = `${preset ?? 'base'}-${resetCount}`;
	if (config.component === 'ClusterSim') return <ClusterSim key={key} {...(props as unknown as Parameters<typeof ClusterSim>[0])} onState={onState} />;
	return <AlgorithmStepper key={key} {...(props as unknown as Parameters<typeof AlgorithmStepper>[0])} onState={onState} />;
}

function PresetBar({ presets, active, onPick, onReset }: { presets: string[]; active: string | null; onPick: (p: string) => void; onReset: () => void }) {
	return (
		<div className="lc-controls lc-exp-presets" role="group" aria-label="Simulation starting states">
			{presets.map((p) => (
				<button key={p} type="button" className="lc-btn" aria-pressed={active === p} onClick={() => onPick(p)}>
					{p.replace(/-/g, ' ')}
				</button>
			))}
			<button type="button" className="lc-btn" onClick={onReset}>
				Reset simulation
			</button>
		</div>
	);
}

// ---------------------------------------------------------- checkpoints ----

interface CardProps {
	cp: Checkpoint;
	record?: CheckpointRecord;
	snapshot: unknown;
	focus?: boolean;
	onRecord: (status: CheckpointRecord['status'], answer?: number | null, misconception?: string | null) => void;
	onLoadPreset?: (preset: string) => void;
	onReplay?: () => void;
	replayLabel?: string;
	onContinue?: () => void;
	continueLabel?: string;
	onOpenExplore?: () => void;
}

const KIND_LABELS: Record<Checkpoint['kind'], string> = { predict: 'Predict', experiment: 'Experiment', observe: 'Observe', explain: 'Explain', verify: 'Check' };

function CheckpointCard({ cp, record, snapshot, focus, onRecord, onLoadPreset, onReplay, replayLabel, onContinue, continueLabel, onOpenExplore }: CardProps) {
	const heading = useRef<HTMLHeadingElement>(null);
	const [answer, setAnswer] = useState<number | null>(record?.answer ?? null);
	const [revealed, setRevealed] = useState(Boolean(record));
	const [notes, setNotes] = useState('');
	const notesId = useId();
	useEffect(() => {
		if (focus) heading.current?.focus();
	}, [focus]);
	const met = cp.kind === 'experiment' && evalCondition(cp.goal?.condition, snapshot);
	useEffect(() => {
		if (met && record?.status !== 'correct') {
			onRecord('correct');
			setRevealed(true);
		}
	}, [met, record?.status, onRecord]);

	const graded = answer !== null && cp.choices ? answerChoice(cp, answer) : null;
	const status = record?.status;
	return (
		<section className="lc-exp-card" data-checkpoint={cp.id} data-status={status ?? 'open'} aria-labelledby={`${cp.id}-h`}>
			<h4 id={`${cp.id}-h`} ref={heading} tabIndex={-1}>
				{KIND_LABELS[cp.kind]}: {cp.prompt}
			</h4>
			{cp.choices && (
				<div className="lc-exp-choices" role="group" aria-label="Answers">
					{cp.choices.map((choice, i) => (
						<button
							key={choice.text}
							type="button"
							className="lc-btn lc-exp-choice"
							aria-pressed={answer === i}
							onClick={() => {
								const result = answerChoice(cp, i);
								setAnswer(i);
								setRevealed(true);
								onRecord(result.status, i, result.misconception);
							}}
						>
							{choice.text}
						</button>
					))}
				</div>
			)}
			{cp.kind === 'experiment' && (
				<>
					<p className="lc-quiet">Hint: {cp.goal?.hint}</p>
					<div className="lc-controls">
						{cp.goal?.preset && onLoadPreset && (
							<button type="button" className="lc-btn" onClick={() => onLoadPreset(cp.goal!.preset!)}>
								Load the starting state
							</button>
						)}
						{onOpenExplore && (
							<button type="button" className="lc-btn" onClick={onOpenExplore}>
								Open the simulation
							</button>
						)}
						{!met && status !== 'correct' && (
							<button type="button" className="lc-btn" onClick={() => { onRecord('skipped'); setRevealed(true); }}>
								Skip
							</button>
						)}
					</div>
					<p className="lc-exp-goal" aria-live="polite">{met || status === 'correct' ? 'Goal reached.' : 'The goal is not reached yet.'}</p>
				</>
			)}
			{cp.kind === 'observe' && (
				<>
					<p>Look for: {cp.look_for}</p>
					{!revealed && (
						<button type="button" className="lc-btn" onClick={() => { onRecord('done'); setRevealed(true); }}>
							I saw it
						</button>
					)}
				</>
			)}
			{cp.kind === 'explain' && (
				<>
					<label htmlFor={notesId} className="lc-quiet">Your explanation (stays in this page)</label>
					<textarea id={notesId} className="lc-exp-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
					{!revealed && (
						<button type="button" className="lc-btn" onClick={() => { onRecord('done'); setRevealed(true); }}>
							Compare with the explanation
						</button>
					)}
				</>
			)}
			<div aria-live="polite" className="lc-exp-feedback">
				{graded && (graded.correct ? <p className="lc-exp-right">Right.</p> : <p className="lc-exp-wrong">Not quite. That answer assumes: {graded.misconception ?? 'a different rule'}.</p>)}
				{revealed && <p>{cp.explanation}</p>}
			</div>
			{(onContinue || (onReplay && graded && !graded.correct)) && (
				<div className="lc-controls">
					{onReplay && graded && !graded.correct && (
						<button type="button" className="lc-btn" onClick={onReplay}>
							{replayLabel ?? 'Replay the scene'}
						</button>
					)}
					{onContinue && (
						<button type="button" className="lc-btn" onClick={onContinue}>
							{continueLabel ?? 'Continue'}
						</button>
					)}
				</div>
			)}
		</section>
	);
}

// --------------------------------------------------------------- videos ----

function Transcript({ html, id }: { html?: string; id: string }) {
	const [open, setOpen] = useState(false);
	if (!html) return null;
	const panel = `${id}-transcript`;
	return (
		<>
			<button type="button" className="lc-btn" aria-expanded={open} aria-controls={panel} onClick={() => setOpen(!open)}>
				{open ? 'Hide transcript' : 'Show transcript'}
			</button>
			<div className="lc-video-transcript" id={panel} hidden={!open} dangerouslySetInnerHTML={{ __html: html }} />
		</>
	);
}

/** A video part: the MP4 with captions when rendered, else the live composition. */
function VideoBlock({ part, transcript, onEnded, onWatched }: { part: VideoPart; transcript?: string; onEnded?: () => void; onWatched?: (s: number) => void }) {
	const [failed, setFailed] = useState(false);
	const domId = useId().replace(/:/g, '');
	let media: ReactNode;
	if (part.mp4_url) {
		media = (
			<video className="lc-video-player" controls preload="metadata" playsInline aria-label={part.alt} onEnded={onEnded} onTimeUpdate={(e) => onWatched?.(e.currentTarget.currentTime)}>
				<source src={part.mp4_url} type="video/mp4" />
				{part.captions_url && <track kind="captions" src={part.captions_url} srcLang="en" label="English" default />}
			</video>
		);
	} else if (part.composition_url && !failed) {
		media = <HfPlayer src={part.composition_url} label={part.alt} controls onEnded={onEnded} onTime={onWatched} onError={() => setFailed(true)} />;
	} else {
		media = (
			<p className="lc-quiet lc-exp-blocked">
				{failed ? 'The animation could not load here. ' : `The animation is not available${part.blocker ? `: ${part.blocker}` : '.'} `}
				Read the transcript, or open the text version under this experience.
			</p>
		);
	}
	return (
		<div className="lc-exp-video" data-video={part.video_id}>
			<p className="lc-exp-part-title">{part.title}</p>
			{media}
			<p className="lc-caption">{part.explanation}</p>
			<div className="lc-controls">
				<Transcript html={transcript} id={domId} />
			</div>
		</div>
	);
}

// --------------------------------------------------------------- guided ----

interface GuidedProps {
	config: BuiltExperience;
	store: ProgressStore;
	dispatch: (a: Action) => void;
	snapshot: unknown;
	preset: string | null;
	setPreset: (p: string | null) => void;
	resetCount: number;
	resetSim: () => void;
	onSnapshot: (s: unknown) => void;
	transcript?: string;
}

function Guided({ config, store, dispatch, snapshot, preset, setPreset, resetCount, resetSim, onSnapshot, transcript }: GuidedProps) {
	const part = config.guided!;
	const scenes = part.scenes;
	const player = useRef<PlayerElement | null>(null);
	const last = useRef(store.guided_time);
	const stepEnd = useRef<number | null>(null);
	const lastScene = useRef<string | null>(null);
	const [time, setTime] = useState(store.guided_time);
	const [playing, setPlaying] = useState(false);
	const [rate, setRate] = useState(1);
	const [active, setActive] = useState<Checkpoint | null>(null);
	const [inspector, setInspector] = useState<string | null>(null);
	const [failed, setFailed] = useState(false);
	const domId = useId().replace(/:/g, '');
	const sceneCheckpoints = useMemo(() => config.checkpoints.filter((c) => c.at.scene), [config.checkpoints]);
	const current = sceneAt(scenes, time);

	const seek = useCallback((t: number) => {
		player.current?.seek(t);
		last.current = t;
		setTime(t);
	}, []);

	const onTime = useCallback(
		(t: number) => {
			const prev = last.current;
			last.current = t;
			setTime(t);
			const cp = crossedCheckpoint(prev, t, scenes, sceneCheckpoints, store.checkpoints);
			if (cp) {
				const scene = scenes.find((s) => s.id === cp.at.scene)!;
				// Hold the last frame before the event, so the learner predicts what comes next.
				const hold = Math.max(0, scene.start - 0.15);
				player.current?.pause();
				player.current?.seek(hold);
				last.current = hold;
				stepEnd.current = null;
				setActive(cp);
				if (cp.goal?.preset) setPreset(cp.goal.preset);
				return;
			}
			if (stepEnd.current !== null && t >= stepEnd.current - 0.08) {
				player.current?.pause();
				stepEnd.current = null;
			}
		},
		[scenes, sceneCheckpoints, store.checkpoints, setPreset],
	);

	// Timeline → simulation: entering a scene with a `sync` preset loads that preset.
	useEffect(() => {
		if (!current || current.id === lastScene.current) return;
		lastScene.current = current.id;
		const sync = config.sync.find((s) => s.scene === current.id);
		if (sync) setPreset(sync.preset);
	}, [current, config.sync, setPreset]);

	// Remember where the learner is, a few times a second at most.
	useEffect(() => {
		const timer = setTimeout(() => dispatch({ type: 'guided-time', time }), 400);
		return () => clearTimeout(timer);
	}, [time, dispatch]);

	const step = (direction: 1 | -1) => {
		const i = Math.max(0, sceneIndex(scenes, time));
		let target: Scene;
		if (direction === 1) target = scenes[Math.min(i + 1, scenes.length - 1)];
		else target = time - scenes[i].start > 1 ? scenes[i] : scenes[Math.max(0, i - 1)];
		const from = last.current;
		// A step forward onto a checkpoint scene pauses for the question first,
		// on the last frame before the event.
		const cp = direction === 1 ? crossedCheckpoint(from, target.start, scenes, sceneCheckpoints, store.checkpoints) : null;
		const at = cp ? Math.max(0, target.start - 0.15) : target.start;
		player.current?.seek(at);
		setTime(at);
		last.current = at;
		if (cp) {
			player.current?.pause();
			setActive(cp);
			if (cp.goal?.preset) setPreset(cp.goal.preset);
			return;
		}
		stepEnd.current = target.start + target.duration;
		player.current?.play();
	};

	const toggle = () => {
		if (!player.current) return;
		if (playing) player.current.pause();
		else {
			stepEnd.current = null;
			setActive(null);
			player.current.play();
		}
	};

	const record = (cp: Checkpoint) => (status: CheckpointRecord['status'], answer?: number | null, misconception?: string | null) =>
		dispatch({ type: 'record', id: cp.id, status, answer, misconception, at: now() });

	const inspectHere = config.inspect.filter((h) => h.scene === current?.id);
	const doneMarks = new Set(Object.keys(store.checkpoints));

	return (
		<div className="lc-exp-guided">
			<div className={config.simulation ? 'lc-exp-split' : undefined}>
				<div className="lc-exp-main">
					{failed ? (
						<p className="lc-quiet lc-exp-blocked">The animation could not load here. Use the chapters and the transcript, or the text version below.</p>
					) : (
						<HfPlayer
							src={part.composition_url!}
							label={part.alt}
							onReady={(el) => {
								player.current = el;
								if (store.guided_time > 0) el.seek(store.guided_time);
							}}
							onTime={onTime}
							onPlayState={setPlaying}
							onError={() => setFailed(true)}
						>
							{inspectHere.map((h) => (
								<button
									key={h.id}
									type="button"
									className="lc-exp-hotspot"
									style={{ left: `${h.region.x}%`, top: `${h.region.y}%`, width: `${h.region.w}%`, height: `${h.region.h}%` }}
									aria-label={`Inspect: ${h.label}`}
									onClick={() => {
										player.current?.pause();
										setInspector(h.id);
									}}
								>
									<span>{h.label}</span>
								</button>
							))}
						</HfPlayer>
					)}
					<div className="lc-controls lc-exp-transport" role="group" aria-label="Walkthrough controls">
						<button type="button" className="lc-btn" onClick={() => step(-1)} aria-label="Previous step">
							‹ Step
						</button>
						<button type="button" className="lc-btn" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'} data-exp-play>
							{playing ? 'Pause' : 'Play'}
						</button>
						<button type="button" className="lc-btn" onClick={() => step(1)} aria-label="Next step" data-exp-next>
							Step ›
						</button>
						<label className="lc-exp-speed">
							Speed{' '}
							<select
								value={rate}
								onChange={(e) => {
									const r = Number(e.target.value);
									setRate(r);
									if (player.current) player.current.playbackRate = r;
								}}
							>
								{SPEEDS.map((s) => (
									<option key={s} value={s}>
										{s}×
									</option>
								))}
							</select>
						</label>
						<span className="lc-quiet lc-exp-clock" aria-live="off">
							{time.toFixed(1)} / {part.duration.toFixed(0)} s
						</span>
					</div>
					<ol className="lc-exp-chapters" aria-label="Chapters">
						{scenes.map((s) => {
							const cp = sceneCheckpoints.find((c) => c.at.scene === s.id);
							return (
								<li key={s.id} data-current={current?.id === s.id}>
									<button type="button" className="lc-btn" aria-current={current?.id === s.id ? 'step' : undefined} onClick={() => { stepEnd.current = null; seek(s.start); }}>
										{s.heading ?? s.id}
									</button>
									{cp && <span className="lc-exp-mark" title="Pauses for a question">{doneMarks.has(cp.id) ? ' ✓ question' : ' ? question'}</span>}
								</li>
							);
						})}
					</ol>
					{inspector && (
						<div className="lc-exp-inspector" role="region" aria-live="polite" aria-label="Inspector">
							{(() => {
								const h = config.inspect.find((x) => x.id === inspector)!;
								return (
									<>
										<p>
											<strong>{h.label}.</strong> {h.text}
										</p>
										<button type="button" className="lc-btn" onClick={() => setInspector(null)}>
											Close
										</button>
									</>
								);
							})()}
						</div>
					)}
					{active && (
						<CheckpointCard
							key={active.id}
							cp={active}
							record={store.checkpoints[active.id]}
							snapshot={snapshot}
							focus
							onRecord={record(active)}
							onLoadPreset={config.simulation ? (p) => setPreset(p) : undefined}
							onReplay={active.revisit ? () => { const s = scenes.find((x) => x.id === active.revisit); if (s) { setActive(null); stepEnd.current = s.start + s.duration; seek(s.start); player.current?.play(); } } : undefined}
							replayLabel={active.revisit ? `Replay “${scenes.find((x) => x.id === active.revisit)?.heading ?? active.revisit}”` : undefined}
							onContinue={() => {
								if (!store.checkpoints[active.id]) dispatch({ type: 'record', id: active.id, status: 'skipped', at: now() });
								setActive(null);
								player.current?.play();
							}}
						/>
					)}
					<div className="lc-controls">
						<Transcript html={transcript} id={domId} />
					</div>
				</div>
				{config.simulation && (
					<div className="lc-exp-side" aria-label="Simulation">
						<PresetBar presets={Object.keys(config.simulation.presets)} active={preset} onPick={setPreset} onReset={resetSim} />
						<SimHost config={config.simulation} preset={preset} resetCount={resetCount} onState={onSnapshot} />
					</div>
				)}
			</div>
		</div>
	);
}

// ------------------------------------------------------------- deep dive ----

function DeepDive({ config, store, dispatch, snapshot, outlineHtml }: { config: BuiltExperience; store: ProgressStore; dispatch: (a: Action) => void; snapshot: unknown; outlineHtml: string }) {
	const deck = config.deck!;
	const host = useRef<HTMLDivElement>(null);
	const [slide, setSlide] = useState<string | null>(null);
	const [failed, setFailed] = useState(false);
	const [outline, setOutline] = useState(false);
	const outlineId = useId().replace(/:/g, '');
	useEffect(() => {
		let cancelled = false;
		let player: PlayerElement | null = null;
		const onTime = (e: Event) => {
			const t = (e as CustomEvent<{ currentTime: number }>).detail?.currentTime ?? player?.currentTime ?? 0;
			const pos = deckPosition(deck.scenes, t);
			setSlide(pos.scene);
			if (pos.scene) dispatch({ type: 'slide', scene: pos.scene, sequence: pos.sequence });
		};
		loadSlideshow()
			.then(() => {
				if (cancelled || !host.current) return;
				const src = deck.composition_url.replace(/"/g, '&quot;');
				host.current.innerHTML = `<hyperframes-slideshow tabindex="0" notes-storage-key="${deck.deck_id}" aria-label="${deck.title.replace(/"/g, '&quot;')}" style="display:block;position:relative;width:100%;height:100%"><hyperframes-player interactive sandbox-origin="opaque" src="${src}" style="position:absolute;inset:0"></hyperframes-player><script type="application/hyperframes-slideshow+json">${islandJson(deck.island)}</script></hyperframes-slideshow>`;
				player = host.current.querySelector('hyperframes-player') as PlayerElement | null;
				player?.addEventListener('timeupdate', onTime);
				player?.addEventListener('error', () => setFailed(true));
			})
			.catch(() => !cancelled && setFailed(true));
		return () => {
			cancelled = true;
			player?.removeEventListener('timeupdate', onTime);
			if (host.current) host.current.innerHTML = '';
		};
	}, [deck, dispatch]);
	const here = config.checkpoints.filter((c) => c.at.slide && c.at.slide === slide);
	return (
		<div className="lc-exp-deck" data-slide={slide ?? ''}>
			{failed ? (
				<p className="lc-quiet lc-exp-blocked">The slides could not load here. Read the outline below.</p>
			) : (
				<div className="lc-exp-stage lc-exp-deck-stage" ref={host} />
			)}
			<p className="lc-quiet">Use ‹ › or the arrow keys to move. Open a deep-dive card to explore a path; Previous returns to the main path.</p>
			<p className="lc-caption">{deck.explanation}</p>
			{here.map((cp) => (
				<CheckpointCard key={cp.id} cp={cp} record={store.checkpoints[cp.id]} snapshot={snapshot} onRecord={(status, answer, misconception) => dispatch({ type: 'record', id: cp.id, status, answer, misconception, at: now() })} />
			))}
			<p className="lc-quiet">
				Visited {store.visited_slides.length} of {deck.scenes.length} slides
				{store.branches.length ? `, deep dives: ${store.branches.join(', ')}` : ''}.
			</p>
			<div className="lc-controls">
				<button type="button" className="lc-btn" aria-expanded={outline} aria-controls={outlineId} onClick={() => setOutline(!outline)}>
					{outline ? 'Hide the text outline' : 'Show the text outline'}
				</button>
			</div>
			<div className="lc-video-transcript lc-exp-outline" id={outlineId} hidden={!outline} dangerouslySetInnerHTML={{ __html: outlineHtml }} />
		</div>
	);
}

// --------------------------------------------------------------- shell ----

export default function Experience({ config, transcripts, outlineHtml }: ExperienceProps) {
	const tabs = config.tabs;
	const storage = typeof window === 'undefined' ? null : (() => { try { return window.localStorage; } catch { return null; } })();
	const [store, setStore] = useState<ProgressStore>(emptyStore);
	const [loaded, setLoaded] = useState(false);
	const [tab, setTab] = useState<TabId>(tabs[0]);
	const [snapshot, setSnapshot] = useState<unknown>(null);
	const [preset, setPresetState] = useState<string | null>(null);
	const [resetCount, setResetCount] = useState(0);
	const [watchCheck, setWatchCheck] = useState(false);
	const reduced = useReducedMotion();
	const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
	const base = useId().replace(/:/g, '');

	// Progress survives reloads and tab switches; storage failures are harmless.
	useEffect(() => {
		const saved = loadStore(storage, config.topic, config.id);
		setStore(saved);
		const audience = typeof location !== 'undefined' && new URLSearchParams(location.search).get('mode') === 'audience';
		const start = audience && tabs.includes('deepdive') ? 'deepdive' : saved.tab && tabs.includes(saved.tab) ? saved.tab : tabs[0];
		setTab(start);
		if (saved.preset) setPresetState(saved.preset);
		setLoaded(true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [config.topic, config.id]);
	useEffect(() => {
		if (loaded) saveStore(storage, config.topic, config.id, store);
	}, [store, loaded, storage, config.topic, config.id]);

	const dispatch = useCallback((action: Action) => setStore((s) => reduce(s, action)), []);
	const setPreset = useCallback((p: string | null) => {
		setPresetState(p);
		setSnapshot(null);
		dispatch({ type: 'preset', preset: p });
	}, [dispatch]);
	const resetSim = useCallback(() => setResetCount((n) => n + 1), []);
	const onSnapshot = useCallback((s: unknown) => setSnapshot(s), []);

	const choose = (next: TabId) => {
		setTab(next);
		dispatch({ type: 'tab', tab: next });
	};
	const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
		let j = -1;
		if (e.key === 'ArrowRight') j = (i + 1) % tabs.length;
		else if (e.key === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
		else if (e.key === 'Home') j = 0;
		else if (e.key === 'End') j = tabs.length - 1;
		if (j < 0) return;
		e.preventDefault();
		choose(tabs[j]);
		tabRefs.current[tabs[j]]?.focus();
	};

	const recordFor = (cp: Checkpoint) => (status: CheckpointRecord['status'], answer?: number | null, misconception?: string | null) =>
		dispatch({ type: 'record', id: cp.id, status, answer, misconception, at: now() });
	const afterWatch = config.checkpoints.find((c) => c.at.after === 'watch');
	const experiments = config.checkpoints.filter((c) => c.kind === 'experiment');
	const answered = config.checkpoints.filter((c) => store.checkpoints[c.id]).length;
	const weak = weakSummary(config.checkpoints, store);

	const download = () => {
		const data = exportProgress(config.topic, { [config.id]: store }, now());
		const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `progress-${config.topic.split('/').pop()}-${config.id}.json`;
		document.body.append(a);
		a.click();
		a.remove();
		setTimeout(() => URL.revokeObjectURL(url), 1000);
	};

	return (
		<figure className="lc lc-exp" data-experience={config.id} data-mode={config.mode} data-reduced-motion={reduced ? 'true' : 'false'}>
			<figcaption className="lc-title">
				{config.title} <span className="lc-quiet">· {MODE_LABELS[config.mode]}</span>
			</figcaption>
			<p className="lc-exp-objective">{config.objective}</p>
			<div className="lc-exp-tabs" role="tablist" aria-label="Ways to learn this idea">
				{tabs.map((t, i) => (
					<button
						key={t}
						ref={(el) => {
							tabRefs.current[t] = el;
						}}
						type="button"
						role="tab"
						id={`${base}-tab-${t}`}
						aria-selected={tab === t}
						aria-controls={`${base}-panel-${t}`}
						tabIndex={tab === t ? 0 : -1}
						className="lc-exp-tab"
						data-tab={t}
						onClick={() => choose(t)}
						onKeyDown={(e) => onTabKey(e, i)}
					>
						{TAB_LABELS[t]}
					</button>
				))}
			</div>
			<div className="lc-exp-panel" role="tabpanel" id={`${base}-panel-${tab}`} aria-labelledby={`${base}-tab-${tab}`} tabIndex={0} data-panel={tab}>
				<p className="lc-quiet lc-exp-hint">{TAB_HINTS[tab]}</p>
				{tab === 'watch' && (
					<>
						{config.watch && (
							<VideoBlock
								part={config.watch}
								transcript={transcripts[config.watch.video_id]}
								onEnded={() => afterWatch && setWatchCheck(true)}
								onWatched={(s) => dispatch({ type: 'watched', video: config.watch!.video_id, seconds: s })}
							/>
						)}
						{afterWatch && !watchCheck && (
							<div className="lc-controls">
								<button type="button" className="lc-btn" onClick={() => setWatchCheck(true)}>
									Answer the question about this video
								</button>
							</div>
						)}
						{afterWatch && watchCheck && <CheckpointCard cp={afterWatch} record={store.checkpoints[afterWatch.id]} snapshot={snapshot} focus onRecord={recordFor(afterWatch)} />}
					</>
				)}
				{tab === 'explore' && config.simulation && (
					<div className="lc-exp-explore">
						<PresetBar presets={Object.keys(config.simulation.presets)} active={preset} onPick={setPreset} onReset={resetSim} />
						<SimHost config={config.simulation} preset={preset} resetCount={resetCount} onState={onSnapshot} />
						{experiments.length > 0 && <h4 className="lc-exp-sub">Challenges</h4>}
						{experiments.map((cp) => (
							<CheckpointCard key={cp.id} cp={cp} record={store.checkpoints[cp.id]} snapshot={snapshot} onRecord={recordFor(cp)} onLoadPreset={setPreset} />
						))}
					</div>
				)}
				{tab === 'guided' && config.guided && (
					<Guided
						config={config}
						store={store}
						dispatch={dispatch}
						snapshot={snapshot}
						preset={preset}
						setPreset={setPreset}
						resetCount={resetCount}
						resetSim={resetSim}
						onSnapshot={onSnapshot}
						transcript={transcripts[config.guided.video_id]}
					/>
				)}
				{tab === 'deepdive' && config.deck && <DeepDive config={config} store={store} dispatch={dispatch} snapshot={snapshot} outlineHtml={outlineHtml} />}
				{tab === 'practice' && (
					<div className="lc-exp-practice">
						<p aria-live="polite">
							{answered} of {config.checkpoints.length} questions answered.
						</p>
						{config.checkpoints.map((cp) => (
							<CheckpointCard
								key={cp.id}
								cp={cp}
								record={store.checkpoints[cp.id]}
								snapshot={snapshot}
								onRecord={recordFor(cp)}
								onOpenExplore={cp.kind === 'experiment' && tabs.includes('explore') ? () => choose('explore') : undefined}
							/>
						))}
						{weak.length > 0 && (
							<div className="lc-exp-weak" aria-live="polite">
								<h4 className="lc-exp-sub">Worth another look</h4>
								<ul>
									{weak.map((w) => (
										<li key={w.concept}>
											<strong>{w.concept.replace(/-/g, ' ')}</strong>: {w.misconceptions.join('; ') || 'some answers were wrong'}
										</li>
									))}
								</ul>
							</div>
						)}
						{config.summary_video && (
							<>
								<h4 className="lc-exp-sub">Final summary</h4>
								<VideoBlock part={config.summary_video} transcript={transcripts[config.summary_video.video_id]} onWatched={(s) => dispatch({ type: 'watched', video: config.summary_video!.video_id, seconds: s })} />
							</>
						)}
						<div className="lc-controls">
							<button type="button" className="lc-btn" onClick={download} data-exp-export>
								Export progress
							</button>
							<button
								type="button"
								className="lc-btn"
								onClick={() => {
									clearStore(storage, config.topic, config.id);
									dispatch({ type: 'reset' });
								}}
							>
								Reset progress
							</button>
						</div>
						<p className="lc-quiet">
							To bring your answers into your recall schedule, run <code>node harness/bin/tutor.mjs experience {config.topic} progress --file &lt;the downloaded file&gt;</code>.
						</p>
					</div>
				)}
			</div>
			{config.sources.length > 0 && (
				<p className="lc-diagram-sources">
					Sources:{' '}
					{config.sources.map((s, i) => (
						<span key={s.id}>
							{i > 0 && ', '}
							{s.url ? (
								<a href={s.url} rel="noopener noreferrer" target="_blank">
									{s.title}
								</a>
							) : (
								s.title
							)}
						</span>
					))}
					. Animated with HyperFrames.
				</p>
			)}
		</figure>
	);
}
