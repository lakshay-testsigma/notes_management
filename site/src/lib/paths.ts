import fs from 'node:fs';
import path from 'node:path';

/**
 * Absolute path of the repository root (the folder that holds `state/`,
 * `vault/`, `harness/` and `site/`).
 *
 * `astro.config.mjs` sets TUTOR_REPO_ROOT. The fallbacks cover the case where
 * a module is loaded before the config (or the variable was cleared).
 */
export function repoRoot(): string {
	const fromEnv = process.env.TUTOR_REPO_ROOT;
	if (fromEnv) return path.resolve(fromEnv);
	const cwd = process.cwd();
	if (fs.existsSync(path.join(cwd, 'astro.config.mjs'))) return path.resolve(cwd, '..');
	if (fs.existsSync(path.join(cwd, 'site', 'astro.config.mjs'))) return cwd;
	return path.resolve(cwd, '..');
}

export const stateTopicsDir = () => path.join(repoRoot(), 'state', 'topics');
export const vaultDir = () => path.join(repoRoot(), 'vault');
export const domainPacksDir = () => path.join(repoRoot(), 'harness', 'domains');

export function readJson<T>(file: string): T | null {
	try {
		return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
	} catch {
		return null;
	}
}

/** `ai-engineering` -> `AI Engineering`, `rag_basics` -> `Rag Basics`. */
export function humanize(id: string): string {
	const upper = new Set(['ai', 'ml', 'api', 'rag', 'llm', 'sql', 'css', 'html', 'ui', 'ux', 'ci', 'cd', 'devops']);
	return id
		.split(/[-_\s]+/)
		.filter(Boolean)
		.map((word) => {
			const lower = word.toLowerCase();
			if (lower === 'devops') return 'DevOps';
			if (upper.has(lower)) return lower.toUpperCase();
			return lower.charAt(0).toUpperCase() + lower.slice(1);
		})
		.join(' ');
}
