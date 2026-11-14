import fs from 'node:fs';
import path from 'node:path';
import type { Loader, LoaderContext } from 'astro/loaders';
import { repoRoot } from './paths';
import { loadTopics, type Topic } from './topics';
import { classifyNote, hasContent, listNoteFiles, noteTitle, parseFrontmatter, parseRecallCards, prepareBody, stepOpen } from './vault';
import { convertWikilinks } from './wikilinks';

/**
 * Content loader for the Obsidian vault (`../vault`, outside the site root).
 *
 * For every topic in `state/topics` it reads the topic's vault notes, converts
 * wikilinks, renders the markdown with Astro's own pipeline, and stores one
 * entry per note that has a page on the site. Entry id:
 * `<domain>/<subdomain>/<slug>/<path-inside-topic-without-.md>`.
 */
export function vaultLoader(): Loader {
	return {
		name: 'tutor-vault',
		load: async (context: LoaderContext) => {
			await sync(context);
			const { watcher } = context;
			if (!watcher) return;
			const roots = [path.join(repoRoot(), 'vault'), path.join(repoRoot(), 'state')];
			for (const root of roots) if (fs.existsSync(root)) watcher.add(root);
			let timer: ReturnType<typeof setTimeout> | undefined;
			const onChange = (file: string) => {
				if (!roots.some((root) => file.startsWith(root))) return;
				clearTimeout(timer);
				timer = setTimeout(() => {
					sync(context).catch((error) => context.logger.error(String(error)));
				}, 150);
			};
			watcher.on('add', onChange);
			watcher.on('change', onChange);
			watcher.on('unlink', onChange);
		},
	};
}

interface Pending {
	topic: Topic;
	rel: string;
	file: string;
	url: string | null;
}

async function sync({ store, renderMarkdown, parseData, generateDigest, logger }: LoaderContext) {
	const topics = loadTopics();
	const notes: Pending[] = [];
	/** note file name (lower case, no extension) -> site URL */
	const links = new Map<string, string>();

	for (const topic of topics) {
		for (const rel of listNoteFiles(topic)) {
			const cls = classifyNote(rel);
			const file = path.join(topic.vaultDir, rel);
			const stem = path.basename(rel).replace(/\.md$/i, '').toLowerCase();
			let url: string | null = null;
			if (cls.role === 'map') {
				// 00-start-here and 02-lesson have no page: the topic home is their page.
				links.set(stem, cls.step === 'lesson' ? `${topic.url}#step-lesson` : topic.url);
			} else if (cls.route && cls.step && stepOpen(topic, cls.step)) {
				url = topic.url + cls.route;
			}
			notes.push({ topic, rel, file, url });
			if (url) links.set(stem, url);
		}
	}

	const resolve = (name: string) => links.get(name.toLowerCase()) ?? null;
	const seen = new Set<string>();

	for (const note of notes) {
		if (!note.url) continue;
		const cls = classifyNote(note.rel);
		const raw = fs.readFileSync(note.file, 'utf8');
		const { data: frontmatter, body: rawBody } = parseFrontmatter(raw);
		const { body, heading } = prepareBody(rawBody);
		if (cls.step === 'insights' && !hasContent(body)) {
			links.delete(path.basename(note.rel).replace(/\.md$/i, '').toLowerCase());
			continue;
		}
		const markdown = convertWikilinks(body, resolve);
		const cards = [];
		if (cls.step === 'recall') {
			for (const card of parseRecallCards(body)) {
				const [q, a] = await Promise.all([
					renderMarkdown(convertWikilinks(card.question, resolve)),
					renderMarkdown(convertWikilinks(card.answer, resolve)),
				]);
				cards.push({ id: card.id, question: q.html, answer: a.html });
			}
		}
		const id = `${note.topic.id}/${note.rel.replace(/\.md$/i, '')}`;
		const data = await parseData({
			id,
			data: {
				topic: note.topic.id,
				rel: note.rel,
				step: cls.step,
				route: cls.route,
				role: cls.role,
				order: cls.order,
				group: cls.group,
				title: noteTitle(frontmatter.title, heading, note.rel, note.topic.slug),
				stage: frontmatter.stage,
				cards,
			},
		});
		const rendered = await renderMarkdown(markdown);
		store.set({ id, data, body: markdown, rendered, digest: generateDigest({ data, markdown }) });
		seen.add(id);
	}

	for (const key of store.keys()) if (!seen.has(key)) store.delete(key);
	logger.info(`vault: ${seen.size} note${seen.size === 1 ? '' : 's'} from ${topics.length} topic${topics.length === 1 ? '' : 's'}`);
}
