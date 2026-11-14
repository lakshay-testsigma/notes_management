/**
 * Fills a hidden `[data-continue]` paragraph with a link to the last page the
 * learner read. `data-continue=""` uses the last page of any topic;
 * `data-continue="<topic id>"` only that topic's.
 */
for (const el of document.querySelectorAll<HTMLElement>('[data-continue]')) {
	const key = el.dataset.continue ? `tutor:last:${el.dataset.continue}` : 'tutor:last';
	try {
		const raw = localStorage.getItem(key);
		if (!raw) continue;
		const last = JSON.parse(raw) as { url?: string; title?: string; topic?: string };
		if (typeof last.url !== 'string' || !last.url.startsWith('/')) continue;
		const link = el.querySelector('a');
		if (!link) continue;
		link.setAttribute('href', last.url);
		link.textContent = el.dataset.continue ? (last.title ?? 'last page') : `${last.topic ?? ''} — ${last.title ?? ''}`;
		el.hidden = false;
	} catch {
		// No storage: the paragraph stays hidden.
	}
}
