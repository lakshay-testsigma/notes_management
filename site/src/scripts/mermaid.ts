/**
 * Draws mermaid diagrams in the browser.
 *
 * Targets: ```mermaid fences in vault notes and lessons (left unhighlighted by
 * astro.config.mjs) and the <Mermaid /> lesson component (`[data-mermaid]`).
 * The mermaid library is only downloaded when a diagram comes near the viewport,
 * and diagrams are redrawn when the colour theme changes. If drawing fails the
 * diagram source stays visible as text.
 */
type MermaidApi = typeof import('mermaid').default;

let api: Promise<MermaidApi> | null = null;
let counter = 0;
const hosts: HTMLElement[] = [];

function token(name: string): string {
	return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function configure(mermaid: MermaidApi) {
	const text = token('--text');
	const line = token('--line-strong');
	mermaid.initialize({
		startOnLoad: false,
		securityLevel: 'strict',
		theme: 'base',
		fontFamily: getComputedStyle(document.body).fontFamily,
		themeVariables: {
			darkMode: document.documentElement.getAttribute('data-theme') === 'dark',
			background: token('--bg'),
			fontSize: '15px',
			primaryColor: token('--bg'),
			primaryTextColor: text,
			primaryBorderColor: line,
			secondaryColor: token('--surface'),
			secondaryTextColor: text,
			secondaryBorderColor: line,
			tertiaryColor: token('--bg'),
			tertiaryTextColor: text,
			tertiaryBorderColor: token('--line'),
			lineColor: token('--muted'),
			textColor: text,
			mainBkg: token('--bg'),
			nodeBorder: line,
			clusterBkg: token('--bg'),
			clusterBorder: token('--line'),
			titleColor: text,
			edgeLabelBackground: token('--bg'),
			actorBkg: token('--bg'),
			actorBorder: line,
			actorTextColor: text,
			actorLineColor: line,
			signalColor: token('--text-2'),
			signalTextColor: text,
			labelBoxBkgColor: token('--surface'),
			labelBoxBorderColor: line,
			labelTextColor: text,
			loopTextColor: text,
			noteBkgColor: token('--surface'),
			noteBorderColor: token('--line'),
			noteTextColor: text,
			activationBkgColor: token('--surface'),
			activationBorderColor: line,
		},
	});
}

async function draw(host: HTMLElement) {
	const source = host.dataset.mermaidSrc ?? '';
	if (!source.trim()) return;
	try {
		api ??= import('mermaid').then((m) => m.default);
		const mermaid = await api;
		configure(mermaid);
		const { svg } = await mermaid.render(`mermaid-${++counter}`, source);
		host.innerHTML = svg;
		host.classList.add('is-drawn');
	} catch (error) {
		console.warn('Mermaid diagram could not be drawn', error);
		document.querySelectorAll('body > [id^="dmermaid-"], body > [id^="mermaid-"]').forEach((el) => el.remove());
	}
}

function collect() {
	const blocks = document.querySelectorAll<HTMLElement>(
		'pre > code.language-mermaid, pre[data-language="mermaid"], [data-mermaid]:not([data-mermaid-src])',
	);
	for (const block of blocks) {
		const pre = block.matches('code') ? (block.parentElement as HTMLElement) : block;
		if (pre.dataset.mermaidDone) continue;
		pre.dataset.mermaidDone = 'true';
		const host = document.createElement('div');
		host.className = 'mermaid-diagram';
		host.dataset.mermaidSrc = block.textContent ?? '';
		// Keep the source visible until (and unless) the drawing succeeds.
		const fallback = document.createElement('pre');
		fallback.textContent = host.dataset.mermaidSrc;
		host.append(fallback);
		pre.replaceWith(host);
		hosts.push(host);
	}
}

function start() {
	collect();
	if (hosts.length === 0) return;
	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				observer.unobserve(entry.target);
				void draw(entry.target as HTMLElement);
			}
		},
		{ rootMargin: '400px 0px' },
	);
	hosts.forEach((host) => observer.observe(host));
	document.addEventListener('themechange', () => {
		hosts.filter((host) => host.classList.contains('is-drawn')).forEach((host) => void draw(host));
	});
}

start();
