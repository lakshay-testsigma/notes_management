import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { vaultLoader } from './lib/vault-loader';

/**
 * Lesson pages: src/content/lessons/<domain>/<subdomain>/<slug>/NN-<page>.mdx
 * (ARCHITECTURE §12). Entry id = that path without the extension.
 */
const lessons = defineCollection({
	loader: glob({
		base: './src/content/lessons',
		pattern: '**/*.mdx',
		generateId: ({ entry }) => entry.replace(/\.mdx$/, ''),
	}),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		order: z.number(),
		concepts: z.array(z.string()).default([]),
	}),
});

/** Vault notes of every topic, read from ../vault by a custom loader. */
const vault = defineCollection({
	loader: vaultLoader(),
	schema: z.object({
		topic: z.string(),
		rel: z.string(),
		step: z.string(),
		route: z.string(),
		role: z.enum(['page', 'index', 'child']),
		order: z.number(),
		group: z.string().optional(),
		title: z.string(),
		stage: z.string().optional(),
		cards: z.array(z.object({ id: z.string(), question: z.string(), answer: z.string() })).default([]),
	}),
});

export const collections = { lessons, vault };
