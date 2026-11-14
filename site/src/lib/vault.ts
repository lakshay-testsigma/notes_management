import fs from 'node:fs';
import path from 'node:path';
import { humanize } from './paths';
import type { Topic } from './topics';

/**
 * The numbered reading path of a topic. `stage` is the generation stage in
 * topic.json that produces the step (ARCHITECTURE §4.1).
 */
export const STEPS = [
	{ id: 'brief', n: '01', title: 'Brief', stage: 'brief' },
	{ id: 'lesson', n: '02', title: 'Lesson', stage: 'lesson' },
	{ id: 'mini-projects', n: '03', title: 'Mini projects', stage: 'mini-projects' },
	{ id: 'digests', n: '04', title: 'Digests', stage: 'digest' },
	{ id: 'repo-intel', n: '05', title: 'Open-source deep dive', stage: 'repo-intel' },
	{ id: 'capstone', n: '06', title: 'Capstone', stage: 'capstone' },
	{ id: 'final-notes', n: '07', title: 'Final notes', stage: 'notes' },
	{ id: 'recall', n: '08', title: 'Recall', stage: 'notes' },
	{ id: 'extra', n: '', title: 'More notes', stage: null },
	{ id: 'resources', n: '09', title: 'Resources', stage: 'research' },
	{ id: 'insights', n: '', title: 'My insights', stage: null },
] as const;

export type StepId = (typeof STEPS)[number]['id'];

/** A step is readable once its stage has left `pending` (and was not skipped). */
export function stepOpen(topic: Topic, stepId: StepId): boolean {
	const step = STEPS.find((s) => s.id === stepId);
	if (!step?.stage) return true;
	const status = topic.stages[step.stage];
	return status !== 'pending' && status !== 'skipped';
}

export interface NoteClass {
	step: StepId | null;
	/** Path below the topic URL, with trailing slash. `null` = no page of its own. */
	route: string | null;
	/** 'index' notes come first inside their step. */
	order: number;
	role: 'page' | 'index' | 'child' | 'map';
	group?: string;
}

const REPO_ORDER = ['overview', 'architecture', 'module', 'tech-and-services', 'pattern', 'findings', 'takeaways'];

/** Decide what a vault note is from its path inside the topic folder (§3.1, §10). */
export function classifyNote(rel: string): NoteClass {
	const parts = rel.replace(/\.md$/i, '').split('/');
	const stem = parts[parts.length - 1];
	if (parts.length === 1) {
		if (stem.startsWith('00-start-here')) return { step: null, route: null, order: 0, role: 'map' };
		if (stem.startsWith('01-brief')) return { step: 'brief', route: 'brief/', order: 0, role: 'page' };
		if (stem.startsWith('02-lesson')) return { step: 'lesson', route: null, order: 0, role: 'map' };
		if (stem.startsWith('03-mini-projects')) return { step: 'mini-projects', route: 'mini-projects/', order: 0, role: 'page' };
		if (stem.startsWith('06-capstone')) return { step: 'capstone', route: 'capstone/', order: 0, role: 'page' };
		if (stem.startsWith('07-final-notes')) return { step: 'final-notes', route: 'final-notes/', order: 0, role: 'page' };
		if (stem.startsWith('08-recall')) return { step: 'recall', route: 'recall/', order: 0, role: 'page' };
		if (stem.startsWith('09-resources')) return { step: 'resources', route: 'resources/', order: 0, role: 'page' };
		if (stem.startsWith('my-insights')) return { step: 'insights', route: 'my-insights/', order: 0, role: 'page' };
	}
	if (parts[0] === '04-digests') {
		if (stem.startsWith('00-digests')) return { step: 'digests', route: 'digests/', order: 0, role: 'index' };
		return { step: 'digests', route: `digests/${stem}/`, order: 1, role: 'child' };
	}
	if (parts[0] === '05-repo-intel') {
		if (parts.length === 2 && stem.startsWith('00-repo-intel')) {
			return { step: 'repo-intel', route: 'repo-intel/', order: 0, role: 'index' };
		}
		const repo = parts.length > 2 ? parts[1] : 'notes';
		const rank = REPO_ORDER.findIndex((key) => new RegExp(`(^|-)${key}(-|$)`).test(stem));
		return {
			step: 'repo-intel',
			route: `repo-intel/${repo}/${stem}/`,
			order: 1 + (rank === -1 ? REPO_ORDER.length : rank),
			role: 'child',
			group: repo,
		};
	}
	return { step: 'extra', route: `notes/${parts.join('/')}/`, order: 1, role: 'child' };
}

/** All markdown files of a topic's vault folder, as posix paths relative to it. */
export function listNoteFiles(topic: Topic): string[] {
	const out: string[] = [];
	const walk = (dir: string, prefix: string) => {
		if (!fs.existsSync(dir)) return;
		for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
			if (entry.name.startsWith('.')) continue;
			const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
			if (entry.isDirectory()) walk(path.join(dir, entry.name), rel);
			else if (/\.md$/i.test(entry.name)) out.push(rel);
		}
	};
	walk(topic.vaultDir, '');
	return out.sort();
}

/** Minimal frontmatter reader: enough for `title:` and `stage:` (§11). */
export function parseFrontmatter(text: string): { data: Record<string, string>; body: string } {
	const match = text.match(/^﻿?---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/);
	if (!match) return { data: {}, body: text };
	const data: Record<string, string> = {};
	for (const line of match[1].split(/\r?\n/)) {
		const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
		if (kv) data[kv[1]] = kv[2].trim().replace(/^(['"])(.*)\1$/, '$2');
	}
	return { data, body: text.slice(match[0].length) };
}

/**
 * Prepare a note body for the site:
 * - drop a leading `# Title` (the page layout prints the title),
 * - drop a trailing `## My insights` heading that has nothing under it,
 * - turn Obsidian callout markers (`> [!note] Title`) into a bold lead-in.
 */
export function prepareBody(body: string): { body: string; heading: string | null } {
	let text = body.replace(/\r\n/g, '\n');
	let heading: string | null = null;
	const lead = text.match(/^\s*#\s+(.+?)\s*#*\s*\n/);
	if (lead) {
		heading = lead[1].trim();
		text = text.slice(lead[0].length);
	}
	text = text.replace(/\n##\s+My insights\s*$/i, '\n').replace(/^##\s+My insights\s*$/i, '');
	text = text.replace(/^(\s*>\s*)\[!(\w+)\][+-]?[ \t]*(.*)$/gm, (_m, quote: string, kind: string, title: string) => {
		const label = title.trim() || kind.charAt(0).toUpperCase() + kind.slice(1).toLowerCase();
		return `${quote}**${label}.**`;
	});
	return { body: text, heading };
}

/** True when a note has something to read besides headings and comments. */
export function hasContent(body: string): boolean {
	return (
		body
			.replace(/<!--[\s\S]*?-->/g, '')
			.replace(/^\s*#{1,6}\s.*$/gm, '')
			.trim().length > 0
	);
}

export interface RawCard {
	id: string;
	question: string;
	answer: string;
}

/**
 * Recall cards (§11): an id comment, the question, a line with only `?`,
 * then the answer. A card ends at the next card, the next heading, or the end.
 */
export function parseRecallCards(body: string): RawCard[] {
	const cards: RawCard[] = [];
	const marker = /<!--\s*card:\s*([^\s>]+)\s*-->/g;
	const hits = [...body.matchAll(marker)];
	hits.forEach((hit, i) => {
		const start = (hit.index ?? 0) + hit[0].length;
		const end = i + 1 < hits.length ? (hits[i + 1].index ?? body.length) : body.length;
		let chunk = body.slice(start, end);
		const nextHeading = chunk.search(/^#{1,6}\s/m);
		if (nextHeading !== -1) chunk = chunk.slice(0, nextHeading);
		const lines = chunk.split('\n');
		const sep = lines.findIndex((line) => line.trim() === '?');
		if (sep === -1) return;
		const question = lines.slice(0, sep).join('\n').trim();
		const answer = lines.slice(sep + 1).join('\n').trim();
		if (question && answer) cards.push({ id: hit[1], question, answer });
	});
	return cards;
}

export function noteTitle(frontmatterTitle: string | undefined, heading: string | null, rel: string, slug: string): string {
	if (frontmatterTitle) return frontmatterTitle;
	if (heading) return heading;
	const stem = (rel.split('/').pop() ?? rel).replace(/\.md$/i, '');
	return humanize(stem.replace(new RegExp(`-${slug}$`), '').replace(/^\d+-/, ''));
}
