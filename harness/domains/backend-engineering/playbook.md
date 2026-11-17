# Backend Engineering playbook

Guidance for the stage skills. Each `##` heading is read by one skill; keep the eight headings and their order.

## How this domain is learned

**Prerequisite chain.** A topic may assume everything above it.

1. One language and its runtime (TypeScript on Node.js by default), the command line, git
2. HTTP (methods, status codes, headers, cookies) and JSON
3. One web framework: routing, middleware, validation, error handling
4. SQL and one relational database (PostgreSQL): tables, joins, indexes, transactions
5. Code structure: layers, dependency injection, testing with test doubles
6. Authentication and authorization
7. Caching, background jobs, and messaging
8. Concurrency, reliability patterns (timeouts, retries, idempotency), observability
9. Architecture styles and when to split a service

**Beginner misconceptions to correct early.**

- "A 200 response means it worked." Partial failure, timeouts, and retries make "did it happen once?" the real question; teach idempotency early.
- "The ORM means I do not need SQL." N+1 queries, missing indexes, and transaction boundaries are still the developer's job.
- "A cache makes things faster." It trades freshness and complexity for speed; invalidation is the hard part.
- "A queue guarantees exactly-once." Delivery is at-least-once in practice; consumers must be idempotent.
- "JWT is more secure than sessions." They solve different problems; revocation is the trade-off.
- "Microservices are the grown-up architecture." A well-structured monolith is the default; splitting is a cost paid for team and scaling reasons.
- "Node.js is single-threaded, so there are no race conditions." Interleaved async steps and several instances still race on shared data.
- "Errors are exceptions to catch at the top." Expected failures (validation, not found, conflict) are part of the API contract.

**Choosing depth.**

- `quick`: one mechanism (ETag, cursor pagination, connection pool, bcrypt cost factor).
- `standard`: one technology or pattern (Redis caching, Redis Streams, JWT auth, schema migrations, rate limiting).
- `deep`: a pillar (PostgreSQL, API design, Kafka, authentication and authorization, service architecture).

**Cutting a topic into lesson pages.**

1. The problem it solves (what goes wrong without it)
2. The core model (the data structure or protocol in one picture)
3. The happy path, step by step
4. Failure: what happens on crash, timeout, duplicate, or overload
5. The guarantees and the trade-off it makes
6. Operating it: configuration, limits, what to monitor
7. Production use (from repo-intel) and when not to use it

## Trusted sources

**Official documentation and standards (tier A candidates).**

- Node.js docs (nodejs.org), PostgreSQL manual (postgresql.org/docs), Redis docs (redis.io/docs), SQLite docs (sqlite.org), Apache Kafka docs (kafka.apache.org), RabbitMQ docs (rabbitmq.com)
- IETF RFCs: RFC 9110 (HTTP Semantics), RFC 9111 (HTTP Caching), RFC 6749 (OAuth 2.0), RFC 7519 (JWT), RFC 9457 (Problem Details for HTTP APIs)
- OpenAPI Specification (openapis.org), GraphQL specification (graphql.org), gRPC docs (grpc.io), OpenID Connect Core (openid.net)
- The Twelve-Factor App (12factor.net)
- OWASP Cheat Sheet Series (cheatsheetseries.owasp.org) and OWASP API Security Top 10
- OpenTelemetry docs (opentelemetry.io), Prometheus docs (prometheus.io)
- Framework docs: Fastify (fastify.dev), Express (expressjs.com), NestJS (docs.nestjs.com), FastAPI (fastapi.tiangolo.com), Django (djangoproject.com), Spring (spring.io), Go (go.dev/doc, including Effective Go)
- API design guides: Google API Improvement Proposals (google.aip.dev), Microsoft REST API Guidelines (`microsoft/api-guidelines`), the Stripe API reference as a worked example of good design
- Use The Index, Luke (use-the-index-luke.com), Markus Winand, for SQL indexing

**Standard books.**

- *Designing Data-Intensive Applications*, Martin Kleppmann (O'Reilly, 2017; second edition with Chris Riccomini, 2026)
- *Release It!*, Michael T. Nygard (Pragmatic Bookshelf, 2nd edition 2018)
- *Patterns of Enterprise Application Architecture*, Martin Fowler (Addison-Wesley, 2002)
- *Domain-Driven Design*, Eric Evans (Addison-Wesley, 2003)
- *Clean Architecture*, Robert C. Martin (Prentice Hall, 2017)
- *Building Microservices*, Sam Newman (O'Reilly, 2nd edition 2021)
- *Enterprise Integration Patterns*, Gregor Hohpe and Bobby Woolf (Addison-Wesley, 2003)
- *Database Internals*, Alex Petrov (O'Reilly, 2019)
- *API Design Patterns*, JJ Geewax (Manning, 2021)
- *Unit Testing Principles, Practices, and Patterns*, Vladimir Khorikov (Manning, 2020)
- *Design Patterns*, Gamma, Helm, Johnson, Vlissides (Addison-Wesley, 1994); *Head First Design Patterns* (O'Reilly) as the beginner route
- *Node.js Design Patterns*, Mario Casciaro and Luciano Mammino (Packt)

**Defining papers and essays.**

- "Architectural Styles and the Design of Network-based Software Architectures", Roy Fielding, PhD dissertation, UC Irvine, 2000 (REST)
- "Kafka: a Distributed Messaging System for Log Processing", Kreps, Narkhede, Rao, NetDB 2011
- "The Log: What every software engineer should know about real-time data's unifying abstraction", Jay Kreps, LinkedIn Engineering, 2013
- "Scaling Memcache at Facebook", Nishtala et al., NSDI 2013
- "A Critique of ANSI SQL Isolation Levels", Berenson et al., SIGMOD 1995
- "Architecture of a Database System", Hellerstein, Stonebraker, Hamilton, Foundations and Trends in Databases, 2007
- "On Designing and Deploying Internet-Scale Services", James Hamilton, LISA 2007
- "Dapper, a Large-Scale Distributed Systems Tracing Infrastructure", Sigelman et al., Google technical report, 2010
- "Sagas", Hector Garcia-Molina and Kenneth Salem, SIGMOD 1987

**Engineering blogs.** martinfowler.com; Stripe engineering blog (idempotency, rate limiters); AWS Builders' Library (timeouts, retries, backoff with jitter); Netflix Tech Blog; Uber Engineering; Cloudflare blog; GitHub Engineering; Discord engineering blog; Slack Engineering; Shopify Engineering; Jepsen analyses (jepsen.io); brandur.org.

**Organizations whose repositories count as production grade.** The projects themselves (`nodejs/node`, `postgres/postgres`, `redis/redis`, `valkey-io/valkey`, `apache/kafka`), framework teams (`fastify/fastify`, `nestjs/nest`, `expressjs/express`, `fastapi/fastapi`, `django/django`, `spring-projects/spring-boot`), the Apache Software Foundation and CNCF projects, and companies that run their open-source product as a business.

**Flagship application repositories for repo-intel.**

- `calcom/cal.diy` (formerly `calcom/cal.com`): TypeScript, Prisma, tRPC; scheduling logic and integrations
- `medusajs/medusa`: Node.js commerce backend with modules, workflows, and events
- `immich-app/immich`: NestJS server with jobs, PostgreSQL, and Redis (slice `server/`)
- `outline/outline`: Node.js API with queues, policies, and WebSockets
- `gitlabhq/gitlabhq`: large Rails monolith; background jobs, migrations, feature flags
- `mastodon/mastodon` and `discourse/discourse`: long-lived Rails apps with Sidekiq, caching, and federation or plugins
- `temporalio/temporal`: Go service showing durable workflows and persistence layers
- `goldbergyoni/nodebestpractices`: a reference list (tier B, not a repo-intel target)

**Avoid.** Tutorial farms (GeeksforGeeks, TutorialsPoint, Javatpoint); Medium posts by unknown authors; MERN "build X in 10 minutes" videos; tutorials that store plaintext passwords, build SQL by string concatenation, or use callbacks-era Node; benchmark blog posts from vendors selling the winner; abandoned ORMs and frameworks; "awesome" lists and boilerplate starters as repo-intel targets. Check licenses: some well-known projects are source-available, not open source; record the license as found.

## Lesson recipes

| Kind of concept | Component | Concrete example |
|---|---|---|
| Request lifecycle, pipelines | `FlowAnimation` | Packets move client → load balancer → service → database; learner kills a node and watches retries and timeouts |
| Queues, streams, pub/sub | `FlowAnimation` | Producers append to a stream, two consumer groups read; pause one consumer and watch the pending list grow |
| Caching behaviour | `FlowAnimation` | Cache-aside: miss, load, fill, hit; learner sets TTL and triggers a stampede |
| Protocol conversations | `SequenceDiagram` | OAuth authorization-code flow; a payment with an idempotency key retried after a timeout |
| Entity and connection lifecycles | `StateMachine` | Order: created → paid → shipped → refunded; circuit breaker: closed → open → half-open; job: queued → active → failed → retried |
| Service architecture | `SystemDiagram` | API, worker, PostgreSQL, Redis, object storage, and third-party APIs for one feature |
| Module and schema structure | `Graph3D` | Dependency graph of a layered codebase (controllers → services → repositories); `editable` so the learner wires a new module without breaking the direction of dependencies |
| Tunable behaviour | `ParamPlayground` | Rate limiter: bucket size and refill rate against a burst of requests; connection pool size against latency |
| Code-level patterns | `CodeWalkthrough` | A transaction with `SELECT ... FOR UPDATE`; a repository behind an interface; a retry wrapper |
| Measurements | `Chart` | p50, p95, p99 latency with and without an index; throughput as concurrency rises |
| Evolution | `Timeline` | HTTP/1.1 → HTTP/2 → HTTP/3; monolith → services history of a company |
| Static structure | `Mermaid` | Entity-relationship diagram, folder layout, class diagram of the layers |

**Activities.**

- `PredictReveal`: "Two requests read balance 100 and each withdraws 80. What is the final balance at READ COMMITTED?"
- `OrderSteps`: order the steps of a JWT login, a two-phase migration, or a graceful shutdown
- `MatchPairs`: status code to situation, isolation level to anomaly, delivery guarantee to consequence
- `Quiz`: choose queue versus stream, choose the index for a query, choose where to validate

**3D versus 2D.** Use `Graph3D` for module dependency graphs, schema graphs with many foreign keys, and service call graphs above about 10 nodes. Use `SequenceDiagram` and `FlowAnimation` (2D) for anything that is about time and order, which is most of backend; 3D adds nothing to a request path. `VectorSpace3D` does not belong here.

**Custom simulation ideas.** B-tree insert and split animation; an isolation-level sandbox where two transactions are stepped by hand; a write-ahead log replay after a crash; an index-scan versus sequential-scan visualiser on a small table; a token-bucket rate limiter the learner can spam; a consumer-group simulator with crash and claim.

**Visual recipes** (visual-first plans; standard in `harness/rubrics/visuals.md`):

- `SequenceDiagram` for request paths, transactions and retries; a registered end-to-end request-flow `Diagram` when a page introduces the whole path.
- `ClusterSim` (`load-balance` or `replication`) for health checks, retries, replicas and failover.
- `AlgorithmStepper` for B-tree splits, index lookups or a WAL replay on a small real example.
- `Video` for a request lifecycle or a transaction commit; `CompareView` for isolation levels or caching policies.

## Mini project patterns

Progress from guided to independent.

1. **CRUD API with validation and errors** (guided, 1–2 h): one resource, schema validation, problem-details error responses, tests. Proves: HTTP contract, layering. Real use: every internal service.
2. **Add the missing index** (guided, 1 h): a seeded PostgreSQL table with a slow query; read `EXPLAIN ANALYZE`, add an index, measure. Proves: query plans. Real use: fixing a slow endpoint.
3. **Cache-aside with invalidation** (semi-guided, 2 h): put Redis in front of a slow read, invalidate on write, show hit rate. Proves: TTL, invalidation, stampede. Real use: product pages.
4. **Background job queue that survives a crash** (semi-guided, 2–3 h): API enqueues, worker processes with retry and dead-letter. Proves: at-least-once and idempotent consumers. Real use: email and image processing.
5. **Auth from scratch, once** (semi-guided, 2–3 h): signup, password hashing, session or JWT, one protected route, role check. Proves: authentication versus authorization. Real use: any multi-user app.
6. **Idempotent payment endpoint** (independent, 2 h): `Idempotency-Key` header, stored responses, concurrent retries. Proves: exactly-once effect over at-least-once delivery. Real use: payments and order creation.
7. **Rate limiter middleware** (independent, 2 h): token bucket in Redis, correct under several instances, `429` with `Retry-After`. Proves: shared state and atomicity. Real use: public APIs.
8. **Observe it** (independent, 2 h): add structured logs, request ids, a metrics endpoint, and one trace to an existing project. Proves: debugging without a debugger. Real use: on-call.

Every project runs its dependencies with one `docker compose up` and has tests that prove the failure case, not only the happy path.

## Repository analysis focus

| What to find | Where it usually lives |
|---|---|
| Language, framework, package layout | `package.json`, `go.mod`, `pyproject.toml`, `Gemfile`, workspace files |
| Entry points and wiring | `main.*`, `server.*`, `app.*`, dependency-injection container or module files |
| Layering and module boundaries | `controllers/` or `routes/`, `services/`, `repositories/` or `models/`, `domain/` |
| API contract | OpenAPI or GraphQL schema, route definitions, validation schemas, versioning scheme |
| Data model and migrations | `migrations/`, `schema.prisma`, `db/schema.rb`, seed scripts |
| Transactions and consistency | where transactions start, locking, outbox tables, idempotency tables |
| Caching | cache wrapper, key naming, TTLs, invalidation call sites |
| Background work | `jobs/`, `workers/`, `queues/`, scheduler config, retry and dead-letter settings |
| Auth | middleware or guards, session or token code, permission or policy files |
| Configuration | `.env.example`, config schema, feature flags |
| Error handling | error classes, global handler, mapping to HTTP status |
| Testing strategy | `test/`, `spec/`, fixtures and factories, testcontainers, the unit to integration ratio |
| Observability | logger setup, metrics, tracing, health and readiness endpoints |
| Performance techniques | pagination, batching, connection pool settings, N+1 guards |
| Security practice | input validation, rate limiting, secret handling, dependency scanning in CI |
| CI and delivery | `.github/workflows/*`, `Dockerfile`, `docker-compose.yml`, deploy manifests |

**External services to record as `_tech` notes.** Databases, caches, brokers, object storage, search engine, email and SMS providers, payment providers, identity providers, error tracking, metrics and tracing backends. Read `docker-compose.yml`, `.env.example`, and the dependency file first; together they list almost all of them.

**Findings worth ranking high.** Where the textbook version is not enough: outbox pattern, idempotency handling, zero-downtime migrations, graceful shutdown, tenant isolation, how errors are classified as retryable.

## Capstone shape

**Production ready means.**

- Layered structure with dependencies pointing inward; no SQL in controllers
- Input validated at the edge; consistent error format (RFC 9457 problem details)
- Configuration from environment, validated at startup; `.env.example` committed
- Migrations in version control; seed script
- Tests: unit for services with fakes, integration against a real database in Docker, one end-to-end flow
- Structured JSON logs with request ids; `/healthz` and `/readyz`; basic metrics
- Timeouts on every outbound call; retries only where idempotent; graceful shutdown
- Auth with hashed passwords or delegated identity; rate limiting; no secrets in code
- `Dockerfile`, `docker-compose.yml`, CI workflow that runs lint and tests; README and at least one ADR

**Recommended structure.**

```
src/
  domain/          entities and value objects (classes with invariants)
  application/     use-case services (OrderService), ports as interfaces
  infrastructure/  PostgresOrderRepository, RedisCache, EmailClient
  http/            routes, controllers, validation schemas, error mapper
  config/          Config class, validated environment
  main.ts          composition root: builds and wires the classes
tests/
  unit/  integration/  e2e/
```

**Where OOP and SOLID fit.** This domain suits them well. One class per responsibility; services depend on interfaces (`OrderRepository`), concrete classes are injected in `main.ts` (dependency inversion); new behaviour arrives as a new implementation, not an `if` (open/closed). Keep handlers thin. Do not build inheritance trees; prefer composition, and keep pure calculations as functions.

**Example capstones.**

- URL shortener with analytics: redirects, click stream to a worker, cached lookups, rate limits
- Appointment booking API: availability, double-booking prevention with transactions, reminder jobs
- Webhook delivery service: signed payloads, retries with backoff, dead-letter and replay
- Expense-splitting API: ledger with correct money handling, idempotent settlements
- Notification service: templates, per-user preferences, queue-backed email and push with provider fallback

## Recall focus

Worth remembering a year later:

- Decision rules: queue or stream, session or token, when to cache, when to add an index, monolith or split
- Guarantees: at-most-once, at-least-once, effectively-once; what each isolation level prevents
- Failure modes: N+1, lost update, cache stampede, poison message, retry storm, connection pool exhaustion
- The reliability set: timeout, retry with backoff and jitter, idempotency key, circuit breaker
- A few commands: `EXPLAIN ANALYZE`, the Redis commands of the topic, `curl -i`

Question styles: Explain ("why must a consumer be idempotent?"), Compare ("cache-aside versus write-through"), Debug ("p99 latency doubled after a deploy and the pool is full; what do you check?"), Decide ("orders must not be lost and may be processed twice; which broker settings and what must the handler do?").

## Safety and ethics

- No secrets in code or git; `.env` is ignored, `.env.example` is committed.
- Never teach string-concatenated SQL, plaintext or fast-hash password storage, or disabled TLS verification, even "for simplicity".
- Use fake data for users and payments; never real personal data or real card numbers (use the provider's test numbers).
- Load tests run only against the learner's own local services.
- **Experience recipes** (adaptive plans; `harness/rubrics/experiences.md`, the selector decides): explainer for a request through middleware; interactive for retries, back-off and idempotency keys; branching for queue vs stream vs database polling; hybrid for an outbox pattern under failures (ClusterSim load-balance).
