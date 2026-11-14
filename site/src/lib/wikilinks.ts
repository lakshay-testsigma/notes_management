/**
 * Obsidian wikilinks -> ordinary markdown.
 *
 * `[[note-file-name|Shown text]]` and `[[note-file-name]]` become a markdown
 * link when `resolve` knows a site URL for the note, and plain text otherwise.
 * Fenced code blocks and inline code are left untouched.
 */
export type ResolveLink = (noteName: string) => string | null;

const WIKILINK = /(!?)\[\[([^\[\]\n]+?)\]\]/g;

function escapeLinkText(text: string): string {
	return text.replace(/([\[\]])/g, '\\$1');
}

/** Split `target|alias` (the pipe may be escaped as `\|` inside tables). */
export function parseWikilink(inner: string): { name: string; heading: string | null; shown: string } {
	const pipe = inner.search(/\\?\|/);
	const target = (pipe === -1 ? inner : inner.slice(0, pipe)).trim();
	const alias = pipe === -1 ? null : inner.slice(pipe).replace(/^\\?\|/, '').trim();
	const hash = target.search(/[#^]/);
	const file = (hash === -1 ? target : target.slice(0, hash)).trim();
	const heading = hash === -1 ? null : target.slice(hash + 1).trim() || null;
	const name = file.replace(/^vault\//, '').replace(/\.md$/i, '');
	const shown = alias || name.split('/').pop() || heading || target;
	return { name, heading, shown };
}

function convertSegment(text: string, resolve: ResolveLink): string {
	return text.replace(WIKILINK, (_match, _bang: string, inner: string) => {
		const { name, shown } = parseWikilink(inner);
		const url = name ? resolve(name) : null;
		return url ? `[${escapeLinkText(shown)}](${url})` : shown;
	});
}

function convertLine(line: string, resolve: ResolveLink): string {
	// Keep inline code spans as they are: split on backtick runs.
	const parts = line.split(/(`+[^`]*`+)/g);
	return parts.map((part, i) => (i % 2 === 1 ? part : convertSegment(part, resolve))).join('');
}

export function convertWikilinks(markdown: string, resolve: ResolveLink): string {
	const out: string[] = [];
	let fence: string | null = null;
	for (const line of markdown.split('\n')) {
		const marker = line.match(/^\s*(`{3,}|~{3,})/);
		if (marker) {
			if (!fence) fence = marker[1][0];
			else if (marker[1][0] === fence) fence = null;
			out.push(line);
			continue;
		}
		out.push(fence ? line : convertLine(line, resolve));
	}
	return out.join('\n');
}
