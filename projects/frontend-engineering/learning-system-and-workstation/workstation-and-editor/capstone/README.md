# Dev environment configurator

## The problem

A developer sets up a new machine by hand: they edit a shell rc, set git
identity, configure an editor, and pick a Node version. The steps are easy to
get slightly wrong, and a new machine means doing them all again.

## What it does

Pick your shell, git identity, editor, and Node version in a form. The app
validates the choices, generates a ready dotfiles repository (shell config,
`.gitconfig`, `.nvmrc`, `.editorconfig`, editor settings, a `README.md`, and a
`CHECKLIST.md`), remembers the choice in the browser, and downloads a single
`install.sh` that recreates the whole setup on a new machine.

## How to run

```bash
npm install
npm run dev        # development server
npm run build      # typecheck, then bundle to dist/
npm run preview    # serve the production bundle
```

Or with Docker:

```bash
docker build -t dev-env-configurator .
docker run -p 8080:80 dev-env-configurator
# open http://localhost:8080
```

## How to test

```bash
npm test           # 24 unit + integration tests, no browser needed
npm run typecheck  # tsc --noEmit
```

## Configuration

Configuration is read only from environment variables, baked into the bundle at
build time. `.env.example` lists every variable.

| Variable | Meaning | Example |
|----------|---------|---------|
| `VITE_APP_TITLE` | Page heading | `Dev environment configurator` |
| `VITE_STORAGE_KEY` | Namespace for the saved configuration | `dev-env-configurator` |

## Project layout

```
src/app/                          composition root, app shell, error boundary
src/features/configurator/        the form, its hook, model, and generator
src/shared/                       reusable UI, adapters, config, logger, errors
tests/unit/                       domain, generator, storage, config tests
tests/integration/                the whole flow through the real generator
tests/fakes/                      in-memory storage and downloader for tests
```

## Where to read next

Read `ARCHITECTURE.md`, then `src/features/configurator/model.ts`, then
`src/features/configurator/DotfilesGenerator.ts`. The decision records are in
`docs/adr/`.
