# Learning tracker

## The problem

You work through a frontend roadmap one item at a time. Three weeks later you
cannot tell which items you understand and which ones you only skimmed, because
your notes are a list of browser tabs. A learning log fixes this. Every roadmap
item gets one note, every note holds the same four steps of the learning loop,
and a dashboard names the steps you still owe yourself.

## What it does

Learning tracker is a small web app. You add one note per roadmap item, and
each note holds four steps: read, build, measure, explain. The dashboard shows
how much of the roadmap is done and names the gaps. The log lives in the
browser's local storage, so nothing leaves your machine, and you can export the
whole log as Markdown at any time.

The app is a static build. There is no server, no account, and no database.

## How to run

You need Node.js 20.19 or newer.

```bash
cd projects/frontend-engineering/learning-system-and-workstation/how-to-learn-frontend/capstone
npm install
cp .env.example .env      # the app needs these three variables
npm run dev               # prints the local address, usually http://localhost:5173
```

Open the address in your browser, type a roadmap item such as "Browser support
literacy", and press **Add item**. Then check the steps of the loop as you do
them.

To build the static site and serve it:

```bash
npm run build             # writes dist/
npm run preview           # serves dist/ on http://localhost:4173
```

The `dist/` folder is a plain static site. Copy it to any static host, such as
GitHub Pages, Netlify, or a web server with a document root.

## How to test

```bash
npm test                  # 42 unit tests and 8 integration tests
npm run typecheck         # the strict TypeScript check
```

The unit tests run in Node and need no browser. The integration tests run in
jsdom and use the real storage adapter, the real repository, and the real
React components. One of them builds the app with Vite and checks the files
that come out of the build, so a broken bundle fails the test suite.

## Configuration

Every value comes from an environment variable. All three are read at startup,
and a missing one stops the app with a message that names it.

| Variable | Meaning | Example |
|----------|---------|---------|
| `VITE_TRACKER_STORAGE_KEY` | The key the log is saved under in the browser | `learning-tracker` |
| `VITE_TRACKER_SCHEMA_VERSION` | The shape of the saved log. The app migrates an older version | `2` |
| `VITE_TRACKER_LOG_LEVEL` | The lowest log level the app writes | `info` |

Anything in a `VITE_` variable is built into the browser bundle, so it is
public. This project stores no secret, and the example file holds placeholder
values only.

## Project layout

```
src/
  domain/          the rules: the note, the steps, the patches, the ports
  application/     one class per thing the app does
  infrastructure/  the adapters: the browser storage, the logger, the config
  interface/       the React parts: the controller, the hook, the components
  main.tsx         the composition root: the only file that wires things up
tests/
  unit/            the rules and the use cases, with in-memory fakes
  integration/     the whole flow in jsdom, and the built artefact
docs/adr/          the decisions and the reasons behind them
```

Dependencies point inward. `domain` knows nobody, `application` knows only
`domain`, and the browser adapters sit outside and are chosen once in
`src/main.tsx`. The architecture is written down in `ARCHITECTURE.md`.

## Where to read next

1. `ARCHITECTURE.md` for the layers, the classes, and the three diagrams.
2. `src/domain/LearningNote.ts` for the rules of one note.
3. `src/domain/TrackerState.ts` for the patch that changes the log.
4. `src/application/TrackerStore.ts` for the one place that writes.
5. `src/main.tsx` for the wiring.
6. `docs/adr/0001-versioned-log.md` for the decision about the saved shape.

## Performance budget

The built bundle is about 73 kB gzipped, most of it React. The page has no
images, no web fonts, and no third-party script, so the first paint needs one
round trip. Budget: LCP under 2.5 s on a throttled profile. Measure it with
the Lighthouse panel in Chrome DevTools against `npm run preview`.

## Assets and licences

This project uses no images, no icons, and no fonts of its own. It ships the
React and React DOM libraries under the MIT licence.
