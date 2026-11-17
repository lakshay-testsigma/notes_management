# System Design playbook

Guidance for the stage skills. Each `##` heading is read by one skill; keep the eight headings and their order.

## How this domain is learned

**Prerequisite chain.** A topic may assume everything above it.

1. Backend basics: HTTP, one database, one cache, one queue (see the backend playbook)
2. Networking basics: DNS, TCP, TLS, load balancers
3. Numbers: latency orders of magnitude, QPS, storage, and availability arithmetic
4. Single-node storage: indexes, B-trees and LSM trees, write-ahead log
5. Replication (leader-follower, multi-leader, leaderless) and partitioning
6. Consistency models, quorums, consensus
7. Asynchronous processing: queues, logs, streams
8. Reliability patterns and operating at scale
9. Whole-system design problems that combine the above

**Beginner misconceptions to correct early.**

- "System design is drawing boxes." It is choosing trade-offs under stated requirements and numbers; the boxes come last.
- "CAP means pick two of three." Partitions happen; the real choice is consistency or availability during a partition, and latency versus consistency otherwise (PACELC).
- "Scale means microservices and Kafka." Most systems need one database, a cache, and a queue; add parts only when a number demands it.
- "Replication is a backup." Replicas copy mistakes instantly; backups are separate.
- "Strong consistency is always better." It costs latency and availability; many features are fine with eventual consistency.
- "Exactly-once delivery exists." Exactly-once effect is built from at-least-once delivery plus idempotency.
- "Sharding first." Sharding is the last resort after indexes, caching, read replicas, and vertical scaling.
- "Averages describe latency." Tail latency (p99) decides user experience in fan-out systems.

**Choosing depth.**

- `quick`: one mechanism (consistent hashing, Bloom filter, token bucket, quorum formula).
- `standard`: one building block or pattern (replication, rate limiting, CDN, message queue design) or one classic problem (URL shortener).
- `deep`: a pillar (consensus and Raft, partitioned storage, a full design such as a chat system or news feed).

**Cutting a topic into lesson pages.**

1. Requirements and numbers: what the system must do and how big
2. The naive single-machine design and where it breaks
3. The core mechanism, in one picture
4. Normal operation, step by step
5. Failure: node crash, network partition, hot key, overload
6. The trade-off table (what was gained, what was given up)
7. How a real system does it (paper or repo-intel)

For a classic design problem use: requirements → estimation → API and data model → high-level design → deep dive on the hardest part → failure and scaling → trade-offs.

## Trusted sources

**Standard books.**

- *Designing Data-Intensive Applications*, Martin Kleppmann (O'Reilly, 2017; second edition with Chris Riccomini, 2026): the primary text
- *Understanding Distributed Systems*, Roberto Vitillo (self-published, 2nd edition 2022): the most approachable introduction
- *System Design Interview*, Alex Xu (volume 1, 2020; volume 2 with Sahn Lam, 2022): classic design problems worked through
- *Site Reliability Engineering*, Beyer, Jones, Petoff, Murphy, editors (O'Reilly, 2016; free at sre.google/books)
- *Distributed Systems*, Maarten van Steen and Andrew S. Tanenbaum (free at distributed-systems.net)
- *Database Internals*, Alex Petrov (O'Reilly, 2019)
- *Designing Distributed Systems*, Brendan Burns (O'Reilly)
- *Fundamentals of Software Architecture*, Mark Richards and Neal Ford (O'Reilly, 2020); *Software Architecture: The Hard Parts*, Ford, Richards, Sadalage, Dehghani (O'Reilly, 2021)
- *Release It!*, Michael T. Nygard (Pragmatic Bookshelf, 2nd edition 2018)

**Defining papers** (the digest stage should prefer these).

- "Time, Clocks, and the Ordering of Events in a Distributed System", Leslie Lamport, Communications of the ACM, 1978
- "The Google File System", Ghemawat, Gobioff, Leung, SOSP 2003
- "MapReduce: Simplified Data Processing on Large Clusters", Dean and Ghemawat, OSDI 2004
- "Bigtable: A Distributed Storage System for Structured Data", Chang et al., OSDI 2006
- "Dynamo: Amazon's Highly Available Key-value Store", DeCandia et al., SOSP 2007
- "Spanner: Google's Globally-Distributed Database", Corbett et al., OSDI 2012
- "In Search of an Understandable Consensus Algorithm" (Raft), Ongaro and Ousterhout, USENIX ATC 2014
- "Paxos Made Simple", Leslie Lamport, 2001
- "The Chubby Lock Service for Loosely-Coupled Distributed Systems", Mike Burrows, OSDI 2006
- "ZooKeeper: Wait-free Coordination for Internet-scale Systems", Hunt et al., USENIX ATC 2010
- "Consistent Hashing and Random Trees", Karger et al., STOC 1997
- "Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services", Gilbert and Lynch, ACM SIGACT News, 2002; "CAP Twelve Years Later", Eric Brewer, IEEE Computer, 2012
- "Consistency Tradeoffs in Modern Distributed Database System Design" (PACELC), Daniel Abadi, IEEE Computer, 2012
- "Impossibility of Distributed Consensus with One Faulty Process" (FLP), Fischer, Lynch, Paterson, Journal of the ACM, 1985
- "The Tail at Scale", Dean and Barroso, Communications of the ACM, 2013
- "Kafka: a Distributed Messaging System for Log Processing", Kreps, Narkhede, Rao, NetDB 2011
- "Scaling Memcache at Facebook", Nishtala et al., NSDI 2013; "TAO: Facebook's Distributed Data Store for the Social Graph", Bronson et al., USENIX ATC 2013
- "Amazon Aurora: Design Considerations for High Throughput Cloud-Native Relational Databases", Verbitski et al., SIGMOD 2017
- "Large-scale Cluster Management at Google with Borg", Verma et al., EuroSys 2015
- "Conflict-free Replicated Data Types", Shapiro et al., SSS 2011
- "Life beyond Distributed Transactions: an Apostate's Opinion", Pat Helland, CIDR 2007
- "End-to-End Arguments in System Design", Saltzer, Reed, Clark, ACM Transactions on Computer Systems, 1984
- "Zanzibar: Google's Consistent, Global Authorization System", Pang et al., USENIX ATC 2019

**Courses and reference sites.**

- MIT 6.5840 Distributed Systems (formerly 6.824; pdos.csail.mit.edu/6.824): lectures, papers, Raft labs
- Martin Kleppmann's distributed systems lecture series (University of Cambridge, with notes)
- The Raft site (raft.github.io) with its visualisation
- AWS Well-Architected Framework, Azure Architecture Center (cloud design patterns), Google Cloud Architecture Center
- `donnemartin/system-design-primer` (tier B study index)

**Engineering blogs.** AWS Builders' Library; All Things Distributed (Werner Vogels); Marc Brooker's blog (brooker.co.za); Martin Kleppmann's blog; Jepsen (jepsen.io); Netflix Tech Blog; Uber Engineering; Meta Engineering; Discord engineering blog; Cloudflare blog including its incident write-ups; Stripe engineering; Dropbox Tech; ByteByteGo newsletter (Alex Xu); High Scalability (older, still cited).

**Organizations whose repositories count as production grade.** CNCF graduated projects, the Apache Software Foundation, HashiCorp, and companies that publish the system they operate.

**Flagship repositories for repo-intel.**

- `etcd-io/etcd`: Raft in production; small enough to follow the write path
- `hashicorp/raft`: a readable Go Raft library
- `apache/kafka`: the log, replication, and consumer groups
- `apache/cassandra`: Dynamo-style partitioning and tunable consistency
- `tikv/tikv`: Raft groups plus a transactional key-value store (CNCF graduated)
- `vitessio/vitess`: sharding MySQL at scale (CNCF graduated)
- `valkey-io/valkey` and `redis/redis`: in-memory store, replication, cluster slots
- `envoyproxy/envoy` and `nginx/nginx`: load balancing and proxying
- `nats-io/nats-server`: compact messaging system
- `temporalio/temporal`: durable execution

**Where adopters are listed (checked 2026-11-14).** `etcd-io/etcd` and `vitessio/vitess` name their production users in `ADOPTERS.md` at the repository root. Fetch `https://raw.githubusercontent.com/<org>/<repo>/HEAD/ADOPTERS.md` and record that URL as the evidence for `used_by`. For the other repositories an adopters file at the root was not found or not checked: look on the project's own site or its foundation's project page. Verify again on the day you use it.

For a beginner, slice one path (for example "a write from client to committed") instead of the whole repository; run `tutor slice` and choose the two or three modules on that path.

**Avoid.** Interview-prep content farms and "top 50 system design questions" pages; YouTube designs with no numbers and no failure analysis; diagrams copied without sources; vendor white papers that conclude with the vendor's product; blog summaries of papers when the paper itself is readable; architecture posts about companies written by people who never worked there.

## Lesson recipes

| Kind of concept | Component | Concrete example |
|---|---|---|
| Requests through a system | `FlowAnimation` | Packets flow client → DNS → CDN → load balancer → service → cache → database; learner kills a service instance and sees health checks reroute |
| Replication and consensus | `FlowAnimation` | Raft: a leader replicates a log entry to four followers; learner partitions the network and watches an election |
| Topology you can build | `Graph3D` (`editable`) | Learner builds a design: adds a cache, a queue, replicas; a load number on each edge turns red when a node is over capacity |
| Hash rings and cluster layout | `Graph3D` | Consistent-hash ring with virtual nodes; add or remove a node and count the keys that move |
| Node and protocol states | `StateMachine` | Raft node: follower → candidate → leader; circuit breaker; two-phase commit participant |
| Ordering between nodes | `SequenceDiagram` | Quorum write with W=2 of N=3 and a late replica; a saga with a compensating step |
| Architecture overview | `SystemDiagram` | News feed: write path (fan-out on write) and read path side by side |
| Formulas and capacity | `ParamPlayground` | Sliders for N, W, R show whether reads see the latest write; replicas and per-node availability give total nines; QPS and object size give storage per year |
| Measurements and distributions | `Chart` | Latency histogram showing p50, p99, and how fan-out to 100 backends multiplies tail latency |
| Algorithms in code | `CodeWalkthrough` | Token bucket, consistent hashing lookup, vector clock comparison, in under 40 lines each |
| History | `Timeline` | GFS → MapReduce → Bigtable → Dynamo → Spanner and what each added |
| Static structure | `Mermaid` | Data model, partition layout, deployment regions |

**Activities.**

- `PredictReveal`: "The leader crashes after writing to one follower of four. Is the entry committed?" "Add a fifth cache node with modulo hashing: what fraction of keys move?"
- `OrderSteps`: order a leader election, a two-phase commit, a failover
- `MatchPairs`: requirement to component, consistency model to anomaly, pattern to the failure it handles
- `Quiz`: pick the trade-off ("fan-out on write or on read for a user with ten million followers?")

**3D versus 2D.** This is the domain where 3D earns its place: cluster topologies, hash rings, replica sets across regions, and service graphs. Use `Graph3D` when there are many nodes with roles and when the learner should build the system. Use 2D `SequenceDiagram` for message ordering and `Chart` for numbers; a timeline of messages in 3D is harder to read.

**Custom simulation ideas.** A load simulator where the learner turns the QPS dial until the design falls over, then fixes it; a partition toggle that shows split-brain; a gossip-protocol spread animation; an LSM-tree compaction animation; a rate limiter under burst; a CRDT counter merged on two replicas; a back-of-envelope calculator with editable assumptions.

**Visual recipes** (visual-first plans; standard in `harness/rubrics/visuals.md`):

- `ClusterSim` (`replication`) for quorum writes, leader failover and partitions; (`broadcast`) for gossip and eventual consistency; (`load-balance`) for health checks and rerouting.
- A registered end-to-end request-flow `Diagram` for every design case, then focused stage diagrams; a `Video` for the request lifecycle or a consensus commit.
- `CompareView` for consistency and availability trade-offs (strong versus eventual, sync versus async replication) with numbers from the sources.
- `ParamPlayground` for back-of-envelope capacity estimates; `Graph3D` only for large topologies the learner builds.

## Mini project patterns

Each one runs several processes locally with Docker Compose so failure can be shown for real. Guided → independent.

1. **Estimate before building** (guided, 1 h): a worksheet (`starter/` blank, `solution/` filled) for QPS, storage, bandwidth, and machine count of a named product. Proves: sizing drives design. Real use: every design review.
2. **Load balancer with health checks** (guided, 2 h): a tiny reverse proxy over three service instances; kill one, traffic continues. Proves: round robin, health checking, failover. Real use: any multi-instance service.
3. **Consistent hashing ring** (semi-guided, 2 h): implement the ring with virtual nodes; measure key movement against modulo hashing. Proves: why caches and stores use it. Real use: cache clusters.
4. **Leader-follower replication** (semi-guided, 2–3 h): a key-value store with one leader and two followers, async and sync modes, a read-your-writes test. Proves: replication lag and its anomalies. Real use: read replicas.
5. **Quorum key-value store** (independent, 3 h): N=3 nodes with configurable W and R, read repair. Proves: tunable consistency. Real use: Dynamo-style stores.
6. **Rate limiter for a cluster** (independent, 2 h): token bucket shared in Redis across three API instances. Proves: shared state and atomic updates. Real use: API gateways.
7. **Queue with at-least-once delivery** (independent, 2–3 h): producer, broker, two workers, visibility timeout, duplicate handling. Proves: delivery guarantees. Real use: order processing.
8. **Break it on purpose** (independent, 2 h): add latency, drop packets, or kill nodes in an earlier project and write the short incident report. Proves: failure-mode thinking. Real use: game days.

Every README includes a "what to observe" section: the command that breaks something and the output that shows the system coping or failing.

## Repository analysis focus

| What to find | Where it usually lives |
|---|---|
| Components and how they talk | `docs/` architecture pages, design documents (`docs/design`, `rfcs/`, KIPs, `proposals/`), `README` |
| Wire protocol and API | `.proto` files, `api/`, RPC definitions, client libraries |
| Write path and read path | storage engine package, request handlers, write-ahead log code |
| Replication and consensus | `raft/`, `replication/`, `consensus/`, leader election, log and snapshot code |
| Partitioning and rebalancing | `partition`, `shard`, `ring`, `placement`, `balancer` packages |
| Membership and failure detection | gossip, heartbeat, lease code |
| Consistency guarantees | documentation of guarantees, linearizability or Jepsen tests, transaction code |
| Backpressure and overload handling | queues, admission control, rate limiters, circuit breakers, timeouts |
| Storage format | segment, SSTable, page, and compaction code |
| Configuration and tunables | default config files and the documented knobs (replication factor, quorum, timeouts) |
| Testing strategy | failure-injection tests, deterministic simulation, integration clusters in tests, benchmarks |
| Operability | metrics exposed, admin commands, upgrade and migration docs |
| Deployment topology | Helm charts, operators, `docker-compose` examples |

**External services and infrastructure to record as `_tech` notes.** Coordination service (etcd, ZooKeeper), storage engine (RocksDB), RPC framework (gRPC), serialization format (Protocol Buffers), metrics system (Prometheus), object storage, container orchestrator.

**Findings worth ranking high.** Where the implementation differs from the paper (for example Raft optimisations such as batching, pre-vote, or learner nodes), how overload is handled, how upgrades avoid downtime, how the system is tested against partitions.

## Capstone shape

The capstone is a small distributed service plus a written design. It must run on one laptop with Docker Compose and demonstrate at least one failure being survived.

**Production ready means.**

- `ARCHITECTURE.md` written as a design document: requirements, estimates, API, data model, diagram, trade-offs, failure modes
- At least two ADRs (for example "leader-follower over quorum", "at-least-once with idempotent consumers")
- Three or more processes with one clear responsibility each; a compose file that starts them
- A load script and a failure script (kill a node, add latency) with recorded results in the README
- Tests: unit tests for the algorithms, an integration test that starts the cluster and checks a guarantee
- Timeouts, retries with backoff and jitter, and idempotency where messages can repeat
- Structured logs with node id and request id; a metrics endpoint; health checks
- Stated limits: what it does not handle (for example network partitions between regions)

**Recommended structure.**

```
src/
  core/         algorithms as classes: HashRing, TokenBucket, ReplicatedLog
  node/         Node, Peer, Membership, Storage (interfaces + implementations)
  transport/    HttpTransport or RpcTransport behind a Transport interface
  api/          client-facing routes
  config/       Config class
scripts/        load.ts, chaos.ts
tests/          unit/, cluster/
```

**Where OOP and SOLID fit.** Model each role as a class behind an interface (`Storage`, `Transport`, `Clock`) so tests can inject an in-memory transport and a fake clock; that is what makes distributed code testable. Keep the algorithms pure and deterministic inside `core/`. Avoid deep inheritance; a node composes its parts.

**Example capstones.**

- Distributed key-value store with leader-follower replication and failover
- URL shortener sized for a stated load: cache, read replicas, ID generation, rate limiting
- Chat backend: WebSocket gateways, message fan-out through a queue, ordered delivery per room
- Job scheduler: durable queue, worker leases, retries, exactly-once effect through idempotency
- News feed service comparing fan-out on write and on read with measurements

## Recall focus

Worth remembering a year later:

- Decision rules: when to replicate, partition, cache, queue; consistency or availability for a given feature
- Trade-off pairs: latency versus consistency, fan-out on write versus read, sync versus async replication, push versus pull
- Formulas: R + W > N; availability of serial and parallel components; rough latency numbers; QPS and storage estimation steps
- Failure modes: split brain, hot partition, thundering herd, cascading failure, replication lag anomalies
- The one-sentence idea of each defining paper

Question styles: Explain ("why does Raft need a majority?"), Compare ("leader-follower versus leaderless"), Debug ("after adding a cache node, the database load spiked; why?"), Decide ("a bank transfer and a like counter: which consistency for each and why?"). Include estimation cards with small numbers.

## Safety and ethics

- Run everything locally. Do not create cloud resources unless the learner asks; if they do, state the cost and give the teardown command.
- Load and chaos experiments target only the learner's own containers.
- Present company architectures as described in their own papers and posts, with the date; systems change, so do not state them as current fact.
- **Experience recipes** (adaptive plans; `harness/rubrics/experiences.md`, the selector decides): explainer for a request lifecycle or one consensus commit; interactive for quorum, latency and failures (ClusterSim); branching for consistency and availability trade-offs and storage choices; hybrid for consensus or replication end to end.
