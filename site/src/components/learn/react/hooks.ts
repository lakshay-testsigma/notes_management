import { useEffect, useRef, useState, type RefObject } from 'react';

/** True when the learner asked the system for less motion. False on the server. */
export function useReducedMotion(): boolean {
	const [reduced, setReduced] = useState(false);
	useEffect(() => {
		const query = window.matchMedia('(prefers-reduced-motion: reduce)');
		const update = () => setReduced(query.matches);
		update();
		query.addEventListener('change', update);
		return () => query.removeEventListener('change', update);
	}, []);
	return reduced;
}

/** Width of an element in CSS pixels, or `null` until it has been measured. */
export function useElementWidth<T extends HTMLElement>(): [RefObject<T | null>, number | null] {
	const ref = useRef<T | null>(null);
	const [width, setWidth] = useState<number | null>(null);
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const update = () => setWidth(Math.round(el.getBoundingClientRect().width));
		update();
		const observer = new ResizeObserver(update);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);
	return [ref, width];
}

/** A number that changes whenever the colour theme changes (for canvas redraws). */
export function useThemeVersion(): number {
	const [version, setVersion] = useState(0);
	useEffect(() => {
		const bump = () => setVersion((v) => v + 1);
		document.addEventListener('themechange', bump);
		const query = window.matchMedia('(prefers-color-scheme: dark)');
		query.addEventListener('change', bump);
		return () => {
			document.removeEventListener('themechange', bump);
			query.removeEventListener('change', bump);
		};
	}, []);
	return version;
}

/** Read a CSS custom property such as `--accent` from the page. */
export function readToken(name: string): string {
	return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function hashString(text: string): number {
	let h = 2166136261;
	for (let i = 0; i < text.length; i++) {
		h ^= text.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}

/** Deterministic pseudo random numbers, so server and browser agree. */
export function seededRandom(seed: number): () => number {
	let s = seed >>> 0 || 1;
	return () => {
		s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
		return s / 4294967296;
	};
}

/** Shuffle that never returns the original order (when there are 2+ distinct items). */
export function seededShuffle<T>(items: T[], seed: number): T[] {
	const random = seededRandom(seed);
	const out = [...items];
	for (let attempt = 0; attempt < 5; attempt++) {
		for (let i = out.length - 1; i > 0; i--) {
			const j = Math.floor(random() * (i + 1));
			[out[i], out[j]] = [out[j], out[i]];
		}
		if (out.length < 2 || out.some((item, i) => item !== items[i])) break;
	}
	return out;
}

/** Short number for readouts: 0.3333 -> 0.333, 12000 -> 12,000. */
export function formatNumber(value: number, digits = 3): string {
	if (!Number.isFinite(value)) return '–';
	const abs = Math.abs(value);
	if (abs !== 0 && (abs >= 1e9 || abs < 1e-4)) return value.toExponential(2);
	const rounded = Number(value.toFixed(abs >= 100 ? Math.min(digits, 1) : digits));
	return rounded.toLocaleString('en-US', { maximumFractionDigits: digits });
}

/**
 * Round a coordinate for SVG output. Node and the browser can differ in the last
 * digit of Math.exp, sin or cos; unrounded, that shows up as a hydration mismatch.
 */
export const px = (value: number) => Math.round(value * 100) / 100;

export const seriesColor = (i: number) => `var(--s${(i % 8) + 1})`;
