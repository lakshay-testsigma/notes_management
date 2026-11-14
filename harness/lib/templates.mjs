// File templates used by `tutor init`, `tutor map`, and `tutor concept`.
// A template is plain text with {{name}} placeholders.

import path from 'node:path';
import { readText } from './io.mjs';
import { TEMPLATES_DIR } from './root.mjs';
import { today } from './clock.mjs';
import { yamlEscape } from './markdown.mjs';
import { openLessonLine, siteUrl } from './topic-store.mjs';

/** Vault note key (see topicPaths) -> template file. */
export const TOPIC_TEMPLATES = {
  start_here: 'start-here.md',
  brief: 'brief.md',
  lesson: 'lesson-index.md',
  mini_projects: 'mini-projects.md',
  digests_index: 'digests-index.md',
  repo_intel_index: 'repo-intel-index.md',
  capstone: 'capstone.md',
  final_notes: 'final-notes.md',
  recall: 'recall.md',
  resources: 'resources.md',
  insights: 'insights.md',
};

/** Templates for notes that do not belong to one topic. */
export const SHARED_TEMPLATES = {
  concept: 'concept.md',
  tech: 'tech.md',
  domain_map: 'domain-map.md',
  home: 'home.md',
};

export const ALL_TEMPLATE_FILES = [
  ...Object.values(TOPIC_TEMPLATES),
  ...Object.values(SHARED_TEMPLATES),
];

export function renderTemplate(fileName, vars) {
  const text = readText(path.join(TEMPLATES_DIR, fileName));
  return text.replace(/\{\{(\w+)\}\}/g, (whole, key) => (key in vars ? String(vars[key]) : whole));
}

/** Placeholder values for a topic note. `title_yaml` is safe inside "double quotes". */
export function topicVars(topic) {
  return {
    title: topic.title,
    title_yaml: yamlEscape(topic.title),
    topic: topic.id,
    slug: topic.slug,
    domain: topic.domain,
    subdomain: topic.subdomain,
    date: today(),
    site_url: siteUrl(topic),
    open_lesson: openLessonLine(topic),
  };
}
