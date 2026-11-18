---
title: "N1 Frontend Engineering Mastery Roadmap"
type: roadmap
roadmap: frontend
domain: frontend-engineering
updated: 2026-11-17
---

# N1 Frontend Engineering Mastery Roadmap

One sequential path through the field. Each section is one topic; work top to bottom.

<!-- tutor:generated:start -->
Progress: **0 of 107** topics have finished notes (0 of 707 roadmap items).
Interactive checklist: run `npm run site:dev` and open `/roadmaps/frontend.html`.

## 00 Learning System & Workstation

Set up how you learn and the tools you will use for every later phase. Mastery = reading primary sources + building + measuring.

- [ ] **00.1** How to learn frontend (and keep improving) — Not generated yet · 8 items · `frontend-engineering/learning-system-and-workstation/how-to-learn-frontend`
    - Learning loop: read → build → measure → explain (core)
    - Primary sources over tutorials (core)
    - Browser support literacy: Baseline & caniuse (core)
    - Feature detection, polyfills & experimental features (core)
    - Stay current: newsletters, podcasts, surveys (core)
    - Practice platforms & interview prep (core)
    - Read other people's code (adv)
    - Build in public & teach (adv)
- [ ] **00.2** Workstation & editor — Not generated yet · 5 items · `frontend-engineering/learning-system-and-workstation/workstation-and-editor`
    - Terminal & shell basics (core)
    - Git & GitHub fluency (core)
    - VS Code (or JetBrains / Zed) setup (core)
    - AI-assisted development (core)
    - Node.js runtime & version management (core)
- [ ] **00.3** Browser DevTools mastery (used in every phase) — Not generated yet · 10 items · `frontend-engineering/learning-system-and-workstation/browser-devtools-mastery`
    - Elements & Styles panel (core)
    - Console power use (core)
    - Sources panel & debugging (core)
    - Network panel (core)
    - Performance panel (core)
    - Memory panel (adv)
    - Application panel (core)
    - Lighthouse panel & other panels (core)
    - Firefox & Safari DevTools (adv)
    - Remote device debugging (adv)
- [ ] **00.4** Browser extension toolkit (install once, used across phases) — Not generated yet · 7 items · `frontend-engineering/learning-system-and-workstation/browser-extension-toolkit`
    - Framework devtools extensions (core)
    - Performance extensions (core)
    - Accessibility extensions (core)
    - SEO extensions (core)
    - Security & privacy extensions (core)
    - Design & CSS helper extensions (opt)
    - API & data extensions (opt)

## 01 How the Web Works

Networking and browser internals. Every performance, security and SEO decision later depends on this phase.

- [ ] **01.1** Internet & networking — Not generated yet · 13 items · `frontend-engineering/how-the-web-works/internet-and-networking`
    - How the internet works (core)
    - Domain names & hosting basics (core)
    - DNS (core)
    - HTTP fundamentals (core)
    - HTTP/1.1 vs HTTP/2 vs HTTP/3 (QUIC) (core)
    - TLS / HTTPS (core)
    - URLs & origins (core)
    - HTTP caching (core)
    - CDNs & the edge (core)
    - Compression (core)
    - Cookies (core)
    - Realtime transports overview (core)
    - REST, GraphQL & RPC at a glance (core)
- [ ] **01.2** How browsers work — Not generated yet · 8 items · `frontend-engineering/how-the-web-works/how-browsers-work`
    - Browser architecture (core)
    - Navigation & page lifecycle (core)
    - Critical rendering path (core)
    - Rendering pipeline & compositing (adv)
    - JavaScript engine internals (adv)
    - Event loop (core)
    - Browser storage & quotas overview (core)
    - Same-origin policy (core)

## 02 HTML (Semantic, Accessible, Modern)

HTML is the accessibility, SEO and performance foundation. Write it by hand until semantics are instinct.

- [ ] **02.1** HTML fundamentals — Not generated yet · 9 items · `frontend-engineering/html/html-fundamentals`
    - Document structure (core)
    - Semantic elements (core)
    - Text content & headings (core)
    - Links & navigation (core)
    - Images & responsive media (core)
    - Audio, video & embeds (core)
    - Tables (core)
    - SVG in HTML (core)
    - Global attributes (core)
- [ ] **02.2** Forms (the most important interactive HTML) — Not generated yet · 5 items · `frontend-engineering/html/forms`
    - Form elements (core)
    - Native validation (core)
    - Autofill & UX attributes (core)
    - Form submission (core)
    - Customizable `<select>` (adv)
- [ ] **02.3** Modern interactive HTML (less JS) — Not generated yet · 5 items · `frontend-engineering/html/modern-interactive-html`
    - `<dialog>` (core)
    - Popover API (core)
    - Invoker commands (adv)
    - `<details>` / `<summary>` & exclusive accordions (core)
    - `<template>`, `<slot>` & declarative shadow DOM (adv)
- [ ] **02.4** Head, metadata & document-level concerns — Not generated yet · 6 items · `frontend-engineering/html/head-metadata-and-document-level-concerns`
    - Meta tags (core)
    - Social & sharing metadata (core)
    - Resource hints (core)
    - Script loading (core)
    - HTML validation & linting (core)
    - HTML email development (opt)

## 03 CSS (Layout, Modern Features, Architecture)

Modern CSS replaces a lot of JavaScript. Learn the cascade deeply before frameworks.

- [ ] **03.1** [[frontend-engineering/css/css-core-mechanics/00-start-here-css-core-mechanics|CSS core mechanics]] — Being generated · 13 items · `frontend-engineering/css/css-core-mechanics`
    - Selectors (core)
    - Cascade, specificity & inheritance (core)
    - Cascade layers (`@layer`) (core)
    - `@scope` (adv)
    - Box model (core)
    - Ways to add CSS & feature queries (core)
    - Units & values (core)
    - Colors (core)
    - Custom properties (CSS variables) (core)
    - Native CSS nesting (core)
    - Positioning & stacking (core)
    - Transforms (2D & 3D) (core)
    - Overflow & scrolling (core)
- [ ] **03.2** Layout — Not generated yet · 11 items · `frontend-engineering/css/layout`
    - Normal flow & floats (legacy) (core)
    - Flexbox (core)
    - CSS Grid (core)
    - Subgrid (adv)
    - Multi-column layout (opt)
    - Masonry / grid-lanes (opt)
    - Responsive design (core)
    - Container queries (core)
    - Media features & user preferences (core)
    - Logical properties & writing modes (core)
    - Anchor positioning (adv)
- [ ] **03.3** Typography & visuals — Not generated yet · 6 items · `frontend-engineering/css/typography-and-visuals`
    - Web typography (core)
    - Text styling details (core)
    - Generated content & counters (opt)
    - Backgrounds, borders, shadows, filters (core)
    - Images in CSS (core)
    - Form styling (core)
- [ ] **03.4** CSS motion — Not generated yet · 4 items · `frontend-engineering/css/css-motion`
    - Transitions (core)
    - Keyframe animations (core)
    - Scroll-driven animations (adv)
    - View Transitions API (adv)
- [ ] **03.5** CSS architecture & tooling — Not generated yet · 11 items · `frontend-engineering/css/css-architecture-and-tooling`
    - Methodologies (core)
    - Resets & normalize (core)
    - Sass / SCSS (core)
    - PostCSS & Lightning CSS (core)
    - CSS Modules (core)
    - Tailwind CSS v4 (core)
    - CSS-in-JS landscape (opt)
    - Other utility / component CSS frameworks (opt)
    - CSS linting & quality (core)
    - CSS debugging techniques (core)
    - Emerging CSS to watch (opt)

## 04 JavaScript (Language Mastery)

The language itself, independent of browsers and frameworks. Senior engineers know these edges cold.

- [ ] **04.1** Language fundamentals — Not generated yet · 10 items · `frontend-engineering/javascript/language-fundamentals`
    - Values, types & typeof (core)
    - Variables & scope (core)
    - Type coercion & equality (core)
    - Numbers & math (core)
    - Strings (core)
    - Operators (core)
    - Control flow & errors (core)
    - Strict mode, IIFEs & legacy patterns (core)
    - JSON (core)
    - Timers (core)
- [ ] **04.2** Functions, objects & the hard parts — Not generated yet · 13 items · `frontend-engineering/javascript/functions-objects-and-the-hard-parts`
    - Functions (core)
    - Closures (core)
    - `this` binding (core)
    - Objects (core)
    - Prototypes & inheritance (core)
    - Classes (core)
    - Arrays (core)
    - Collections (core)
    - Iterators & generators (adv)
    - Symbols & metaprogramming (adv)
    - Immutability patterns (core)
    - Regular expressions (core)
    - Dates & time (core)
- [ ] **04.3** Asynchronous JavaScript — Not generated yet · 7 items · `frontend-engineering/javascript/asynchronous-javascript`
    - Callbacks & callback hell (core)
    - Promises (core)
    - async / await (core)
    - Event loop deep dive (core)
    - Cancellation (core)
    - Explicit resource management (adv)
    - Reactive streams (RxJS) & Observables (opt)
- [ ] **04.4** Modules & code organisation — Not generated yet · 5 items · `frontend-engineering/javascript/modules-and-code-organisation`
    - ES Modules (core)
    - CommonJS & interop (core)
    - Functional programming concepts (adv)
    - Design patterns in JS (adv)
    - Data structures & algorithms for FE (adv)
- [ ] **04.5** JavaScript quality — Not generated yet · 4 items · `frontend-engineering/javascript/javascript-quality`
    - Code style & clean code (core)
    - Debugging techniques (core)
    - Memory management (adv)
    - Language evolution (adv)

## 05 Browser & Web Platform APIs

Vanilla DOM and platform APIs. Build a small app with zero frameworks before Phase 09.

- [ ] **05.1** DOM & events — Not generated yet · 7 items · `frontend-engineering/browser-and-web-platform/dom-and-events`
    - DOM querying & traversal (core)
    - DOM manipulation (core)
    - Events (core)
    - Pointer, keyboard, focus & input events (core)
    - Observers (core)
    - Rendering-loop APIs (core)
    - Shadow DOM & Web Components (adv)
- [ ] **05.2** Network & data APIs — Not generated yet · 7 items · `frontend-engineering/browser-and-web-platform/network-and-data-apis`
    - Fetch API (core)
    - XMLHttpRequest (legacy awareness) (opt)
    - Streams API (adv)
    - WebSockets & Server-Sent Events (core)
    - WebRTC & WebTransport (opt)
    - URL & URLSearchParams, URLPattern (core)
    - Beacon & reporting (core)
- [ ] **05.3** Storage, files & offline — Not generated yet · 7 items · `frontend-engineering/browser-and-web-platform/storage-files-and-offline`
    - Web Storage (core)
    - IndexedDB (core)
    - Cache API & Service Workers (core)
    - Origin Private File System (OPFS) (adv)
    - File, Blob, FileReader, File System Access (core)
    - Clipboard, Share, Notifications, Permissions (core)
    - Cross-context messaging (core)
- [ ] **05.4** Workers, graphics & advanced platform — Not generated yet · 10 items · `frontend-engineering/browser-and-web-platform/workers-graphics-and-advanced-platform`
    - Web Workers (core)
    - History & Navigation API (core)
    - Canvas 2D (adv)
    - WebGL & WebGPU (opt)
    - Web Animations API (WAAPI) (adv)
    - Web Audio, Media & Capture (opt)
    - Device & sensor APIs (opt)
    - WebAssembly (adv)
    - Internationalisation APIs (`Intl`) (core)
    - Built-in AI APIs (emerging) (opt)
- [ ] **05.5** Vanilla capstone — Not generated yet · 1 items · `frontend-engineering/browser-and-web-platform/vanilla-capstone`
    - Capstone: vanilla JS app (core)

## 06 TypeScript & Runtime Validation

TypeScript is the default for professional frontend. Pair static types with runtime validation (Zod) at every boundary.

- [ ] **06.1** TypeScript foundations — Not generated yet · 10 items · `frontend-engineering/typescript-and-runtime-validation/typescript-foundations`
    - Why TypeScript & how tsc works (core)
    - Basic & object types (core)
    - Interfaces vs type aliases (core)
    - Unions, intersections & narrowing (core)
    - Functions (core)
    - Generics (core)
    - Utility types (core)
    - `satisfies`, `as const`, type assertions (core)
    - Classes & OOP in TypeScript (core)
    - Running & experimenting with TypeScript (core)
- [ ] **06.2** Advanced TypeScript — Not generated yet · 7 items · `frontend-engineering/typescript-and-runtime-validation/advanced-typescript`
    - Type-level programming (adv)
    - Branded / nominal types (adv)
    - Declaration files & typing libraries (adv)
    - tsconfig mastery (core)
    - TypeScript with React (core)
    - TypeScript performance & native compiler (adv)
    - Type-safe end-to-end (adv)
- [ ] **06.3** Runtime validation & schemas — Not generated yet · 5 items · `frontend-engineering/typescript-and-runtime-validation/runtime-validation-and-schemas`
    - Why runtime validation (core)
    - Zod (core)
    - Alternatives: Valibot, ArkType, Effect Schema, Yup (opt)
    - Standard Schema (adv)
    - Env var validation (core)

## 07 Tooling, Build Systems & Monorepos

Know what your toolchain does so you can debug it, speed it up and secure it.

- [ ] **07.1** Package management — Not generated yet · 4 items · `frontend-engineering/tooling-build-systems-and/package-management`
    - npm fundamentals (core)
    - Semantic versioning & lockfiles (core)
    - pnpm, Yarn, Bun package managers (core)
    - Publishing packages (adv)
- [ ] **07.2** Bundlers, compilers & dev servers — Not generated yet · 9 items · `frontend-engineering/tooling-build-systems-and/bundlers-compilers-and-dev-servers`
    - Why bundlers exist (core)
    - Vite (v8 + Rolldown) (core)
    - webpack (core)
    - Rspack & Rsbuild (adv)
    - Turbopack (adv)
    - esbuild, Rollup, Parcel (opt)
    - Transpilers: Babel, SWC, Oxc (core)
    - Source maps (core)
    - Browserslist & targets (core)
- [ ] **07.3** Code quality tooling — Not generated yet · 6 items · `frontend-engineering/tooling-build-systems-and/code-quality-tooling`
    - ESLint (flat config) (core)
    - Oxlint & Biome (adv)
    - Prettier / formatters (core)
    - Git hooks & commit hygiene (core)
    - Dead code & dependency hygiene (adv)
    - EditorConfig & shared configs (core)
- [ ] **07.4** Runtimes & scripting — Not generated yet · 3 items · `frontend-engineering/tooling-build-systems-and/runtimes-and-scripting`
    - Node.js for frontend devs (core)
    - Deno & Bun (opt)
    - Environment variables & config (core)
- [ ] **07.5** Monorepos (Turborepo, Nx, workspaces) — Not generated yet · 6 items · `frontend-engineering/tooling-build-systems-and/monorepos`
    - Monorepo concepts (core)
    - pnpm / npm / Bun workspaces (core)
    - Turborepo (core)
    - Nx (adv)
    - Other monorepo tools (opt)
    - Versioning & releasing in monorepos (adv)

## 08 Accessibility (a11y)

Accessibility is a legal requirement (ADA, European Accessibility Act in force since June 2025) and a quality signal. Learn it before frameworks so you never build inaccessible components.

- [ ] **08.1** Principles & standards — Not generated yet · 3 items · `frontend-engineering/accessibility/principles-and-standards`
    - Why accessibility & disability types (core)
    - WCAG 2.2 (POUR) (core)
    - Accessibility law (adv)
- [ ] **08.2** Building accessible UI — Not generated yet · 11 items · `frontend-engineering/accessibility/building-accessible-ui`
    - Semantic HTML first (core)
    - Accessibility tree (core)
    - ARIA (core)
    - Keyboard navigation (core)
    - Focus management (core)
    - Accessible names for images, icons & media (core)
    - Colour & contrast (core)
    - Accessible forms (core)
    - Motion, timing & cognitive a11y (core)
    - Accessible complex widgets (adv)
    - Mobile & touch accessibility (adv)
- [ ] **08.3** Testing accessibility — Not generated yet · 4 items · `frontend-engineering/accessibility/testing-accessibility`
    - Automated testing (core)
    - Manual testing with screen readers (core)
    - Keyboard-only & zoom testing (core)
    - Accessibility audits & reports (adv)

## 09 React (Deep Mastery)

The dominant UI library. Master the mental model, then hooks, then concurrent rendering and Server Components. Install React Developer Tools now.

- [ ] **09.1** React fundamentals — Not generated yet · 7 items · `frontend-engineering/react/react-fundamentals`
    - React mental model (core)
    - JSX (core)
    - Components & props (core)
    - State with useState (core)
    - Events & forms in React (core)
    - Rendering & reconciliation (core)
    - Styling React (core)
- [ ] **09.2** Hooks in depth — Not generated yet · 9 items · `frontend-engineering/react/hooks-in-depth`
    - useEffect & synchronisation (core)
    - useEffectEvent (core)
    - useRef (core)
    - useReducer (core)
    - useContext (core)
    - useMemo, useCallback, memo (core)
    - useLayoutEffect & useInsertionEffect (adv)
    - useId, useSyncExternalStore, useDebugValue (adv)
    - Custom hooks (core)
- [ ] **09.3** React 19+ features & concurrent rendering — Not generated yet · 11 items · `frontend-engineering/react/react-19-plus-features-and-concurrent`
    - Concurrent rendering (adv)
    - Suspense (core)
    - Error boundaries (core)
    - Actions & form hooks (React 19) (core)
    - `use()` API (core)
    - Document metadata & resource APIs (adv)
    - `<Activity>` (adv)
    - View Transitions in React (opt)
    - Portals (core)
    - StrictMode (core)
    - Class components & lifecycle (legacy) (adv)
- [ ] **09.4** React Server Components & server functions — Not generated yet · 3 items · `frontend-engineering/react/react-server-components-and-server-functions`
    - React Server Components (RSC) (core)
    - Server Functions (`'use server'`) (core)
    - Streaming SSR & hydration (adv)
- [ ] **09.5** React performance & tooling — Not generated yet · 5 items · `frontend-engineering/react/react-performance-and-tooling`
    - React Compiler (v1.0) (core)
    - Profiling React (core)
    - Avoiding wasted renders (core)
    - List virtualisation (core)
    - Code splitting in React (core)
- [ ] **09.6** React patterns & architecture — Not generated yet · 5 items · `frontend-engineering/react/react-patterns-and-architecture`
    - Component patterns (core)
    - Project structure (core)
    - Forms in React (core)
    - React ecosystem libraries map (opt)
    - Capstone: React app (core)

## 10 Rendering Strategies & Meta-Frameworks

How HTML gets to the user decides performance, SEO and cost. Learn the strategies, then the frameworks that implement them.

- [ ] **10.1** Rendering strategies — Not generated yet · 11 items · `frontend-engineering/rendering-strategies-and-meta/rendering-strategies`
    - CSR (client-side rendering / SPA) (core)
    - SSR (server-side rendering) (core)
    - SSG (static site generation) (core)
    - ISR / on-demand revalidation (core)
    - Streaming SSR (adv)
    - Partial pre-rendering (PPR) & cache components (adv)
    - Islands architecture (core)
    - Resumability (opt)
    - Progressive enhancement & MPA renaissance (core)
    - Edge rendering (adv)
    - Choosing a strategy (core)
- [ ] **10.2** Next.js (App Router, v16) — Not generated yet · 13 items · `frontend-engineering/rendering-strategies-and-meta/next-js`
    - App Router fundamentals (core)
    - Server & client components in Next (core)
    - Data fetching & caching (Cache Components) (core)
    - Server Actions & forms (core)
    - Route handlers & proxy (core)
    - Request-time APIs (core)
    - Static export, MDX & content (adv)
    - Instrumentation & observability in Next (adv)
    - Built-in optimisations (core)
    - Rendering modes in Next (adv)
    - Turbopack & build (adv)
    - Deploying Next (adv)
    - Next.js security checklist (adv)
- [ ] **10.3** TanStack ecosystem (Router, Start, Query, Table, Form, Virtual, Store, DB) — Not generated yet · 7 items · `frontend-engineering/rendering-strategies-and-meta/tanstack-ecosystem`
    - TanStack Router (core)
    - TanStack Start (v1) (core)
    - TanStack Query (core)
    - TanStack Table (core)
    - TanStack Form (adv)
    - TanStack Virtual, Store, DB, Pacer (opt)
    - TanStack Devtools (core)
- [ ] **10.4** React Router v7 / Remix — Not generated yet · 3 items · `frontend-engineering/rendering-strategies-and-meta/react-router-v7-remix`
    - React Router modes (core)
    - Loaders, actions & nested routes (core)
    - Remix 3 direction (opt)
- [ ] **10.5** Other meta-frameworks — Not generated yet · 7 items · `frontend-engineering/rendering-strategies-and-meta/other-meta-frameworks`
    - Astro (core)
    - Nuxt (Vue) (adv)
    - SvelteKit (adv)
    - SolidStart, Analog, Qwik City, Fresh (opt)
    - Static site generators & docs tools (opt)
    - Waku & minimal RSC frameworks (opt)
    - Capstone: same app, three renderings (adv)

## 11 Framework Landscape (Survey, Then Pick Deep Dives)

You do not need all of these. Build a TODO + fetch demo in each to understand its reactivity model, then pick 1–2 secondary frameworks to go deep.

- [ ] **11.1** Major frameworks — Not generated yet · 10 items · `frontend-engineering/framework-landscape/major-frameworks`
    - Reactivity models compared (core)
    - Vue 3 (adv)
    - Angular (v21) (adv)
    - Svelte 5 & SvelteKit (adv)
    - SolidJS (opt)
    - Preact & Preact Signals (opt)
    - Qwik (opt)
    - Lit & web components frameworks (opt)
    - HTML-over-the-wire & lightweight (opt)
    - Legacy awareness (opt)
- [ ] **11.2** Cross-platform (web skills beyond the browser) — Not generated yet · 5 items · `frontend-engineering/framework-landscape/cross-platform`
    - React Native & Expo (opt)
    - Capacitor & Ionic (opt)
    - Desktop: Electron & Tauri (opt)
    - Browser extensions development (opt)
    - Other UI tech (opt)
- [ ] **11.3** Emerging tech & watch list (re-check every quarter) — Not generated yet · 6 items · `frontend-engineering/framework-landscape/emerging-tech-and-watch-list`
    - Toolchain consolidation (opt)
    - Signals everywhere (opt)
    - New & niche frameworks (opt)
    - Platform features landing (opt)
    - Local-first & sync engines (opt)
    - AI-native UI (opt)

## 12 State Management (All Kinds of State)

Most "state management" pain comes from mixing state types. Classify first, then choose a tool per type. Install Redux DevTools — it inspects Redux, RTK, Zustand, Jotai, NgRx and more.

- [ ] **12.1** State concepts — Not generated yet · 4 items · `frontend-engineering/state-management/state-concepts`
    - Categories of state (core)
    - Core principles (core)
    - Patterns: Flux, observer, signals, atoms, proxies, state machines (core)
    - Built-in React state (core)
- [ ] **12.2** Client state libraries — Not generated yet · 7 items · `frontend-engineering/state-management/client-state-libraries`
    - Zustand (core)
    - Redux Toolkit (RTK) (core)
    - Jotai (adv)
    - MobX & Valtio (opt)
    - XState & state machines (adv)
    - Signals for state (opt)
    - Other stores (opt)
- [ ] **12.3** Server state (data cache) — Not generated yet · 6 items · `frontend-engineering/state-management/server-state`
    - Server state vs client state (core)
    - TanStack Query (core)
    - SWR (opt)
    - RTK Query (adv)
    - GraphQL clients (adv)
    - Framework-integrated data (core)
- [ ] **12.4** URL, form & persisted state — Not generated yet · 4 items · `frontend-engineering/state-management/url-form-and-persisted-state`
    - URL as state (core)
    - Form state (core)
    - Persisted state (core)
    - Cross-tab & cross-device sync (adv)
- [ ] **12.5** Realtime, collaborative & local-first state — Not generated yet · 4 items · `frontend-engineering/state-management/realtime-collaborative-and-local-first-state`
    - Realtime state (adv)
    - CRDTs & collaboration (opt)
    - Local-first / sync engines (opt)
    - Capstone: state architecture (adv)

## 13 Data Fetching, APIs & Networking in the App

Talking to backends correctly: types, errors, retries, caching, realtime and mocking.

- [ ] **13.1** API styles — Not generated yet · 6 items · `frontend-engineering/data-fetching-apis-and/api-styles`
    - REST consumption (core)
    - GraphQL (core)
    - tRPC (adv)
    - OpenAPI & codegen (core)
    - gRPC-web / Connect, oRPC (opt)
    - BFF (Backend for Frontend) (adv)
- [ ] **13.2** Client networking practices — Not generated yet · 9 items · `frontend-engineering/data-fetching-apis-and/client-networking-practices`
    - HTTP clients (core)
    - Error handling strategy (core)
    - Retries, timeouts, backoff (core)
    - Race conditions & deduplication (core)
    - Pagination & infinite scroll (core)
    - File uploads (core)
    - Realtime UI updates (adv)
    - API mocking (core)
    - API debugging tools (core)
- [ ] **13.3** Backend basics for frontend engineers — Not generated yet · 6 items · `frontend-engineering/data-fetching-apis-and/backend-basics-for-frontend-engineers`
    - Server frameworks you will meet (adv)
    - Databases & ORMs (adv)
    - Backend-as-a-Service (opt)
    - Serverless & edge functions (adv)
    - Headless CMS & content APIs (opt)
    - Payments on the web (opt)

## 14 Loading Strategies & UX Patterns

Perceived performance and resilient UI states: what users see while data, code and assets load.

- [ ] **14.1** Loading states — Not generated yet · 6 items · `frontend-engineering/loading-strategies-and-ux/loading-states`
    - The five UI states (core)
    - Spinners vs skeletons vs placeholders (core)
    - Suspense-driven loading (core)
    - Optimistic UI (core)
    - Progress & long tasks (core)
    - Error & retry UX (core)
- [ ] **14.2** Loading code & assets — Not generated yet · 8 items · `frontend-engineering/loading-strategies-and-ux/loading-code-and-assets`
    - Code splitting (core)
    - Lazy loading (core)
    - Prefetching & preloading (core)
    - Image loading UX (core)
    - Font loading (core)
    - Virtualisation & windowing (core)
    - Pagination vs infinite scroll vs load more (core)
    - Islands, defer & idle hydration (adv)
- [ ] **14.3** UX quality patterns — Not generated yet · 8 items · `frontend-engineering/loading-strategies-and-ux/ux-quality-patterns`
    - Responsive & adaptive UX (core)
    - Microinteractions & feedback (core)
    - Offline & flaky network UX (adv)
    - Dark mode (core)
    - Search, filtering & command palettes (adv)
    - Drag & drop UX (adv)
    - Rich text & editors (opt)
    - AI UX patterns (adv)

## 15 UI Design, Design Systems & Component Libraries

Bridge design and engineering: tokens, components, documentation, governance. "Frontend design" mastery lives here.

- [ ] **15.1** Design fundamentals for engineers — Not generated yet · 4 items · `frontend-engineering/ui-design-design-systems/design-fundamentals-for-engineers`
    - Visual design basics (core)
    - Typography & colour systems (core)
    - UX fundamentals (core)
    - Figma for developers (core)
- [ ] **15.2** Design systems — Not generated yet · 13 items · `frontend-engineering/ui-design-design-systems/design-systems`
    - What a design system is (core)
    - Design tokens (core)
    - Component API design (core)
    - Headless component libraries (core)
    - shadcn/ui model (core)
    - Styled component libraries (opt)
    - Icons & illustration (core)
    - Theming architecture (adv)
    - Documentation with Storybook (core)
    - Visual regression testing (core)
    - Distributing & versioning a design system (adv)
    - Governance & adoption (adv)
    - Capstone: mini design system (adv)

## 16 Animation, Motion & Graphics

Motion that is purposeful, performant (compositor-only) and respects reduced-motion. Survey libraries, then pick one for daily use.

- [ ] **16.1** Motion principles & performance — Not generated yet · 3 items · `frontend-engineering/animation-motion-and-graphics/motion-principles-and-performance`
    - Motion design principles (core)
    - Performant animation (core)
    - Accessibility of motion (core)
- [ ] **16.2** Native animation — Not generated yet · 5 items · `frontend-engineering/animation-motion-and-graphics/native-animation`
    - CSS transitions, keyframes, `@starting-style` (core)
    - Web Animations API (adv)
    - View Transitions (SPA & MPA) (adv)
    - Scroll-driven animations (adv)
    - SVG animation (adv)
- [ ] **16.3** Animation libraries (survey → pick) — Not generated yet · 10 items · `frontend-engineering/animation-motion-and-graphics/animation-libraries`
    - Motion (formerly Framer Motion) (core)
    - GSAP (core)
    - React Spring & physics libs (opt)
    - Anime.js v4, Motion One, Popmotion (opt)
    - AutoAnimate (opt)
    - Lottie & dotLottie (opt)
    - Rive (opt)
    - Scroll & smooth-scroll libs (opt)
    - Text & micro effects (opt)
    - Mobile animation (opt)
- [ ] **16.4** 2D/3D graphics & data visualisation — Not generated yet · 5 items · `frontend-engineering/animation-motion-and-graphics/2d-3d-graphics-and-data-visualisation`
    - Three.js & React Three Fiber (opt)
    - Other 3D/2D engines (opt)
    - Data visualisation (adv)
    - Maps (opt)
    - Canvas/diagram libraries (opt)

## 17 Testing & Quality Assurance

Confidence to ship. Follow the testing trophy: mostly integration tests, some unit, a few E2E, plus static analysis.

- [ ] **17.1** Testing strategy — Not generated yet · 3 items · `frontend-engineering/testing-and-quality-assurance/testing-strategy`
    - Testing pyramid vs trophy (core)
    - What to test (core)
    - TDD & BDD (adv)
- [ ] **17.2** Unit & component testing — Not generated yet · 6 items · `frontend-engineering/testing-and-quality-assurance/unit-and-component-testing`
    - Vitest (core)
    - Jest (core)
    - Testing Library (core)
    - Testing hooks, stores & async (core)
    - Mocking network (core)
    - Component testing in real browsers (adv)
- [ ] **17.3** End-to-end & specialised testing — Not generated yet · 11 items · `frontend-engineering/testing-and-quality-assurance/end-to-end-and-specialised-testing`
    - Playwright (core)
    - Cypress (adv)
    - Other E2E/automation (opt)
    - Visual regression testing (core)
    - Accessibility testing in CI (core)
    - Performance testing in CI (adv)
    - Contract & API testing (adv)
    - Cross-browser & device testing (core)
    - Mutation testing & test quality (opt)
    - Flaky tests (adv)
    - Security testing in pipeline (adv)

## 18 Performance Engineering

Measure first (field + lab), find the bottleneck, fix, verify, then guard with budgets. Performance is a feature and a ranking signal.

- [ ] **18.1** Measuring performance — Not generated yet · 9 items · `frontend-engineering/performance-engineering/measuring-performance`
    - Lab vs field data (core)
    - Performance metrics vocabulary (core)
    - Lighthouse (core)
    - WebPageTest (core)
    - Chrome DevTools Performance deep dive (core)
    - Chrome UX Report (CrUX) (core)
    - RUM (real user monitoring) (core)
    - Performance APIs (adv)
    - Performance budgets (core)
- [ ] **18.2** Network & delivery optimisation — Not generated yet · 6 items · `frontend-engineering/performance-engineering/network-and-delivery-optimisation`
    - Reduce TTFB (core)
    - Compression & minification (core)
    - Caching strategy (core)
    - Resource prioritisation (core)
    - Speculation Rules & bfcache (adv)
    - Third-party scripts (core)
- [ ] **18.3** JavaScript optimisation — Not generated yet · 7 items · `frontend-engineering/performance-engineering/javascript-optimisation`
    - Bundle analysis (core)
    - Tree shaking & side effects (core)
    - Shrinking dependencies (core)
    - Shipping modern JS (adv)
    - Main-thread work & long tasks (core)
    - Hydration cost (adv)
    - Memory leaks (adv)
- [ ] **18.4** Rendering & asset optimisation — Not generated yet · 6 items · `frontend-engineering/performance-engineering/rendering-and-asset-optimisation`
    - Layout thrashing & forced reflow (core)
    - CSS performance (adv)
    - Image optimisation (core)
    - Font optimisation (core)
    - Video optimisation (adv)
    - Rendering many DOM nodes (core)
- [ ] **18.5** Framework-level performance — Not generated yet · 4 items · `frontend-engineering/performance-engineering/framework-level-performance`
    - React performance checklist (core)
    - Next.js performance checklist (adv)
    - Mobile & low-end devices (core)
    - Capstone: performance audit (core)

## 19 Core Web Vitals (LCP, INP, CLS)

Google's user-experience metrics; part of page-experience ranking signals. "Good" = 75th percentile of real users passes all three, per device class.

- [ ] **19.1** Understanding the metrics — Not generated yet · 3 items · `frontend-engineering/core-web-vitals/understanding-the-metrics`
    - Core Web Vitals overview & thresholds (core)
    - Supporting metrics (core)
    - Where the numbers come from (core)
- [ ] **19.2** Largest Contentful Paint (LCP) — Not generated yet · 3 items · `frontend-engineering/core-web-vitals/largest-contentful-paint`
    - What LCP measures (core)
    - LCP sub-parts (core)
    - Fixing LCP (core)
- [ ] **19.3** Interaction to Next Paint (INP) — Not generated yet · 3 items · `frontend-engineering/core-web-vitals/interaction-to-next-paint`
    - What INP measures (core)
    - Diagnosing INP (core)
    - Fixing INP (core)
- [ ] **19.4** Cumulative Layout Shift (CLS) — Not generated yet · 2 items · `frontend-engineering/core-web-vitals/cumulative-layout-shift`
    - What CLS measures (core)
    - Fixing CLS (core)
- [ ] **19.5** Operating Core Web Vitals — Not generated yet · 3 items · `frontend-engineering/core-web-vitals/operating-core-web-vitals`
    - CWV monitoring & alerting (adv)
    - CWV for SPAs & soft navigations (adv)
    - Business impact (adv)

## 20 Frontend Security

The browser is hostile territory: never trust the client, defend in depth with headers, sanitisation, strict CSP and a clean supply chain. Practise only on your own apps or intentionally vulnerable labs.

- [ ] **20.1** Security foundations — Not generated yet · 4 items · `frontend-engineering/frontend-security/security-foundations`
    - Threat modelling for frontends (core)
    - OWASP Top 10 (2025) & cheat sheets (core)
    - Same-origin policy & site isolation (core)
    - CORS (core)
- [ ] **20.2** Injection & client-side attacks — Not generated yet · 15 items · `frontend-engineering/frontend-security/injection-and-client-side-attacks`
    - XSS (reflected, stored, DOM-based) (core)
    - HTML sanitisation (core)
    - Content Security Policy (CSP) (core)
    - Trusted Types (adv)
    - CSRF (core)
    - Clickjacking & UI redressing (core)
    - Open redirects & URL handling (core)
    - postMessage & cross-window security (core)
    - Prototype pollution & JS-specific bugs (adv)
    - Client-side storage risks (core)
    - CSS & HTML injection, dangling markup (adv)
    - DOM clobbering & XS-Leaks (adv)
    - Hosting user content safely (adv)
    - Realtime & WebSocket security (adv)
    - Server-side risks in full-stack frontends (adv)
- [ ] **20.3** Security headers & transport — Not generated yet · 6 items · `frontend-engineering/frontend-security/security-headers-and-transport`
    - Essential security headers (core)
    - Cross-origin isolation headers (adv)
    - Fetch metadata (adv)
    - Cookie security (core)
    - Subresource Integrity (SRI) (core)
    - Mixed content & HTTPS everywhere (core)
- [ ] **20.4** Supply chain & secrets — Not generated yet · 6 items · `frontend-engineering/frontend-security/supply-chain-and-secrets`
    - Dependency vulnerability scanning (core)
    - Malicious packages & npm worms (core)
    - Secrets management (core)
    - Source maps & information leakage (core)
    - Third-party script risk (Magecart / e-skimming) (adv)
    - SBOM & licence compliance (opt)
- [ ] **20.5** Security testing & scanning tools — Not generated yet · 7 items · `frontend-engineering/frontend-security/security-testing-and-scanning-tools`
    - SAST (static analysis) (core)
    - DAST & proxies (scan the running app) (core)
    - Browser extensions for security review (core)
    - Practice labs (core)
    - Security review checklist for every PR (core)
    - Bug bounty & responsible disclosure awareness (opt)
    - Bot protection & abuse prevention (adv)

## 21 Authentication & Authorisation

Who the user is (authn) and what they can do (authz). The frontend renders auth UX; the server must enforce it.

- [ ] **21.1** Concepts — Not generated yet · 5 items · `frontend-engineering/authentication-and-authorisation/concepts`
    - Authentication vs authorisation (core)
    - Session-based auth (core)
    - Token-based auth & JWT (core)
    - Where to store tokens (core)
    - Refresh tokens (core)
- [ ] **21.2** Protocols & modern auth — Not generated yet · 7 items · `frontend-engineering/authentication-and-authorisation/protocols-and-modern-auth`
    - OAuth 2.0 / 2.1 (core)
    - OpenID Connect (OIDC) (core)
    - SSO & enterprise auth (adv)
    - Passkeys & WebAuthn (core)
    - MFA & passwordless (core)
    - Federated Credential Management (FedCM) (opt)
    - Password UX & security (core)
- [ ] **21.3** Implementing auth in apps — Not generated yet · 6 items · `frontend-engineering/authentication-and-authorisation/implementing-auth-in-apps`
    - Route protection & guards (core)
    - Authorisation models in UI (core)
    - Auth libraries & providers (core)
    - Multi-tab & multi-device session handling (adv)
    - Auth security checklist (core)
    - Capstone: auth flows (adv)

## 22 Privacy, Data Handling & Compliance

Handling user data responsibly, inspecting what your app sends, and scanning for leaks.

- [ ] **22.1** Privacy & compliance — Not generated yet · 4 items · `frontend-engineering/privacy-data-handling-and/privacy-and-compliance`
    - Privacy regulations (core)
    - Cookie consent & consent management (core)
    - Third-party cookies & tracking changes (adv)
    - Privacy-friendly analytics (core)
- [ ] **22.2** Data validation, inspection & scanning — Not generated yet · 5 items · `frontend-engineering/privacy-data-handling-and/data-validation-inspection-and-scanning`
    - Validate data at boundaries (core)
    - Inspect what your app sends (core)
    - PII handling in the frontend (core)
    - Scanning for exposed data & tech (adv)
    - Data integrity & encryption (adv)

## 23 SEO (Rank Higher on Search & AI Engines)

Technical SEO is a frontend responsibility: crawlability, renderability, speed, structure and metadata. Content quality and links do the rest.

- [ ] **23.1** How search engines work — Not generated yet · 3 items · `frontend-engineering/seo/how-search-engines-work`
    - Crawl → render → index → rank (core)
    - JavaScript SEO (core)
    - Mobile-first indexing (core)
- [ ] **23.2** Technical SEO — Not generated yet · 14 items · `frontend-engineering/seo/technical-seo`
    - Title & meta description (core)
    - robots.txt & meta robots (core)
    - XML sitemaps (core)
    - Canonical URLs & duplicate content (core)
    - Redirects & status codes (core)
    - URL structure & internal linking (core)
    - Structured data (JSON-LD / schema.org) (core)
    - International SEO (adv)
    - Images & video SEO (core)
    - Page experience signals (core)
    - SPA & framework SEO (core)
    - Pagination & infinite scroll SEO (adv)
    - IndexNow & fast indexing (adv)
    - Log file analysis & crawl budget (opt)
- [ ] **23.3** Content, authority & local — Not generated yet · 5 items · `frontend-engineering/seo/content-authority-and-local`
    - Search intent & keyword research (core)
    - E-E-A-T & helpful content (core)
    - Link building & digital PR basics (opt)
    - Local SEO (opt)
    - Google Discover, News & Merchant listings (opt)
- [ ] **23.4** AI search & generative engine optimisation (GEO) — Not generated yet · 4 items · `frontend-engineering/seo/ai-search-and-generative-engine-optimisation`
    - AI search landscape (core)
    - Making content AI-retrievable (core)
    - AI crawler control (core)
    - Measuring AI visibility (opt)
- [ ] **23.5** SEO tooling & audits — Not generated yet · 4 items · `frontend-engineering/seo/seo-tooling-and-audits`
    - Google Search Console & Bing Webmaster Tools (core)
    - SEO crawlers & suites (core)
    - SEO in CI (adv)
    - Capstone: SEO audit & fix (core)

## 24 PWA, Offline & Service Workers

Installable, reliable, offline-capable web apps.

- [ ] **24.1** Progressive Web Apps — Not generated yet · 7 items · `frontend-engineering/pwa-offline-and-service/progressive-web-apps`
    - Web App Manifest (core)
    - Service worker lifecycle (core)
    - Caching strategies (core)
    - Offline-first data (adv)
    - Push notifications (adv)
    - Advanced PWA capabilities (opt)
    - PWA auditing (core)

## 25 Internationalisation (i18n) & Localisation (l10n)

Ship to the world: languages, formats, directions.

- [ ] **25.1** i18n — Not generated yet · 6 items · `frontend-engineering/internationalisation-and-localisation/i18n`
    - i18n fundamentals (core)
    - Formatting with Intl (core)
    - i18n libraries (core)
    - RTL & bidirectional text (core)
    - Locale routing & SEO (adv)
    - Translation workflow (adv)

## 26 Architecture, System Design & Micro Frontends

Designing frontends that scale across features, teams and years.

- [ ] **26.1** Frontend architecture — Not generated yet · 8 items · `frontend-engineering/architecture-system-design-and/frontend-architecture`
    - Architecture principles for UI (core)
    - Folder & module structure (core)
    - Data layer architecture (core)
    - Clean / hexagonal architecture on the frontend (adv)
    - Error handling architecture (core)
    - Feature flags & experimentation (core)
    - Architecture Decision Records (ADRs) & RFCs (core)
    - Scaling codebases & teams (adv)
- [ ] **26.2** Frontend system design — Not generated yet · 4 items · `frontend-engineering/architecture-system-design-and/frontend-system-design`
    - Frontend system design framework (core)
    - Classic design problems (core)
    - Component library system design (adv)
    - Scaling realtime & large data UIs (adv)
- [ ] **26.3** Micro frontends — Not generated yet · 9 items · `frontend-engineering/architecture-system-design-and/micro-frontends`
    - What & why (and why not) (core)
    - Composition strategies (core)
    - Module Federation 2.0 (core)
    - single-spa, Native Federation, qiankun, Piral (adv)
    - Cross-app communication (core)
    - Routing across micro frontends (adv)
    - Shared dependencies & design consistency (adv)
    - Deployment & ops for micro frontends (adv)
    - Performance & security of micro frontends (adv)

## 27 Delivery: CI/CD, Hosting, Observability

Getting code to users safely and seeing what happens in production.

- [ ] **27.1** CI/CD & hosting — Not generated yet · 7 items · `frontend-engineering/delivery-ci-cd-hosting/ci-cd-and-hosting`
    - CI pipelines (core)
    - Preview deployments (core)
    - Hosting platforms (core)
    - Docker for frontend (adv)
    - Web server configuration (adv)
    - Release strategies (adv)
    - Domains & DNS for deploys (core)
- [ ] **27.2** Observability — Not generated yet · 5 items · `frontend-engineering/delivery-ci-cd-hosting/observability`
    - Error tracking (core)
    - Session replay & product analytics (adv)
    - Frontend logging & tracing (adv)
    - RUM & performance monitoring (core)
    - Uptime & synthetic monitoring (opt)
- [ ] **27.3** Production readiness checklist (check before every launch) — Not generated yet · 7 items · `frontend-engineering/delivery-ci-cd-hosting/production-readiness-checklist`
    - Performance gate (core)
    - Accessibility gate (core)
    - Security gate (core)
    - SEO gate (core)
    - Privacy & legal gate (core)
    - Resilience gate (core)
    - Cross-browser & device gate (core)

## 28 AI-Era Frontend Engineering

Using AI to build faster, and building AI-powered UIs safely.

- [ ] **28.1** AI as a tool — Not generated yet · 5 items · `frontend-engineering/ai-era-frontend-engineering/ai-as-a-tool`
    - Effective AI-assisted coding (core)
    - How LLMs work (for engineers) (core)
    - Prompting & agent techniques (core)
    - Agents that drive browsers (adv)
    - Design-to-code tools (opt)
- [ ] **28.2** Building AI features — Not generated yet · 4 items · `frontend-engineering/ai-era-frontend-engineering/building-ai-features`
    - AI SDKs & streaming UI (adv)
    - Generative UI & chat UX (adv)
    - On-device & in-browser ML (opt)
    - AI security for frontends (adv)

## 29 Mastery, Career & Capstones

Consolidate everything into portfolio-grade projects and habits that keep you growing.

- [ ] **29.1** Capstone projects (do in order) — Not generated yet · 6 items · `frontend-engineering/mastery-career-and-capstones/capstone-projects`
    - Capstone A — Accessible marketing site (core)
    - Capstone B — Full-stack product app (core)
    - Capstone C — Design system in a Turborepo (adv)
    - Capstone D — Micro-frontend platform (adv)
    - Capstone E — Realtime / offline app (adv)
    - Capstone F — Performance & security audit report (core)
- [ ] **29.2** Professional growth — Not generated yet · 8 items · `frontend-engineering/mastery-career-and-capstones/professional-growth`
    - Code review skills (core)
    - Technical writing & documentation (core)
    - Code documentation tooling (adv)
    - Refactoring safely (core)
    - Open source contribution (adv)
    - Interview readiness (core)
    - Senior/staff mindset (adv)
    - Continuous learning cadence (core)
### 29.3 Appendix — Quick reference of browser extensions by purpose

_Reference section: no topic._
<!-- tutor:generated:end -->

## My insights
