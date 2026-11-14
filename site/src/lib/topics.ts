import fs from 'node:fs';
import { indexOrder } from '../../../harness/lib/reading-order.mjs';
import path from 'node:path';
import { domainPacksDir, humanize, readJson, repoRoot, stateTopicsDir } from './paths';

/** One vetted source, as written in `state/.../sources.json` (ARCHITECTURE §9). */
export interface Source {
	id: string;
	type: string;
	title: string;
	url: string;
	authors?: string;
	year?: number | null;
	tier?: string;
	why_trusted?: string;
	use_for?: string[];
}

export type StageStatus = 'pending' | 'in_progress' | 'done' | 'skipped' | 'failed';

export interface Topic {
	/** `domain/subdomain/slug` */
	id: string;
	domain: string;
	subdomain: string;
	slug: string;
	title: string;
	summary: string;
	depth: string;
	outcomes: string[];
	/** stage id -> status, straight from topic.json */
	stages: Record<string, StageStatus>;
	readerOrder: Record<string, string[]>;
	/** absolute path of the topic's folder in the Obsidian vault */
	vaultDir: string;
	sources: Source[];
	/** site URL of the topic home, with trailing slash */
	url: string;
}

export interface DomainInfo {
	id: string;
	title: string;
	description: string;
	subdomainTitles: Record<string, string>;
}

let topicCache: Topic[] | null = null;

function findTopicFiles(dir: string, depth = 0): string[] {
	if (depth > 3 || !fs.existsSync(dir)) return [];
	const found: string[] = [];
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		if (entry.name.startsWith('.')) continue;
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) found.push(...findTopicFiles(full, depth + 1));
		else if (entry.name === 'topic.json' && depth === 3) found.push(full);
	}
	return found;
}

function toTopic(file: string): Topic | null {
	const raw = readJson<Record<string, any>>(file);
	if (!raw) return null;
	const rel = path.relative(stateTopicsDir(), path.dirname(file)).split(path.sep);
	const [domain, subdomain, slug] = [raw.domain ?? rel[0], raw.subdomain ?? rel[1], raw.slug ?? rel[2]];
	if (!domain || !subdomain || !slug) return null;
	const id = `${domain}/${subdomain}/${slug}`;
	const stages: Record<string, StageStatus> = {};
	for (const stage of Array.isArray(raw.stages) ? raw.stages : []) {
		if (stage?.id) stages[stage.id] = stage.status ?? 'pending';
	}
	const sourcesRaw = readJson<unknown>(path.join(path.dirname(file), 'sources.json'));
	const sources = (Array.isArray(sourcesRaw) ? sourcesRaw : []).filter(
		(s): s is Source => !!s && typeof s === 'object' && typeof (s as Source).url === 'string' && typeof (s as Source).title === 'string',
	);
	const vaultRel = typeof raw.paths?.vault === 'string' ? raw.paths.vault : path.join('vault', domain, subdomain, slug);
	// Preview legacy topics without writing their state; readiness still requires saved order.
	const readerOrder: Record<string, string[]> = { ...(raw.reader_order ?? {}) };
	for (const stage of ['digest', 'repo-intel']) {
		if (!Array.isArray(readerOrder[stage])) {
			readerOrder[stage] = indexOrder(repoRoot(), { slug, paths: { vault: vaultRel } }, stage);
		}
	}
	return {
		id,
		domain,
		subdomain,
		slug,
		title: raw.title ?? humanize(slug),
		summary: raw.plan?.summary ?? '',
		depth: raw.depth ?? 'standard',
		outcomes: Array.isArray(raw.plan?.outcomes) ? raw.plan.outcomes.filter((o: unknown) => typeof o === 'string') : [],
		stages,
		readerOrder,
		vaultDir: path.resolve(repoRoot(), vaultRel),
		sources,
		url: `/${domain}/${subdomain}/${slug}/`,
	};
}

/** Every topic found under `state/topics`, sorted by title. Empty when none exist. */
export function loadTopics(): Topic[] {
	if (topicCache && import.meta.env?.PROD) return topicCache;
	const topics = findTopicFiles(stateTopicsDir())
		.map(toTopic)
		.filter((t): t is Topic => t !== null)
		.sort((a, b) => a.title.localeCompare(b.title));
	topicCache = topics;
	return topics;
}

export function getTopic(id: string): Topic | undefined {
	return loadTopics().find((t) => t.id === id);
}

/** Title and description from `harness/domains/<id>/pack.json`, or a humanized id. */
export function domainInfo(id: string): DomainInfo {
	const pack = readJson<Record<string, any>>(path.join(domainPacksDir(), id, 'pack.json'));
	const subdomainTitles: Record<string, string> = {};
	for (const sub of Array.isArray(pack?.subdomains) ? pack!.subdomains : []) {
		if (sub?.id && sub?.title) subdomainTitles[sub.id] = sub.title;
	}
	return {
		id,
		title: typeof pack?.title === 'string' ? pack.title : humanize(id),
		description: typeof pack?.description === 'string' ? pack.description : '',
		subdomainTitles,
	};
}

export function subdomainTitle(domain: DomainInfo, subdomain: string): string {
	return domain.subdomainTitles[subdomain] ?? humanize(subdomain);
}

export interface DomainGroup {
	info: DomainInfo;
	subdomains: { id: string; title: string; topics: Topic[] }[];
	topicCount: number;
}

/** Topics grouped domain -> subdomain, only for domains that have topics. */
export function loadDomains(): DomainGroup[] {
	const byDomain = new Map<string, Topic[]>();
	for (const topic of loadTopics()) {
		byDomain.set(topic.domain, [...(byDomain.get(topic.domain) ?? []), topic]);
	}
	return [...byDomain.entries()]
		.map(([id, topics]) => {
			const info = domainInfo(id);
			const bySub = new Map<string, Topic[]>();
			for (const topic of topics) bySub.set(topic.subdomain, [...(bySub.get(topic.subdomain) ?? []), topic]);
			const subdomains = [...bySub.entries()]
				.map(([sub, list]) => ({ id: sub, title: subdomainTitle(info, sub), topics: list }))
				.sort((a, b) => a.title.localeCompare(b.title));
			return { info, subdomains, topicCount: topics.length };
		})
		.sort((a, b) => a.info.title.localeCompare(b.info.title));
}
