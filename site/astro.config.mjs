// @ts-check

import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import { defineConfig, fontProviders } from 'astro/config';
import { fileURLToPath } from 'node:url';

// The site reads topics from ../state and ../vault (see src/lib/paths.ts).
// Everything that runs inside Astro resolves the repository root from here.
process.env.TUTOR_REPO_ROOT ??= fileURLToPath(new URL('..', import.meta.url));

// https://astro.build/config
export default defineConfig({
	site: 'http://localhost:4321',
	integrations: [react(), mdx()],
	markdown: {
		// Mermaid fences are left as plain <pre><code> and drawn in the browser
		// by src/scripts/mermaid.ts.
		syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid', 'math'] },
		shikiConfig: {
			themes: { light: 'github-light', dark: 'github-dark' },
			defaultColor: false,
		},
	},
	vite: {
		// three.js and mermaid are large, but both are loaded on demand: only when a
		// 3D component or a mermaid diagram scrolls into view.
		build: { chunkSizeWarningLimit: 1500 },
	},
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Atkinson',
			cssVariable: '--font-atkinson',
			fallbacks: ['system-ui', 'sans-serif'],
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/atkinson-regular.woff'],
						weight: 400,
						style: 'normal',
						display: 'swap',
					},
					{
						src: ['./src/assets/fonts/atkinson-bold.woff'],
						weight: 700,
						style: 'normal',
						display: 'swap',
					},
				],
			},
		},
	],
});
