import fs from 'node:fs';
import path from 'node:path';
import { readJson, repoRoot, stateTopicsDir } from './paths';
import { getTopic, loadTopics, type Source, type Topic } from './topics';

/**
 * One entry of state/topics/<topic>/visuals.json (harness/rubrics/visuals.md).
 * The same registry feeds the lesson site and the Obsidian vault export, so a
 * diagram, its explanation, and its sources are written once.
 */
export interface VisualEntry {
	id: string;
	title: string;
	kind: string;
	format: 'mermaid' | 'svg' | 'image' | 'component' | 'hyperframes' | 'hyperframes-slideshow' | 'experience';
	purpose: string;
	explanation: string;
	alt: string;
	concept_ids: string[];
	source_ids: string[];
	learning_check?: { question: string; answer: string };
	file?: string;
	component?: string;
	used_in?: string[];
	video?: {
		status: 'planned' | 'storyboard' | 'rendered';
		project_dir: string;
		blocker?: string | null;
		url?: string;
		captions_url?: string;
		transcript?: string;
		duration_s?: number;
		narration?: string;
	};
	/** Written by `tutor experience build`: where the resolved lesson definition is. */
	experience?: {
		mode: 'explainer' | 'interactive' | 'branching' | 'hybrid';
		built: string;
		project_dir: string;
		tabs?: string[];
		fallback_visual?: string | null;
	};
}

export interface ResolvedVisual {
	topic: Topic | null;
	entry: VisualEntry | null;
	sources: Source[];
	problem: string | null;
}

/** The topic of the page being rendered: an explicit id, the page's topic, or the URL. */
export function pageTopic(explicit: string | undefined, locals: { topicId?: string }, url: URL): Topic | null {
	const byId = getTopic(explicit ?? locals.topicId ?? '');
	if (byId) return byId;
	const [domain, subdomain, slug] = url.pathname.split('/').filter(Boolean);
	return loadTopics().find((t) => t.domain === domain && t.subdomain === subdomain && t.slug === slug) ?? null;
}

export function loadVisuals(topic: Topic): VisualEntry[] {
	const file = path.join(stateTopicsDir(), topic.domain, topic.subdomain, topic.slug, 'visuals.json');
	const data = readJson<VisualEntry[]>(file);
	return Array.isArray(data) ? data : [];
}

export function resolveVisual(topic: Topic | null, id: string): ResolvedVisual {
	if (!topic) return { topic, entry: null, sources: [], problem: `no topic for visual "${id}"` };
	const entry = loadVisuals(topic).find((e) => e.id === id) ?? null;
	if (!entry) return { topic, entry, sources: [], problem: `visual "${id}" is not registered in visuals.json; run tutor visuals ${topic.id} add` };
	const sources = entry.source_ids.map((sid) => topic.sources.find((s) => s.id === sid)).filter((s): s is Source => Boolean(s));
	return { topic, entry, sources, problem: null };
}

/** Read a repository-relative file, or null. */
export function readRepoFile(relative: string | undefined): string | null {
	if (!relative) return null;
	const file = path.resolve(repoRoot(), relative);
	if (!file.startsWith(repoRoot() + path.sep)) return null;
	try {
		return fs.readFileSync(file, 'utf8');
	} catch {
		return null;
	}
}

/** Base64 data URI of a small image, so vault assets need no copy in public/. */
export function imageDataUri(relative: string | undefined): string | null {
	if (!relative) return null;
	const file = path.resolve(repoRoot(), relative);
	if (!file.startsWith(repoRoot() + path.sep) || !fs.existsSync(file)) return null;
	const bytes = fs.readFileSync(file);
	if (bytes.length > 2_000_000) return null;
	const ext = path.extname(file).slice(1).toLowerCase();
	const mime = ext === 'jpg' ? 'jpeg' : ext;
	return `data:image/${mime};base64,${bytes.toString('base64')}`;
}

/**
 * Remove anything executable from an authored SVG before it is inlined:
 * scripts, event handlers, foreignObject, and external references. The harness
 * gate rejects these too; this is the second line of defence.
 */
export function sanitizeSvg(svg: string): string {
	return svg
		.replace(/<\?xml[^>]*>/g, '')
		.replace(/<!DOCTYPE[^>]*>/gi, '')
		.replace(/<script[\s\S]*?<\/script>/gi, '')
		.replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '')
		.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*')/gi, '')
		.replace(/(xlink:)?href\s*=\s*("|')\s*(javascript:|https?:)[^"']*\2/gi, '');
}

/** A tiny Markdown subset for transcripts: paragraphs, **bold**, and `- ` lists. */
export function simpleMarkdown(markdown: string): string {
	const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	const inline = (s: string) => escape(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
	return markdown
		.replace(/^# .*\n+/, '')
		.split(/\n{2,}/)
		.map((block) => {
			const lines = block.trim().split('\n');
			if (lines.every((l) => /^- /.test(l))) return `<ul>${lines.map((l) => `<li>${inline(l.slice(2))}</li>`).join('')}</ul>`;
			return block.trim() ? `<p>${inline(lines.join(' '))}</p>` : '';
		})
		.join('');
}

export interface StoryboardScene {
	heading: string;
	narration: string;
	duration: number;
}

/** Scenes of a video's storyboard (video.json), for the not-yet-rendered fallback. */
export function storyboardScenes(entry: VisualEntry): StoryboardScene[] {
	const raw = readRepoFile(entry.video?.project_dir ? `${entry.video.project_dir}/video.json` : undefined);
	if (!raw) return [];
	try {
		const spec = JSON.parse(raw) as { scenes?: StoryboardScene[] };
		return (spec.scenes ?? []).map((s) => ({ heading: s.heading, narration: s.narration, duration: s.duration }));
	} catch {
		return [];
	}
}
