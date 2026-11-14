import { getCollection, type CollectionEntry } from 'astro:content';
import type { Topic } from './topics';
import { STEPS, stepOpen, type StepId } from './vault';

export interface NavPage {
	/** Path below the topic URL, e.g. `lesson/01-what-is-a-stream/`. Unique per topic. */
	route: string;
	url: string;
	title: string;
	step: StepId;
	kind: 'lesson' | 'note' | 'recall' | 'resources';
	/** Small line above the title, e.g. `02 Lesson · page 2 of 4`. */
	eyebrow: string;
	lesson?: CollectionEntry<'lessons'>;
	note?: CollectionEntry<'vault'>;
}

export interface NavStep {
	id: StepId;
	n: string;
	title: string;
	blurb: string;
	pages: NavPage[];
}

export interface TopicNav {
	topic: Topic;
	steps: NavStep[];
	/** Every page in reading order. */
	pages: NavPage[];
	/** Step titles whose stage has not been generated yet. */
	upcoming: string[];
}

const cache = new Map<string, TopicNav>();

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/**
 * The reading order of one topic, derived from the lessons collection, the
 * vault notes and sources.json. Nothing is registered by hand.
 */
export async function getTopicNav(topic: Topic): Promise<TopicNav> {
	const cached = cache.get(topic.id);
	if (cached && import.meta.env.PROD) return cached;

	const prefix = `${topic.id}/`;
	const lessons = stepOpen(topic, 'lesson')
		? (await getCollection('lessons', (entry) => entry.id.startsWith(prefix))).sort(
				(a, b) => a.data.order - b.data.order || a.id.localeCompare(b.id),
			)
		: [];
	const notes = await getCollection('vault', (entry) => entry.data.topic === topic.id);
	const notesOf = (step: StepId) => {
		const stage = step === 'digests' ? 'digest' : step;
		const sequence = topic.readerOrder[stage];
		const children = notes.filter(n => n.data.step === step);
		if (['digest','repo-intel'].includes(stage) && children.some(n => n.data.role !== 'index')) {
			const paths = children.filter(n => n.data.role !== 'index').map(n => n.data.rel);
			if (!sequence || new Set(sequence).size !== sequence.length || sequence.length !== paths.length || paths.some(p => !sequence.includes(p)))
				throw new Error(`${topic.id}: ${stage} needs a complete reader_order; run tutor order import-indexes`);
		}
		return children.sort((a,b) =>
			(a.data.role === 'index' ? 0 : 1) - (b.data.role === 'index' ? 0 : 1) ||
			(sequence ? sequence.indexOf(a.data.rel) - sequence.indexOf(b.data.rel) : a.data.order - b.data.order) ||
			a.data.rel.localeCompare(b.data.rel));
	};

	const steps: NavStep[] = [];
	for (const step of STEPS) {
		const label = [step.n, step.title].filter(Boolean).join(' ');
		const pages: NavPage[] = [];
		let blurb = '';
		const add = (page: Omit<NavPage, 'url' | 'step' | 'eyebrow'>) =>
			pages.push({ ...page, url: topic.url + page.route, step: step.id, eyebrow: label });

		if (step.id === 'lesson') {
			for (const lesson of lessons) {
				add({ route: `lesson/${lesson.id.slice(prefix.length)}/`, title: lesson.data.title, kind: 'lesson', lesson });
			}
			blurb = `${plural(lessons.length, 'interactive page')}`;
		} else if (step.id === 'resources') {
			const note = notesOf('resources')[0];
			if (topic.sources.length > 0 && stepOpen(topic, 'resources')) {
				add({ route: 'resources/', title: 'Resources', kind: 'resources' });
				blurb = `${plural(topic.sources.length, 'vetted source')}`;
			} else if (note) {
				add({ route: note.data.route, title: note.data.title, kind: 'note', note });
				blurb = 'Where to read further';
			}
		} else {
			for (const note of notesOf(step.id)) {
				const isDeck = step.id === 'recall' && note.data.cards.length > 0;
				add({ route: note.data.route, title: note.data.title, kind: isDeck ? 'recall' : 'note', note });
			}
			const children = pages.length - 1;
			blurb =
				{
					brief: 'What it is and why it matters',
					'mini-projects': 'Small builds with real use cases',
					digests: children > 0 ? `${plural(children, 'paper or doc')} summarized` : 'The canonical papers and docs',
					'repo-intel': 'How a production repository does it',
					capstone: 'A production-style project',
					'final-notes': 'The one-page refresher',
					recall: pages[0]?.note ? `${plural(pages[0].note.data.cards.length, 'card')} to test yourself` : '',
					extra: '',
					insights: 'Your own additions',
				}[step.id as Exclude<StepId, 'lesson' | 'resources'>] ?? '';
		}

		if (pages.length > 1) {
			pages.forEach((page, i) => {
				const unit = step.id === 'lesson' ? 'page ' : '';
				page.eyebrow = `${label} · ${unit}${i + 1} of ${pages.length}`;
			});
		}
		if (pages.length > 0) steps.push({ id: step.id, n: step.n, title: step.title, blurb, pages });
	}

	const shown = new Set(steps.map((s) => s.id));
	const upcoming = STEPS.filter(
		(step) => step.stage && !shown.has(step.id) && ['pending', 'in_progress'].includes(topic.stages[step.stage] ?? ''),
	).map((step) => step.title);

	const nav: TopicNav = { topic, steps, pages: steps.flatMap((s) => s.pages), upcoming };
	cache.set(topic.id, nav);
	return nav;
}

export interface Neighbours {
	index: number;
	total: number;
	prev: { title: string; url: string; label: string } | null;
	next: { title: string; url: string; label: string } | null;
}

/** Previous / next links for a page. The topic home sits before the first page. */
export function neighbours(nav: TopicNav, route: string): Neighbours {
	const index = nav.pages.findIndex((p) => p.route === route);
	const total = nav.pages.length;
	const link = (page: NavPage) => ({ title: page.title, url: page.url, label: page.eyebrow });
	const home = { title: nav.topic.title, url: nav.topic.url, label: 'Topic overview' };
	return {
		index,
		total,
		prev: index > 0 ? link(nav.pages[index - 1]) : home,
		next: index + 1 < total ? link(nav.pages[index + 1]) : null,
	};
}
