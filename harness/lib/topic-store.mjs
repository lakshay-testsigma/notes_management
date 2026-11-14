// Reading and writing topic state: topic.json, the registry, and topic addressing.

import { tryLoadPack } from './packs.mjs';
import { resolveProfile, skipReason } from './stages.mjs';
import path from 'node:path';
import { isFile, listDirs, readJson, writeJsonAtomic } from './io.mjs';
import { isoNow } from './clock.mjs';
import { UsageError, ValidationError } from './errors.mjs';
import { markFreshness } from './freshness.mjs';

const MAX_LOG_ENTRIES = 200;

export function topicId(domain, subdomain, slug) {
  return `${domain}/${subdomain}/${slug}`;
}

/**
 * Every path of a topic, relative to the repository root.
 * Skills read these through `tutor paths` instead of building them by hand.
 */
export function topicPaths(topic) {
  const { domain, subdomain, slug } = topic;
  const sub = `${domain}/${subdomain}/${slug}`;
  const state = `state/topics/${sub}`;
  const vault = `vault/${sub}`;
  const projects = `projects/${sub}`;

  return {
    state_dir: state,
    topic_json: `${state}/topic.json`,
    sources_json: `${state}/sources.json`,
    handoffs_dir: `${state}/handoffs`,

    vault_dir: vault,
    curriculum_dir: `${vault}/concepts`,
    start_here: `${vault}/00-start-here-${slug}.md`,
    brief: `${vault}/01-brief-${slug}.md`,
    lesson: `${vault}/02-lesson-${slug}.md`,
    mini_projects: `${vault}/03-mini-projects-${slug}.md`,
    digests_dir: `${vault}/04-digests`,
    digests_index: `${vault}/04-digests/00-digests-${slug}.md`,
    repo_intel_dir: `${vault}/05-repo-intel`,
    repo_intel_index: `${vault}/05-repo-intel/00-repo-intel-${slug}.md`,
    capstone: `${vault}/06-capstone-${slug}.md`,
    final_notes: `${vault}/07-final-notes-${slug}.md`,
    recall: `${vault}/08-recall-${slug}.md`,
    resources: `${vault}/09-resources-${slug}.md`,
    insights: `${vault}/my-insights-${slug}.md`,

    lessons_dir: `site/src/content/lessons/${sub}`,
    topic_components_dir: `site/src/components/topics/${slug}`,
    projects_dir: projects,
    capstone_dir: `${projects}/capstone`,
    cache_dir: '.cache',
    repos_cache_dir: '.cache/repos',

    concepts_dir: 'vault/_concepts',
    tech_dir: 'vault/_tech',
    domain_map: `vault/${domain}/${domain}.md`,
    home: 'vault/Home.md',

    pack_json: `harness/domains/${domain}/pack.json`,
    playbook: `harness/domains/${domain}/playbook.md`,
    site_components: 'site/COMPONENTS.md',
    components_manifest: 'site/components.manifest.json',
  };
}

/** The lesson site path of a topic, e.g. /backend-engineering/messaging/redis-streams/ */
export function siteUrl(topic) {
  return `/${topic.domain}/${topic.subdomain}/${topic.slug}/`;
}

export const SITE_DEV_COMMAND = 'npm run site:dev';

/**
 * The one sentence that says how to open the lesson. `tutor next`, `tutor
 * paths`, 00-start-here, and the 02-lesson scaffold all print exactly this.
 */
export function openLessonLine(topic) {
  return `Run \`${SITE_DEV_COMMAND}\` in the repository root, then open \`${siteUrl(topic)}\` on the local address it prints.`;
}

/** The site path of one lesson page, e.g. /…/redis-streams/lesson/01-what-is-a-stream/ */
export function lessonPageUrl(topic, pageName) {
  return `${siteUrl(topic)}lesson/${pageName.replace(/\.mdx$/, '')}/`;
}

export function topicJsonPath(root, id) {
  return path.join(root, 'state', 'topics', ...id.split('/'), 'topic.json');
}

export function loadTopic(root, id) {
  const file = topicJsonPath(root, id);
  try {
    const topic=readJson(file),pack=tryLoadPack(root,topic.domain);
    topic.profile=resolveProfile(topic.depth,pack);
    for(const stage of topic.stages) {
      const omitted=skipReason(stage.id,topic.depth,pack,topic.profile);
      stage.scope=omitted?(pack?.stages?.[stage.id]?.enabled===false?'domain':'depth'):'required';
    }
    return markFreshness(root,topic);
  } catch (error) {
    throw new ValidationError(`Cannot read state/topics/${id}/topic.json: ${error.message}`);
  }
}

/** Save topic.json atomically, stamping `updated_at` and trimming the log. */
export function saveTopic(root, topic) {
  topic.updated_at = isoNow();
  if (Array.isArray(topic.log) && topic.log.length > MAX_LOG_ENTRIES) {
    topic.log = topic.log.slice(-MAX_LOG_ENTRIES);
  }
  const stored=structuredClone(topic);
  for(const stage of stored.stages)delete stage.fresh;
  writeJsonAtomic(topicJsonPath(root, topic.id), stored);
}

/** Append one entry to the topic log (saved by the next saveTopic call). */
export function appendLog(topic, event, message, stage = null) {
  if (!Array.isArray(topic.log)) topic.log = [];
  const entry = { at: isoNow(), event, message };
  if (stage) entry.stage = stage;
  topic.log.push(entry);
}

/** Ids of every topic that has a topic.json on disk, sorted. */
export function scanTopicIds(root) {
  const base = path.join(root, 'state', 'topics');
  const ids = [];
  for (const domain of listDirs(base)) {
    for (const subdomain of listDirs(path.join(base, domain))) {
      for (const slug of listDirs(path.join(base, domain, subdomain))) {
        if (isFile(path.join(base, domain, subdomain, slug, 'topic.json'))) {
          ids.push(topicId(domain, subdomain, slug));
        }
      }
    }
  }
  return ids.sort();
}

export function loadAllTopics(root) {
  return scanTopicIds(root).map((id) => loadTopic(root, id));
}

/**
 * Turn what the user typed into a topic id.
 * Accepts the full id (`domain/subdomain/slug`) or a bare slug when it is unique.
 */
export function resolveTopicId(root, reference) {
  if (!reference) {
    throw new UsageError('Missing <topic>.', 'Give the full id (domain/subdomain/slug) or the slug.');
  }
  const ref = String(reference).trim().replace(/^\/+|\/+$/g, '');
  const ids = scanTopicIds(root);
  const known = ids.length ? ids.map((id) => `  ${id}`).join('\n') : '  (no topics yet)';

  if (ref.includes('/')) {
    if (ids.includes(ref)) return ref;
    throw new UsageError(`No topic with id "${ref}".`, `Known topics:\n${known}`);
  }

  const matches = ids.filter((id) => id.split('/')[2] === ref);
  if (matches.length === 1) return matches[0];
  if (matches.length === 0) {
    throw new UsageError(`No topic with slug "${ref}".`, `Known topics:\n${known}`);
  }
  throw new UsageError(
    `Slug "${ref}" is ambiguous: ${matches.length} topics use it.`,
    `Use the full id, one of:\n${matches.map((id) => `  ${id}`).join('\n')}`,
  );
}

export function resolveTopic(root, reference) {
  return loadTopic(root, resolveTopicId(root, reference));
}

// --- registry ---------------------------------------------------------------

export function registryPath(root) {
  return path.join(root, 'state', 'registry.json');
}

export function readRegistry(root) {
  const file = registryPath(root);
  if (!isFile(file)) return { schema: 1, topics: [] };
  const registry = readJson(file);
  if (!Array.isArray(registry.topics)) registry.topics = [];
  return registry;
}

export function registryEntry(topic) {
  return {
    id: topic.id,
    title: topic.title,
    slug: topic.slug,
    domain: topic.domain,
    subdomain: topic.subdomain,
    depth: topic.depth,
    created_at: topic.created_at,
    state: topic.paths.state,
  };
}

/** Add or refresh one topic in state/registry.json. */
export function upsertRegistry(root, topic) {
  const registry = readRegistry(root);
  const entry = registryEntry(topic);
  const index = registry.topics.findIndex((t) => t.id === topic.id);
  if (index === -1) registry.topics.push(entry);
  else registry.topics[index] = entry;
  registry.topics.sort((a, b) => a.id.localeCompare(b.id));
  writeJsonAtomic(registryPath(root), { schema: 1, topics: registry.topics });
}

/** Rewrite the registry from the topic.json files on disk. */
export function rebuildRegistry(root) {
  const topics = loadAllTopics(root).map(registryEntry);
  writeJsonAtomic(registryPath(root), { schema: 1, topics });
  return topics.length;
}

// --- stage access -----------------------------------------------------------

export function findStage(topic, stageId) {
  if (!stageId) throw new UsageError('Missing <stage>.', stageHint(topic));
  const stage = topic.stages.find((s) => s.id === stageId);
  if (!stage) throw new UsageError(`Unknown stage "${stageId}".`, stageHint(topic));
  return stage;
}

function stageHint(topic) {
  return `Stages of this topic: ${topic.stages.map((s) => s.id).join(', ')}`;
}
