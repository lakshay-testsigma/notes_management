/**
 * Pure logic of <Experience>: the learner's progress store, checkpoint
 * evaluation, simulation goal conditions, and the mapping from timeline time to
 * scenes and deck slides. No DOM, no React, so node tests can drive it and the
 * harness can read what it exports (`tutor experience <topic> progress`).
 */

export type TabId = 'watch' | 'explore' | 'guided' | 'deepdive' | 'practice';
export type CheckpointKind = 'predict' | 'experiment' | 'observe' | 'explain' | 'verify';
export type CheckpointStatus = 'correct' | 'wrong' | 'done' | 'skipped';

export interface Choice {
	text: string;
	correct?: boolean;
	misconception?: string;
}
export interface Condition {
	path: string;
	op: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'includes';
	value: unknown;
}
export type ConditionGroup = Condition | { all: Condition[] };
export interface Checkpoint {
	id: string;
	kind: CheckpointKind;
	at: { scene?: string; slide?: string; after?: 'watch'; tab?: 'practice' };
	prompt: string;
	choices?: Choice[];
	goal?: { preset?: string; condition: ConditionGroup; hint: string };
	look_for?: string;
	explanation: string;
	concept_ids: string[];
	revisit?: string;
}
export interface Scene {
	id: string;
	heading?: string;
	start: number;
	duration: number;
	sequence?: string | null;
	fragments?: number[];
}
export interface VideoPart {
	video_id: string;
	title: string;
	status: string;
	blocker: string | null;
	mp4_url: string | null;
	captions_url: string | null;
	composition_url: string | null;
	duration: number;
	scenes: Scene[];
	transcript: string;
	explanation: string;
	alt: string;
}
export interface BuiltExperience {
	id: string;
	topic: string;
	title: string;
	mode: 'explainer' | 'interactive' | 'branching' | 'hybrid';
	objective: string;
	level: string;
	summary: string;
	page: string;
	page_url: string;
	tabs: TabId[];
	watch: VideoPart | null;
	guided: VideoPart | null;
	summary_video: VideoPart | null;
	simulation: { component: 'ClusterSim' | 'AlgorithmStepper'; props: Record<string, unknown>; presets: Record<string, Record<string, unknown>> } | null;
	sync: { scene: string; preset: string }[];
	inspect: { id: string; scene: string; label: string; region: { x: number; y: number; w: number; h: number }; concept_id?: string; text: string }[];
	deck: { deck_id: string; title: string; composition_url: string; island: unknown; scenes: Scene[]; outline: string; explanation: string } | null;
	checkpoints: Checkpoint[];
	fallback_visual: string | null;
	concept_ids: string[];
	sources: { id: string; title: string; url: string | null }[];
	input_hash: string;
}

export interface Attempt {
	at: string;
	status: CheckpointStatus;
	misconception: string | null;
}
export interface CheckpointRecord {
	status: CheckpointStatus;
	answer: number | null;
	history: Attempt[];
}
export interface ProgressStore {
	v: 1;
	tab: TabId | null;
	guided_time: number;
	watched: Record<string, number>;
	visited_slides: string[];
	branches: string[];
	preset: string | null;
	checkpoints: Record<string, CheckpointRecord>;
	updated: string | null;
}

export function emptyStore(): ProgressStore {
	return { v: 1, tab: null, guided_time: 0, watched: {}, visited_slides: [], branches: [], preset: null, checkpoints: {}, updated: null };
}

export const storageKey = (topic: string, id: string) => `tutor:exp:${topic}:${id}`;

interface StorageLike {
	getItem(key: string): string | null;
	setItem(key: string, value: string): void;
	removeItem(key: string): void;
}

/** Read a store; any storage failure or a malformed value gives an empty store. */
export function loadStore(storage: StorageLike | null | undefined, topic: string, id: string): ProgressStore {
	try {
		const raw = storage?.getItem(storageKey(topic, id));
		if (!raw) return emptyStore();
		const data = JSON.parse(raw);
		if (!data || data.v !== 1) return emptyStore();
		return { ...emptyStore(), ...data };
	} catch {
		return emptyStore();
	}
}

export function saveStore(storage: StorageLike | null | undefined, topic: string, id: string, store: ProgressStore): boolean {
	try {
		storage?.setItem(storageKey(topic, id), JSON.stringify(store));
		return true;
	} catch {
		return false;
	}
}

export function clearStore(storage: StorageLike | null | undefined, topic: string, id: string): void {
	try {
		storage?.removeItem(storageKey(topic, id));
	} catch {
		/* storage blocked: nothing to clear */
	}
}

export type Action =
	| { type: 'tab'; tab: TabId }
	| { type: 'guided-time'; time: number }
	| { type: 'watched'; video: string; seconds: number }
	| { type: 'slide'; scene: string; sequence: string | null }
	| { type: 'preset'; preset: string | null }
	| { type: 'record'; id: string; status: CheckpointStatus; answer?: number | null; misconception?: string | null; at: string }
	| { type: 'reset' };

/** The progress reducer. `at` timestamps come from the caller, so the reducer stays pure. */
export function reduce(store: ProgressStore, action: Action): ProgressStore {
	switch (action.type) {
		case 'tab':
			return { ...store, tab: action.tab };
		case 'guided-time':
			return { ...store, guided_time: Math.max(0, action.time) };
		case 'watched':
			return { ...store, watched: { ...store.watched, [action.video]: Math.max(store.watched[action.video] ?? 0, Math.round(action.seconds * 10) / 10) } };
		case 'slide': {
			const visited = store.visited_slides.includes(action.scene) ? store.visited_slides : [...store.visited_slides, action.scene];
			const branches = action.sequence && !store.branches.includes(action.sequence) ? [...store.branches, action.sequence] : store.branches;
			if (visited === store.visited_slides && branches === store.branches) return store;
			return { ...store, visited_slides: visited, branches };
		}
		case 'preset':
			return { ...store, preset: action.preset };
		case 'record': {
			const previous = store.checkpoints[action.id];
			const attempt: Attempt = { at: action.at, status: action.status, misconception: action.misconception ?? null };
			const record: CheckpointRecord = { status: action.status, answer: action.answer ?? null, history: [...(previous?.history ?? []), attempt].slice(-20) };
			return { ...store, checkpoints: { ...store.checkpoints, [action.id]: record }, updated: action.at };
		}
		case 'reset':
			return emptyStore();
		default:
			return store;
	}
}

/** Grade a choice: { status, correct, misconception, choice }. */
export function answerChoice(cp: Checkpoint, index: number) {
	const choice = cp.choices?.[index];
	if (!choice) return { status: 'skipped' as CheckpointStatus, correct: false, misconception: null, choice: null };
	const correct = choice.correct === true;
	return { status: (correct ? 'correct' : 'wrong') as CheckpointStatus, correct, misconception: correct ? null : choice.misconception ?? null, choice };
}

function valueAt(snapshot: unknown, dotted: string): unknown {
	let value: unknown = snapshot;
	for (const key of dotted.split('.')) {
		if (value === null || value === undefined || typeof value !== 'object') return undefined;
		value = (value as Record<string, unknown>)[key];
	}
	return value;
}

function test(c: Condition, snapshot: unknown): boolean {
	const actual = valueAt(snapshot, c.path);
	const expected = c.value;
	switch (c.op) {
		case 'eq':
			return actual === expected;
		case 'ne':
			return actual !== expected;
		case 'gt':
			return typeof actual === 'number' && typeof expected === 'number' && actual > expected;
		case 'gte':
			return typeof actual === 'number' && typeof expected === 'number' && actual >= expected;
		case 'lt':
			return typeof actual === 'number' && typeof expected === 'number' && actual < expected;
		case 'lte':
			return typeof actual === 'number' && typeof expected === 'number' && actual <= expected;
		case 'includes':
			return Array.isArray(actual) ? actual.includes(expected) : typeof actual === 'string' && typeof expected === 'string' && actual.includes(expected);
		default:
			return false;
	}
}

/** Whether a simulation snapshot meets a goal condition. A missing snapshot never does. */
export function evalCondition(group: ConditionGroup | undefined, snapshot: unknown): boolean {
	if (!group || snapshot === null || snapshot === undefined) return false;
	const list = 'all' in group ? group.all : [group];
	return list.length > 0 && list.every((c) => test(c, snapshot));
}

/** The scene playing at time t (the last scene when t is past the end). */
export function sceneAt(scenes: Scene[], t: number): Scene | null {
	if (!scenes.length) return null;
	for (const scene of scenes) if (t >= scene.start - 0.001 && t < scene.start + scene.duration - 0.001) return scene;
	return t < scenes[0].start ? scenes[0] : scenes[scenes.length - 1];
}

export function sceneIndex(scenes: Scene[], t: number): number {
	const scene = sceneAt(scenes, t);
	return scene ? scenes.indexOf(scene) : -1;
}

/**
 * The first unanswered scene checkpoint whose scene start lies in (prevT, t]:
 * playback crossed it going forward. Seeking backwards never fires one.
 */
export function crossedCheckpoint(prevT: number, t: number, scenes: Scene[], checkpoints: Checkpoint[], done: Record<string, unknown>): Checkpoint | null {
	if (!(t > prevT)) return null;
	for (const cp of checkpoints) {
		if (!cp.at?.scene || done[cp.id]) continue;
		const scene = scenes.find((s) => s.id === cp.at.scene);
		if (!scene) continue;
		const at = scene.start;
		if (at > prevT + 0.0005 && at <= t + 0.05) return cp;
	}
	return null;
}

/** Deck slide at time t and the branch sequence it belongs to (null on the main path). */
export function deckPosition(scenes: Scene[], t: number): { scene: string | null; sequence: string | null } {
	const scene = sceneAt(scenes, t);
	return { scene: scene?.id ?? null, sequence: scene?.sequence ?? null };
}

/** Wrong answers grouped by concept, newest misconception first. */
export function weakSummary(checkpoints: Checkpoint[], store: ProgressStore): { concept: string; wrong: number; misconceptions: string[] }[] {
	const out = new Map<string, { concept: string; wrong: number; misconceptions: string[] }>();
	for (const cp of checkpoints) {
		const record = store.checkpoints[cp.id];
		if (!record) continue;
		const wrong = record.history.filter((a) => a.status === 'wrong');
		if (!wrong.length) continue;
		for (const concept of cp.concept_ids) {
			const item = out.get(concept) ?? { concept, wrong: 0, misconceptions: [] };
			item.wrong += wrong.length;
			for (const a of [...wrong].reverse()) if (a.misconception && !item.misconceptions.includes(a.misconception)) item.misconceptions.push(a.misconception);
			out.set(concept, item);
		}
	}
	return [...out.values()].sort((a, b) => b.wrong - a.wrong);
}

/** The export the harness imports with `tutor experience <topic> progress --file`. */
export function exportProgress(topic: string, stores: Record<string, ProgressStore>, exportedAt: string) {
	const experiences: Record<string, unknown> = {};
	for (const [id, store] of Object.entries(stores)) {
		const checkpoints: Record<string, { status: CheckpointStatus; history: Attempt[] }> = {};
		for (const [cid, record] of Object.entries(store.checkpoints)) checkpoints[cid] = { status: record.status, history: record.history };
		experiences[id] = { tab: store.tab, watched: store.watched, visited_slides: store.visited_slides, branches: store.branches, updated: store.updated, checkpoints };
	}
	return { format: 'tutor-progress' as const, v: 1 as const, topic, exported_at: exportedAt, experiences };
}

/** Escape a JSON island so it cannot close its <script> element. */
export function islandJson(island: unknown): string {
	return JSON.stringify(island).replace(/</g, '\\u003c');
}
