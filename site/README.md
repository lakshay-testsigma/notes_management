# The reading site

An [Astro](https://astro.build/) site, started from the official blog template,
that turns every topic of the tutor harness into one linear, numbered path:
brief, interactive lesson pages, digests, deep dive, final notes, recall cards
and resources, with previous / next links from the first page to the last.

## Run it

Requires Node 22.23.4 or newer (see `engines` in package.json).

```sh
cd site
npm install
npm run dev              # http://localhost:4321, reloads when lessons, vault notes or state change
npm run build            # static site in dist/
npm run preview          # serve dist/
npm run check            # type-check
npm run smoke            # open every page of dist/ in a headless browser (run after build)
npm run manifest:check   # components.manifest.json, the components and COMPONENTS.md agree
```

## Checks

| Command | Proves | Fails when |
| --- | --- | --- |
| `npm run build` | every page compiles | MDX or a component has a build error |
| `npm run smoke` | every page works in a browser | see below |
| `npm run manifest:check` | the prop lists have not drifted | a component's `Props` type, its list under `"props"` in `components.manifest.json`, or its prop table in `COMPONENTS.md` name different props |
| `npm run check` | the site's own TypeScript | a type error in `src/` |

**`npm run smoke`** (`scripts/smoke.mjs`) serves `dist/` on a free local port,
opens every generated page (each `index.html` under `dist/`) in headless
Chromium, scrolls every island into view so it hydrates, and exits 1 with a
list of `page` + `message` when a page has a console error, an uncaught error,
a hydration mismatch, an island that never hydrated, a failed request for a
local asset, a link to a local page that does not exist, a mermaid diagram
that could not be drawn, or a 3D canvas that stayed blank although WebGL is
available. On success it prints one line and exits 0. It takes about five
seconds for twenty pages and stops its server and browser itself.

```sh
npm run build && npm run smoke
npm run smoke -- redis-streams      # only pages whose URL contains this text
npm run smoke -- --dist some/dir    # another build folder; --jobs <n> sets the parallel pages (default 4)
```

It uses Playwright (a devDependency). The browser itself is downloaded once
per machine; when it is missing the script says so and exits 2:

```sh
npx playwright install chromium
```

Exit 2 always means "could not run" (no `dist/`, no browser), never "the site
is broken".

**`npm run manifest:check`** (`scripts/check-manifest.mjs`) exists because the
harness validator fails a lesson page that uses a prop that is not listed
under `"props"` in `components.manifest.json`. A prop added to a component but
not to the manifest would make correct pages fail, and the other way round a
wrong page would pass. Run it after changing any shared component.

## Routes

| URL | Page |
| --- | --- |
| `/` | Domains that have topics |
| `/<domain>/` | Subdomains and their topics |
| `/<domain>/<subdomain>/<slug>/` | Topic home: summary and the numbered path |
| `…/brief/` | `01-brief-<slug>.md` |
| `…/lesson/<NN-page>/` | One lesson page (MDX) |
| `…/mini-projects/`, `…/capstone/`, `…/final-notes/`, `…/my-insights/` | The matching vault note |
| `…/digests/`, `…/digests/<note>/` | Digest index and each digest |
| `…/repo-intel/`, `…/repo-intel/<org>-<repo>/<note>/` | Deep-dive index and each repository note |
| `…/recall/` | `08-recall-<slug>.md` as an interactive deck |
| `…/resources/` | The topic's `sources.json` |
| `/playground/` | Every shared lesson component with sample data |

## How the site finds content

Nothing is registered by hand. At build time (and on every request in dev):

1. **Topics** come from `../state/topics/<domain>/<subdomain>/<slug>/topic.json`
   (title, summary, outcomes, stage status) and `sources.json` next to it
   (`src/lib/topics.ts`). Domain and subdomain titles come from
   `../harness/domains/<domain>/pack.json` when it exists, otherwise from the id.
2. **Lesson pages** are the `lessons` content collection:
   `src/content/lessons/<domain>/<subdomain>/<slug>/NN-<page>.mdx`, ordered by
   the `order` field (`src/content.config.ts`).
3. **Vault notes** are the `vault` content collection, filled by a custom loader
   (`src/lib/vault-loader.ts`) that reads `../vault/<domain>/<subdomain>/<slug>/**/*.md`,
   hides the frontmatter, converts Obsidian wikilinks and renders the markdown
   with Astro's own pipeline. A wikilink becomes a link when its target is a
   note the site renders, and plain text otherwise (`src/lib/wikilinks.ts`).
4. **Reading order** is built in `src/lib/navigation.ts`: 01 Brief, 02 Lesson
   pages, 03 Mini projects, 04 Digests, 05 Open-source deep dive, 06 Capstone,
   07 Final notes, 08 Recall, 09 Resources, My insights.

A step appears once its file exists **and** its stage in `topic.json` has left
`pending` (and was not `skipped`), so template files scaffolded by `tutor init`
stay hidden until they are written. A hidden step has no page at all: the
topic home leaves it out, the previous / next links go straight to the next
step that exists (a `quick` topic reads 01 → 02 → 03 → 04 → 07 → 08 → 09), and
a wikilink to one of its notes is printed as plain text. `npm run smoke`
fails on any local link that leads nowhere. `00-start-here` and `02-lesson` have no page
of their own: the topic home is the map, and links to them go there.

The repository root is found by `astro.config.mjs` (the parent of `site/`).
Set `TUTOR_REPO_ROOT` to point the site at another checkout.

With no topics at all the site still builds: the home page says so and
`/playground/` works.

## Layout of `src/`

```
src/
├── content.config.ts        the two content collections
├── content/lessons/         lesson MDX, one folder per topic
├── components/
│   ├── learn/               shared lesson components (Name.astro wrappers)
│   │   ├── index.ts         the map that makes them available in MDX without imports
│   │   └── react/           the interactive islands and their helpers
│   ├── topics/<slug>/       components written for one topic
│   └── site/                page chrome: head, header, footer, breadcrumbs, pager, recall deck
├── data/playground.ts       sample data for /playground/
├── layouts/                 Base.astro, TopicPage.astro
├── lib/                     topics, vault, vault-loader, navigation, wikilinks, expr, paths
├── pages/                   routes
├── scripts/                 mermaid.ts (draws diagrams), continue.ts ("continue reading")
└── styles/                  global.css (tokens, typography, chrome), learn.css (components)
scripts/                     smoke.mjs, check-manifest.mjs (the two checks above; plain Node)
```

## Writing lessons

`COMPONENTS.md` is the reference: every shared component, every prop, and a
copy-pasteable example. `components.manifest.json` is the same list for
machines: the names by kind (`visual`, `activity`, `utility`) and, under
`props`, the prop names of each component (`"props": { "Quiz": ["question",
"options", "answer", "explanation"], … }`).
Shared components need no import and no client directive; they are passed to
the lesson through the `components` prop when the page is rendered
(`src/components/learn/index.ts`).

## Adding a topic-specific component

1. Create `src/components/topics/<slug>/<Name>.tsx` with a default-exported
   React component (see `src/components/topics/component-tour/IntervalLadder.tsx`).
2. In the lesson MDX, import it after the frontmatter using the `@topics`
   alias (defined in `tsconfig.json`) and give it a client directive:

   ```mdx
   import IntervalLadder from '@topics/component-tour/IntervalLadder.tsx';

   <IntervalLadder client:visible />
   ```

3. Style it with the CSS tokens from `src/styles/global.css` (`var(--accent)`,
   `var(--text)`, `var(--line)`, `var(--s1)` …) and the shared `lc-*` classes so
   it follows the light and dark themes.

## Adding a shared component

Create the island in `src/components/learn/react/`, a wrapper `Name.astro` in
`src/components/learn/` that renders it with `client:visible` and declares
its props as `type Props = NameProps` (or `interface Props`), add it to
`src/components/learn/index.ts`, to `components.manifest.json` (its kind
**and** its list under `props`), to `COMPONENTS.md` (a `## Name` section with
a table whose first column is `Prop`) and to `src/pages/playground.astro`.
Then run `npm run manifest:check`. The name must also be added to the table
in `docs/ARCHITECTURE.md` §12, which is the contract the validator follows.

The same applies to a new prop on an existing component: the `Props` type,
the manifest and the table in `COMPONENTS.md` change together.

## Design rules

Minimal blog: a title, a one-line description, short prose, then visuals. No
quote blocks, no cards, no callout boxes, no shadows. Controls are text
buttons. Blockquotes that appear in vault notes are shown as plain indented
text. All colours are tokens in `src/styles/global.css`, with a light and a
dark set; the header button switches between them. Motion respects
`prefers-reduced-motion`. 3D components load three.js only when they scroll
into view, keep a fixed aspect ratio, and fall back to a flat diagram when
WebGL is unavailable. Their labels never print on top of each other: a few
times a second the label rectangles are compared on screen
(`src/components/learn/react/declutter.ts`, used by `three-stage.ts`), the
most important label of an overlapping set keeps its place, and the others
move to the far side of their dot or fade out until the learner points at
the dot, selects it, or steps to it with N / P.

## Test content

There is no built-in fixture topic. `/playground/` shows every shared
component with sample data (`src/data/playground.ts`) and builds with no
topics at all; `src/components/topics/component-tour/IntervalLadder.tsx` is
the worked example of a topic-specific component. Any generated topic under
`../state/topics` is real test content for `npm run build && npm run smoke`.
