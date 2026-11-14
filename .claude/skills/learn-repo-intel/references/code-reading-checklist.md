# Code reading checklist: what to look for beyond the README

Scouts use part 1 and part 2. Module workers use part 3 and part 4. The playbook heading
"Repository analysis focus" of the topic's domain adds domain-specific questions; when it
disagrees with this file, the playbook wins.

## 1. Where technologies and external services are declared (scout, `build-and-infra` slice)

Look for these files at the repository root and one level below. List the ones that exist
with `git -C .cache/repos/<org>__<repo> ls-files | grep -E '<pattern>'`.

| What it tells you | Files |
|-------------------|-------|
| Language dependencies | `package.json`, `pnpm-workspace.yaml`, `requirements*.txt`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `pom.xml`, `build.gradle*`, `Gemfile`, `composer.json`, `*.csproj`, `mix.exs`, `CMakeLists.txt`, `Makefile` |
| Services the code needs to run | `docker-compose*.yml`, `compose*.yaml`, `Dockerfile*`, `.devcontainer/`, `Procfile`, `Tiltfile` |
| Deployment and infrastructure | `helm/`, `charts/`, `k8s/`, `kubernetes/`, `deploy/`, `terraform/`, `*.tf`, `pulumi/`, `serverless.yml`, `fly.toml`, `vercel.json` |
| CI and release | `.github/workflows/*.yml`, `.gitlab-ci.yml`, `.circleci/config.yml`, `Jenkinsfile`, `.goreleaser.yml`, `release-please-config.json` |
| Configuration and secrets handling | `.env.example`, `config/`, `*.conf`, `settings*.py`, `application*.yml` |
| Code quality gates | `.eslintrc*`, `ruff.toml`, `.golangci.yml`, `clippy.toml`, `.pre-commit-config.yaml`, `sonar-project.properties` |
| Security practice | `SECURITY.md`, `.github/dependabot.yml`, `renovate.json`, `codeql*.yml`, fuzzing folders |
| How the team works | `CONTRIBUTING.md`, `CODEOWNERS`, `docs/adr/`, `ARCHITECTURE.md`, `ADOPTERS.md` |

Do not read lock files (`package-lock.json`, `pnpm-lock.yaml`, `go.sum`, `Cargo.lock`,
`poetry.lock`). They are large and add nothing a manifest does not say.

For each dependency that matters, ask: is it a core part of how the topic is implemented, or
general tooling? Only the first kind needs a detailed "why it is used here".

## 2. Choosing slices (scout)

Ask these questions in order and stop when you have 4–8 slices.

1. Which folders contain the topic keywords most often? (The `git grep` count from the skill.)
2. Where are the tests of those folders?
3. Where does a request or a piece of data enter the system, and where is the topic's code
   called from?
4. Which files declare technologies, services, CI, and configuration? (Part 1.)
5. Does the playbook ask for something specific (for example authentication, observability,
   migrations)? Where does it live?

Leave out: `vendor/`, `third_party/`, `node_modules/`, generated code (`*.pb.go`,
`*_generated.*`, `dist/`), `docs/`, `website/`, `examples/`, translations, fixtures and
recorded test data, images and other binary files.

## 3. Questions for a module worker

Answer the ones that apply to your slice. Each answer needs evidence
(`` `path:line @ sha` ``). Skip a question when the slice has nothing on it; do not guess.

### Code paths

- What is the main path through this slice, from the entry point to the result?
- Which data structures carry the state, and who owns them?
- Where are the boundaries: what does this module expose, and what does it hide?
- What is surprising compared with the simple version in the lesson?

### Tests

- Which behaviours do the tests protect? Read the test names first.
- Which edge cases and failure cases are tested (crash, timeout, duplicate, empty, huge)?
- How do the tests set up dependencies: real services, containers, fakes, or mocks?
- Are there property tests, fuzz tests, benchmarks, or integration suites?

### Configuration

- Which settings exist for this part, and what are the defaults?
- Which defaults are conservative, and does a comment say why?
- How is configuration validated at startup?

### CI and delivery (mostly the `build-and-infra` slice)

- What must pass before a change is merged (tests, linters, sanitizers, matrix of versions)?
- How is a release built and published?
- Which checks run on a schedule (nightly tests, fuzzing, dependency updates)?

### Error handling

- What happens on invalid input? Where is it rejected?
- What happens when a dependency fails: retry, backoff, circuit breaker, fallback, or crash?
- Are errors wrapped with context, and how are they reported to the caller?
- Is anything made idempotent or transactional to survive a retry?

### Performance

- What limits exist: batch sizes, buffer sizes, timeouts, rate limits, backpressure?
- What is cached, pooled, batched, or done lazily, and why?
- Which data structure or algorithm was chosen for speed or memory, and what does a comment
  say about the trade-off?

### Security

- Where is input validated, authenticated, and authorized?
- How are secrets supplied and kept out of logs?
- Which unsafe operations are guarded (parsing, deserialization, shell, file paths)?

### Technologies and external services

- Which libraries does this slice import, and what does each do here?
- Which external services does it call (databases, queues, cloud APIs), and through which
  client?
- Is the service wrapped behind an interface so it can be swapped or faked?

## 4. What makes a good "beyond the textbook" entry

An entry answers: "what do they do beyond the textbook version, and why?"

| Weak | Strong |
|------|--------|
| "The code is well tested." | "Every consumer-group command has a test that kills the client between read and acknowledge, to prove the entry stays pending (`tests/unit/type/stream-cgroups.tcl:210 @ a1b2c3d`)." |
| "They use a radix tree." | "Entries are packed into listpack nodes inside a radix tree keyed by ID, so thousands of small entries share one allocation; the header comment gives memory use as the reason (`src/stream.h:15-40 @ a1b2c3d`)." |
| "Good error handling." | "A blocked read is released with an error when the stream key is deleted, instead of hanging forever (`src/blocked.c:520 @ a1b2c3d`)." |

A strong entry names the practice, says what the simple version would do instead, gives the
reason, and points at the line. The file paths and line numbers in this table only show the
format; they are not real citations.
