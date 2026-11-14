# Frontend Engineering playbook

Guidance for the stage skills. Each `##` heading is read by one skill; keep the eight headings and their order.

## How this domain is learned

**Prerequisite chain.** Learn in this order; a topic may assume everything above it.

1. HTML (semantic elements, forms) and CSS (box model, flexbox, grid)
2. JavaScript language (values, functions, closures, modules, promises)
3. The browser (DOM, events, the event loop, the rendering pipeline, the network tab)
4. TypeScript (types, interfaces, generics, narrowing)
5. One component framework (React by default): components, props, state, effects
6. Data fetching and state (server state versus client state)
7. Routing and rendering strategy (CSR, SSR, SSG, streaming)
8. Quality layers: accessibility, performance, testing, build tooling

**Beginner misconceptions to correct early.**

- "React is the web." The framework is a layer over the DOM; most bugs are plain JavaScript, CSS, or browser behaviour.
- "State is one thing." Server state (cached copies of remote data) and client state (UI state) need different tools.
- "`useEffect` is for running code after render." It is for synchronising with something outside React; most beginner effects should be derived values or event handlers.
- "Async code runs in parallel." JavaScript has one main thread; `await` yields to the event loop.
- "Re-render means the DOM is rewritten." Re-rendering computes a new tree; only differences are committed.
- "Accessibility and performance are polish." They are requirements that decide HTML structure and loading strategy from the start.
- "CSS is random." Layout follows rules: the cascade, specificity, the box model, and formatting contexts.
- "More libraries means more professional." The platform (fetch, forms, CSS, dialog) already covers a lot.

**Choosing depth.**

- `quick`: one API or one CSS feature (`useMemo`, CSS grid areas, `Intl`, debounce).
- `standard`: one library or one technique (TanStack Query, React Router, form validation, Core Web Vitals).
- `deep`: a pillar the learner will use daily (React, TypeScript, the browser rendering pipeline, Next.js, accessibility).

**Cutting a topic into lesson pages.** Use this order and drop pages that do not apply.

1. The user-visible problem (what breaks or feels bad without it)
2. The mental model (one picture of how it works)
3. The smallest working example
4. The lifecycle or data flow, step by step
5. The common mistake and how to see it in DevTools
6. Performance and accessibility consequences
7. How a production app uses it (from repo-intel)

## Trusted sources

**Official documentation and standards (tier A candidates).**

- MDN Web Docs (developer.mozilla.org): the reference for HTML, CSS, JavaScript, and Web APIs
- web.dev and Chrome for Developers (developer.chrome.com): performance, Core Web Vitals, DevTools, rendering
- React docs (react.dev), including the "You Might Not Need an Effect" page
- TypeScript Handbook (typescriptlang.org)
- WHATWG HTML Living Standard (html.spec.whatwg.org), ECMAScript specification (tc39.es/ecma262)
- W3C WCAG 2.2 and the WAI-ARIA Authoring Practices Guide (w3.org/WAI)
- Framework and tool docs: Next.js (nextjs.org/docs), Vue (vuejs.org), Svelte (svelte.dev), Angular (angular.dev), Vite (vite.dev), Tailwind CSS (tailwindcss.com), TanStack Query (tanstack.com), Redux (redux.js.org), Testing Library (testing-library.com), Playwright (playwright.dev), Vitest (vitest.dev), Storybook (storybook.js.org)
- The Modern JavaScript Tutorial (javascript.info) as a tier B language tutorial

**Standard books.**

- *Eloquent JavaScript*, Marijn Haverbeke (No Starch Press; free at eloquentjavascript.net)
- *JavaScript: The Definitive Guide*, David Flanagan (O'Reilly)
- *You Don't Know JS Yet*, Kyle Simpson (series; free on GitHub)
- *CSS: The Definitive Guide*, Eric A. Meyer and Estelle Weyl (O'Reilly)
- *High Performance Browser Networking*, Ilya Grigorik (O'Reilly; free at hpbn.co)
- *Learning Patterns*, Lydia Hallie and Addy Osmani (free at patterns.dev)
- *Refactoring UI*, Adam Wathan and Steve Schoger (self-published; the standard practical design book for developers)
- *Don't Make Me Think*, Steve Krug (New Riders) for usability
- *Inclusive Components*, Heydon Pickering, for accessible component patterns

**Defining articles and talks** (this field is defined by specifications and talks more than papers).

- "Inside look at modern web browser", Mariko Kosaka, four parts on developer.chrome.com (2018)
- "What the heck is the event loop anyway?", Philip Roberts, JSConf EU 2014
- "In The Loop", Jake Archibald, JSConf.Asia 2018
- "Rendering on the Web", Jason Miller and Addy Osmani, web.dev
- React Fiber Architecture notes, Andrew Clark (acdlite/react-fiber-architecture on GitHub)
- Core Web Vitals definitions on web.dev (LCP, INP, CLS)

**Engineering blogs.** React blog (react.dev/blog), Vercel blog, Chrome for Developers blog, Figma engineering blog, Shopify Engineering, Airbnb Engineering, Netflix Tech Blog (UI performance posts), Stripe blog, Josh W. Comeau (joshwcomeau.com), Dan Abramov (overreacted.io), Kent C. Dodds (kentcdodds.com), Smashing Magazine, CSS-Tricks.

**Organizations whose repositories count as production grade.** The React project (`react/react`, formerly `facebook/react`), Vercel (`vercel/next.js`), the Vue, Svelte, and Angular core teams (`vuejs/core`, `sveltejs/svelte`, `angular/angular`), the Vite team (`vitejs/vite`), TanStack (`TanStack/query`), Tailwind Labs (`tailwindlabs/tailwindcss`), Radix (`radix-ui/primitives`), Microsoft (`microsoft/vscode`, `microsoft/playwright`), Astro (`withastro/astro`).

**Flagship application repositories for repo-intel** (real apps, not libraries).

- `excalidraw/excalidraw`: React + TypeScript canvas app, small enough to read
- `calcom/cal.diy` (formerly `calcom/cal.com`): Next.js monorepo with forms, auth, and a design system
- `grafana/grafana`: very large React frontend with plugin architecture (slice `public/app`)
- `mattermost/mattermost`: long-lived React + Redux web app (slice `webapp`)
- `shadcn-ui/ui`: how accessible components are composed from Radix primitives
- `mui/material-ui`: a mature component library with theming and testing

**Avoid.** W3Schools, GeeksforGeeks, and tutorial farms; Medium and dev.to posts by unknown authors; class-component React tutorials and anything teaching Create React App (deprecated); jQuery-era answers for modern problems; pre-2021 Next.js material that only covers the Pages Router when the topic is the App Router; "awesome list" repositories and UI clones with no tests as repo-intel targets.

## Lesson recipes

| Kind of concept | Component | Concrete example |
|---|---|---|
| Rendering pipeline, event loop, data flow | `FlowAnimation` | A click travels task queue → call stack → microtasks → render; learner adds a `setTimeout` and a promise and watches the order |
| Request and loading strategies | `FlowAnimation` | CSR versus SSR versus streaming SSR: HTML, JS, and data packets race from server to browser; learner throttles the network |
| Component trees, props, context | `Graph3D` | Component tree of a todo app; state change highlights exactly which nodes re-render; `editable` to move state up or down |
| Module and bundle structure | `Graph3D` | Import graph of an app; remove an edge to see what tree shaking drops; chunks shown as clusters |
| UI and async states | `StateMachine` | Data fetch: idle → loading → success or error → refetching; learner fires events and sees impossible states disappear |
| Client, server, cache conversations | `SequenceDiagram` | Stale-while-revalidate: component, query cache, API; or an OAuth redirect login |
| App architecture | `SystemDiagram` | Browser, CDN, edge function, origin, database for a Next.js app, with what runs where |
| CSS layout and animation values | `ParamPlayground` | Sliders for `flex-grow`, `gap`, `justify-content`; or cubic-bezier control points driving a moving box |
| Hooks, closures, reducers | `CodeWalkthrough` | Step through a stale-closure bug in `useEffect` line by line, then the fix |
| Performance numbers | `Chart` | LCP and bundle size before and after code splitting; INP distribution |
| History and versions | `Timeline` | jQuery → SPA frameworks → hooks → server components |
| Static structure | `Mermaid` | Folder layout of a feature-sliced app, DOM tree of a form |

**Activities.**

- `PredictReveal`: "What does this log print, and in what order?" (event loop), "How many times does this component render?"
- `OrderSteps`: order the critical rendering path, or the hydration steps
- `MatchPairs`: ARIA role to element, hook to purpose, HTTP cache header to effect
- `Quiz`: choose the right state location, choose the rendering strategy for a page

**3D versus 2D.** Use `Graph3D` for component trees with more than about 12 nodes, import graphs, and dependency graphs, where rotating separates the clusters. Use 2D for CSS layout, the box model, sequence of requests, and anything with fewer than 10 boxes; 3D only hides those. `VectorSpace3D` rarely fits this domain (colour spaces and 3D CSS transforms are the exceptions).

**Custom simulation ideas** (under `site/src/components/topics/<slug>/`): a live flexbox or grid sandbox; a virtual DOM diff viewer that shows the patches for an edit; a render counter that flashes components as they re-render; a specificity calculator; a network waterfall that the learner rearranges with `preload` and `defer`; a focus-order walker that tabs through a page.

## Mini project patterns

Progress from guided (starter has most of the code, 3–5 TODOs) to independent (starter has only the scaffold and tests).

1. **One accessible component from scratch** (guided, 1 h): modal, tabs, or combobox with keyboard support and ARIA. Proves: semantic HTML, focus management. Real use: every design system.
2. **Fetch, cache, and show states** (guided, 1–2 h): searchable list against a public API with loading, error, empty, and retry. Proves: async state, race conditions, debouncing. Real use: product search.
3. **Form with validation** (semi-guided, 2 h): multi-step signup with schema validation, inline errors, and disabled submit. Proves: controlled inputs, validation, accessibility of errors. Real use: checkout and onboarding.
4. **Optimistic update with rollback** (semi-guided, 2 h): like or reorder that updates instantly and reverts on failure. Proves: cache mutation, error recovery. Real use: social and kanban apps.
5. **Performance rescue** (independent, 2–3 h): a deliberately slow page (10,000 rows, large images, one big bundle) to bring under a budget. Proves: profiling, virtualization, code splitting. Real use: dashboards.
6. **Rebuild a small library feature** (independent, 2–3 h): tiny `useQuery`, tiny router, or tiny state store in under 150 lines. Proves: understanding of the abstraction. Real use: debugging the real library.
7. **Test a feature the way a user uses it** (independent, 2 h): Testing Library unit tests plus one Playwright flow, with the network mocked. Proves: testing behaviour, not implementation. Real use: preventing regressions.

Every project README states the user-visible acceptance check ("pressing Escape closes the dialog and returns focus to the button").

## Repository analysis focus

| What to find | Where it usually lives |
|---|---|
| Framework, build tool, package manager | `package.json`, `vite.config.*`, `next.config.*`, `pnpm-workspace.yaml`, `turbo.json` |
| Folder convention (feature-based or layer-based) | `src/`, `app/`, `apps/*`, `packages/*` |
| Routing and rendering strategy | `app/` or `pages/`, router setup file, `middleware.ts`, server components versus `"use client"` |
| State and data layer | store setup, query client setup, `api/` or `services/` folder, generated API clients |
| Design system and styling | `components/ui`, `packages/ui`, `tailwind.config.*`, theme and token files, Storybook `.stories.*` |
| Type safety practice | `tsconfig.json` (`strict`), shared types package, schema validation (zod) at boundaries |
| Testing strategy | `*.test.tsx`, `e2e/` or `playwright/`, `vitest.config.*`, `jest.config.*`, mock handlers |
| Performance techniques | dynamic imports, image components, memoization, virtualization, bundle analyzer config |
| Accessibility practice | lint rules (`eslint-plugin-jsx-a11y`), focus utilities, axe tests |
| Error handling | error boundaries, `error.tsx`, toast or notification layer, API error mapping |
| Internationalization | `locales/`, i18n setup |
| Feature flags and configuration | `.env.example`, env validation file, flag provider |
| CI and release | `.github/workflows/*`, lint-staged, changesets |
| Observability | error tracking setup (Sentry), analytics wrapper, web-vitals reporting |

**External services to record as `_tech` notes.** Hosting and CDN, authentication provider, payments, analytics, error tracking, feature-flag service, CMS, search, email, maps. For each: why this app needs it and where it is initialised.

**Findings worth ranking high.** How they keep server state out of global stores, how the design system enforces consistency, how they prevent accidental client bundles, how they test without brittle snapshots.

## Capstone shape

**Production ready means.**

- Strict TypeScript, ESLint, and Prettier pass in CI
- Tests: unit for logic, component tests for behaviour, one end-to-end happy path
- Every async view has loading, empty, error, and success states
- Keyboard usable, labelled controls, visible focus, colour contrast meets WCAG AA
- Performance budget written in the README (for example LCP under 2.5 s on a throttled profile) and measured
- Configuration through validated environment variables; `.env.example` committed
- Error boundary plus a logging wrapper (console in development, pluggable in production)
- Responsive from 360 px wide; deployable as a static build or to one named host; README with run, test, build, deploy

**Recommended structure.**

```
src/
  app/            routes, providers, error boundary
  features/<name>/
    components/   function components for this feature
    hooks/        feature hooks (state and effects)
    api.ts        calls ApiClient, returns typed data
    model.ts      types and pure domain functions
  shared/
    ui/           reusable presentational components
    lib/          ApiClient, Logger, Storage (classes behind interfaces)
    config.ts     validated environment
tests/            e2e and shared test utilities
```

**Where OOP and SOLID fit.** React components are functions; do not force classes onto UI. Apply the principles like this: single responsibility per component and per hook; dependency inversion by passing services through context or props; open/closed through composition and `children`. Use classes where there is real state and a contract: `ApiClient`, `AuthService`, `StorageAdapter`, a domain model with invariants. Keep domain logic in pure functions in `model.ts` so it tests without rendering.

**Example capstones.**

- Personal finance tracker: CSV import, categorisation, charts, works offline
- Kanban board with drag and drop, optimistic updates, and keyboard reordering
- Documentation search site with instant client-side search and deep links
- Booking page for a small business: availability calendar, form validation, confirmation
- Real-time dashboard that subscribes to a WebSocket and stays smooth with thousands of rows

## Recall focus

Worth remembering a year later:

- Decision rules: server state or client state; CSR, SSR, or SSG for a page; when an effect is wrong; when to memoize
- Trade-offs: bundle size versus interactivity, global store versus local state, CSS-in-JS versus utility classes
- Failure modes: stale closure, race between two fetches, hydration mismatch, layout shift, lost focus after a dialog closes
- The order of the rendering pipeline and of the event loop
- The Core Web Vitals and what moves each one

Question styles: Explain ("why does this component re-render?"), Compare ("`useMemo` versus `useCallback`"), Debug ("the list flickers after typing fast; what is wrong and how do you confirm it in DevTools?"), Decide ("a marketing page with a pricing table: which rendering strategy and why?"). Prefer cards that show six lines of code and ask for the output.

## Safety and ethics

- Anything in a client bundle is public. Keep secrets on a server; never in `VITE_` or `NEXT_PUBLIC_` variables.
- Never render untrusted HTML without sanitising; avoid `dangerouslySetInnerHTML` in examples unless the lesson is about XSS.
- Accessibility is an obligation, not an extra; do not ship a capstone that cannot be used with a keyboard.
- Use licensed assets and fonts only, and record the license. No dark patterns (hidden unsubscribe, fake urgency) in example UIs.
