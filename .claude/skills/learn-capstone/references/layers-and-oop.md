# Layers and object-oriented design for the capstone

Read this before designing. The reader of the finished project is a beginner.
The goal is a codebase where they can open any file, say what that class is for
in one sentence, and find where to add a feature.

## 1. The four layers

| Layer | Contains | May depend on | Must not contain |
|-------|----------|---------------|------------------|
| `domain` | Entities, value objects, domain errors, and ports (interfaces that describe what the domain needs from outside) | nothing outside itself | database clients, HTTP, environment variables, logging libraries |
| `application` | Use cases: one class per thing the system does, with one public method | `domain` | SQL, HTTP request objects, framework types |
| `infrastructure` | Adapters that implement the ports (repository on PostgreSQL, queue on Redis, HTTP client), configuration, logger | `domain`, external libraries | business rules |
| `interface` | HTTP routes, CLI commands, message consumers: parse input, call one use case, format output | `application`, `domain` types | business rules, direct database access |

One more file, `main`, is the composition root. It is the only place that
creates adapters and passes them into use cases.

The rule that holds it together: **dependencies point inward**. `domain` knows
nobody. This is why the business logic can be tested without a database, and why
a beginner can read `domain` and `application` first and understand the whole
system.

## 2. Where each object-oriented idea belongs

Use an idea where it removes a real problem, and write that reason into
`ARCHITECTURE.md`. Do not add a pattern to have it on the list.

| Idea | Where it shows in the capstone | The problem it removes |
|------|--------------------------------|------------------------|
| Encapsulation | An entity keeps its fields private and changes state only through methods that check the rules (`job.markFailed(reason)`) | An invalid state cannot be created from outside |
| Abstraction | A port such as `JobRepository` describes what is needed, not how | Use cases do not change when the database changes |
| Polymorphism | Two adapters behind one port: `InMemoryJobRepository` for tests, `RedisJobRepository` for production | Tests run without infrastructure; the choice is made once, in `main` |
| Composition | A use case receives its collaborators in the constructor | Behavior is combined without inheritance chains |
| Single responsibility | One class per use case; one adapter per external system | A change has one place to go |
| Open/closed | A new notification channel is a new class that implements `Notifier`; no existing class is edited | Features are added without breaking tested code |
| Liskov substitution | Every adapter passes the same contract test for its port | Any implementation can replace another safely |
| Interface segregation | Small ports (`JobReader`, `JobWriter`) when a client needs only part | Classes do not depend on methods they never call |
| Dependency inversion | `application` depends on the port in `domain`; `infrastructure` implements it | The direction of dependency is inward |

Patterns that often fit, when the problem calls for them: Repository (storage),
Strategy (interchangeable rules such as retry policies), Factory (building
entities from raw input), Adapter (wrapping a client library). Use at most the
ones the problem needs, and name each in `ARCHITECTURE.md` with its file.

## 3. Rules that keep it readable for a beginner

- One class per file. The file name is the class name.
- A class name says its role: `PlaceOrderUseCase`, `OrderRepository`,
  `PostgresOrderRepository`, `OrderController`. Avoid `Manager`, `Helper`,
  `Util`, `Service` without a noun in front, and `Base`.
- A class is under about 150 lines and a method under about 30. Longer means two
  responsibilities.
- Constructors receive dependencies. No global singletons, no service locator,
  no dependency-injection framework, no decorators that hide wiring.
- No inheritance for code reuse. Inherit only when a subtype truly is the parent
  type everywhere; otherwise compose.
- Domain errors are classes (`JobNotFoundError`), thrown in `domain` or
  `application`, and turned into a response in `interface`.
- No clever metaprogramming, reflection, or dynamic imports.
- Each public method has a one-line comment only when its reason is not obvious
  from its name.

## 4. Being honest about the language

Object-oriented structure is a tool, and languages offer it differently.

- **TypeScript, Python, Java, Kotlin, C#, Swift**: classes and interfaces (or
  `Protocol` / abstract base classes in Python) map directly onto this document.
- **Go**: there are no classes. Use structs with methods, small interfaces
  declared where they are consumed, and constructor functions (`NewJobService`).
  Encapsulation is by package and by unexported fields. Say this in
  `ARCHITECTURE.md`.
- **Rust**: use structs, `impl` blocks, and traits as ports. There is no
  inheritance; say so.
- **React and other UI code**: components are functions. Keep classes for the
  non-visual core (domain models, API clients, stores) and use components and
  hooks for the view. Say which part is class-based and which is not.
- **SQL, shell, YAML, notebooks**: these are not object-oriented. Structure them
  by modules and clear file names, and put any Python or TypeScript around them
  into classes only where it has state and behavior.

In `ARCHITECTURE.md`, under "Object-oriented ideas and where they are used",
include one short paragraph beginning "Where classes do not fit" whenever part
of the project is not class-based, and state the reason. A beginner learns more
from an honest boundary than from classes forced onto a script.

## 5. Production qualities, in their smallest useful form

| Quality | Minimum for the capstone |
|---------|--------------------------|
| Configuration | One `Config` class reads environment variables, validates them, and fails at startup with a message naming the missing variable. `.env.example` lists every variable. |
| Logging | One logger that writes structured lines with a level, a message, and a request or job id. Passed in through constructors. |
| Error handling | Domain errors as classes; one place in `interface` that maps them to responses; unexpected errors logged with context. |
| Tests | Unit tests for every entity and use case with in-memory fakes; at least one integration test through real adapters. |
| Run recipe | A `Dockerfile`, plus `docker-compose.yml` when a database or broker is needed, started with one command. |
| Health | A health endpoint or command that reports whether dependencies are reachable, when the project is a service. |
| Shutdown | A service finishes in-flight work on SIGTERM before exiting, when the topic involves workers or connections. |

## 6. Self-check before `unit ... done`

Answer each line with yes. If one is no, fix it first.

- Every test was run in this session and passed, including one integration test.
- The project was started once with the run recipe and answered.
- No file in `src/domain` imports from `infrastructure`, `interface`, or an
  external client library.
- Every class in the code appears in the table in `ARCHITECTURE.md` with the
  same name and file path, and the reverse.
- `ARCHITECTURE.md` has at least three mermaid diagrams (layers, request flow,
  deployment) whose boxes and arrows exist in the code and the run recipe, and
  an `## Interactive walkthrough` component spec with documented props only.
- Each diagram is registered: `node harness/bin/tutor.mjs visuals <topic> check`
  passes, and `used_in` lists `ARCHITECTURE.md` (and the vault note for the one
  embedded there).
- `node harness/bin/tutor.mjs style ARCHITECTURE.md` shows no warning you could easily fix.
- `## Borrowed from production` has at least three rows, each with a practice,
  a source note, and a file in this project.
- Every object-oriented idea named in `ARCHITECTURE.md` points to a file.
- `docs/adr/0001-*.md` exists and names at least one real alternative.
- Configuration is read only from the environment; `.env.example` is complete;
  no secret is committed.
- Dependency versions are exact.
- The vault note has all headings, ends with `## My insights`, has the
  architecture diagram under `## Architecture at a glance`, links each capstone
  visual note `[[visual-<id>-<slug>]]`, and every wikilink in it points to an
  existing file (run `tutor map <topic>` first so the visual notes exist).
