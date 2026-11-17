# Data Engineering playbook

Guidance for the stage skills. Each `##` heading is read by one skill; keep the eight headings and their order.

## How this domain is learned

**Prerequisite chain.** A topic may assume everything above it.

1. SQL (joins, aggregation, window functions) and Python
2. How databases store data: rows versus columns, indexes, transactions; OLTP versus OLAP
3. Data modeling: normalisation, dimensional modeling (facts and dimensions)
4. Batch pipelines: extract, load, transform; idempotency; incremental loads
5. File and table formats: CSV, JSON, Parquet; Iceberg and Delta Lake
6. Orchestration: DAGs, scheduling, retries, backfills
7. Distributed batch processing: partitioning, shuffles, Spark
8. Streaming: logs, topics, consumer groups, windows, watermarks
9. Data quality, testing, contracts, lineage, governance
10. Platform choices: warehouse, lake, lakehouse; cost

**Beginner misconceptions to correct early.**

- "A pipeline is a script that moves data." A pipeline must be re-runnable: the same run twice gives the same result (idempotent) and a failed run can be resumed.
- "Big data tools first." Most datasets fit on one machine; DuckDB or PostgreSQL is the right starting tool, Spark when data outgrows it.
- "ETL and ELT are the same." Where the transform happens decides tooling, cost, and who owns the logic.
- "Streaming is faster batch." Streaming adds event time, late data, ordering, and state; choose it only when freshness needs it.
- "Exactly-once is a setting." It is an end-to-end property that needs idempotent or transactional sinks.
- "The schema is fixed." Sources change; schema evolution and contracts are part of the design.
- "If the job is green the data is right." Jobs succeed on wrong data; tests on the data itself are required.
- "Partition by everything." Too many small files and skewed partitions are the common performance failures.
- "The data lake is a place to dump files." Without table formats, catalogs, and ownership it becomes unusable.

**Choosing depth.**

- `quick`: one mechanism (Parquet row groups, a slowly changing dimension type, watermark, `MERGE`).
- `standard`: one tool or pattern (Airflow DAGs, dbt models, CDC with Debezium, incremental loads, star schema).
- `deep`: a pillar (Spark, Kafka for data pipelines, dimensional modeling, the lakehouse and table formats, stream processing).

**Cutting a topic into lesson pages.**

1. The business question or failure that needs it
2. The data's journey in one picture (source to consumer)
3. The core model: the table, the log, the DAG, or the file layout
4. A run step by step, with a tiny dataset the learner can read
5. What breaks: late data, duplicates, schema change, reruns, skew
6. How correctness is checked (tests, reconciliation)
7. Scale and cost, and how a production project does it

## Trusted sources

**Official documentation (tier A candidates).**

- Apache projects: Spark (spark.apache.org), Airflow (airflow.apache.org), Kafka (kafka.apache.org), Flink (flink.apache.org), Iceberg (iceberg.apache.org), Parquet (parquet.apache.org), Arrow (arrow.apache.org), Beam (beam.apache.org)
- dbt (docs.getdbt.com), including the "How we structure our dbt projects" best-practice guide
- DuckDB (duckdb.org/docs), PostgreSQL manual (postgresql.org/docs), ClickHouse docs, Trino (trino.io)
- Delta Lake (delta.io), Dagster (docs.dagster.io), Prefect, Debezium (debezium.io), Polars (docs.pola.rs)
- Great Expectations (greatexpectations.io), OpenLineage (openlineage.io)
- Warehouse vendor docs: Snowflake, Google BigQuery, Databricks, Amazon Redshift
- Kimball Group dimensional modeling techniques (kimballgroup.com)

**Standard books.**

- *Designing Data-Intensive Applications*, Martin Kleppmann (O'Reilly, 2017; second edition with Chris Riccomini, 2026)
- *Fundamentals of Data Engineering*, Joe Reis and Matt Housley (O'Reilly, 2022)
- *The Data Warehouse Toolkit*, Ralph Kimball and Margy Ross (Wiley, 3rd edition 2013)
- *Streaming Systems*, Tyler Akidau, Slava Chernyak, Reuven Lax (O'Reilly, 2018)
- *Kafka: The Definitive Guide*, Shapira, Palino, Sivaram, Petty (O'Reilly, 2nd edition 2021)
- *Spark: The Definitive Guide*, Bill Chambers and Matei Zaharia (O'Reilly, 2018); *Learning Spark*, Damji, Wenig, Das, Lee (O'Reilly, 2nd edition 2020)
- *Data Pipelines Pocket Reference*, James Densmore (O'Reilly, 2021)
- *Data Pipelines with Apache Airflow*, Bas Harenslak and Julian de Ruiter (Manning)
- *I Heart Logs*, Jay Kreps (O'Reilly, 2014)
- *Data Mesh*, Zhamak Dehghani (O'Reilly, 2022)
- *Database Internals*, Alex Petrov (O'Reilly, 2019)

**Defining papers and essays.**

- "A Relational Model of Data for Large Shared Data Banks", E. F. Codd, Communications of the ACM, 1970
- "The Google File System", Ghemawat, Gobioff, Leung, SOSP 2003
- "MapReduce: Simplified Data Processing on Large Clusters", Dean and Ghemawat, OSDI 2004
- "Bigtable: A Distributed Storage System for Structured Data", Chang et al., OSDI 2006
- "Dremel: Interactive Analysis of Web-Scale Datasets", Melnik et al., VLDB 2010
- "Resilient Distributed Datasets: A Fault-Tolerant Abstraction for In-Memory Cluster Computing", Zaharia et al., NSDI 2012
- "Spark SQL: Relational Data Processing in Spark", Armbrust et al., SIGMOD 2015
- "Kafka: a Distributed Messaging System for Log Processing", Kreps, Narkhede, Rao, NetDB 2011
- "The Dataflow Model", Akidau et al., VLDB 2015
- "C-Store: A Column-oriented DBMS", Stonebraker et al., VLDB 2005
- "The Snowflake Elastic Data Warehouse", Dageville et al., SIGMOD 2016
- "Delta Lake: High-Performance ACID Table Storage over Cloud Object Stores", Armbrust et al., VLDB 2020
- "Lakehouse: A New Generation of Open Platforms that Unify Data Warehousing and Advanced Analytics", Armbrust, Ghodsi, Xin, Zaharia, CIDR 2021
- "The Log-Structured Merge-Tree (LSM-Tree)", O'Neil et al., Acta Informatica, 1996
- "DuckDB: an Embeddable Analytical Database", Raasveldt and Mühleisen, SIGMOD 2019
- "The Log: What every software engineer should know about real-time data's unifying abstraction", Jay Kreps, LinkedIn Engineering, 2013
- "Streaming 101" and "Streaming 102", Tyler Akidau, O'Reilly, 2015–2016
- "Functional Data Engineering: a modern paradigm for batch data processing", Maxime Beauchemin, 2018
- "How to Move Beyond a Monolithic Data Lake to a Distributed Data Mesh", Zhamak Dehghani, martinfowler.com, 2019

**Engineering blogs.** Netflix Tech Blog; Uber Engineering; Airbnb Engineering (where Airflow began); LinkedIn Engineering (where Kafka began); Spotify Engineering; Meta Engineering; Stripe; Shopify; Confluent blog; Databricks blog; Snowflake engineering blog; dbt Labs Developer Blog; DuckDB blog; Cloudflare blog.

**Courses.** DataTalks.Club Data Engineering Zoomcamp (`DataTalksClub/data-engineering-zoomcamp`, free and widely used); CMU 15-445 Database Systems lectures (Andy Pavlo) for storage and query execution.

**Organizations whose repositories count as production grade.** The Apache Software Foundation, the Linux Foundation (Delta Lake, OpenLineage), dbt Labs, DuckDB Labs and the DuckDB Foundation, Dagster Labs, Confluent, Databricks, and data teams that publish their real project.

**Flagship repositories for repo-intel.**

- Real analytics projects (best first targets): `dbt-labs/jaffle-shop` (dbt Labs' official small example project; low star count and no detected license, so it qualifies only under the rubric's official-sample rule, and the license must be checked before quoting) and GitLab's public data team project (`gitlab-data/analytics` on gitlab.com, a full production dbt and Airflow setup; verify access on GitLab, not with `gh`)
- Orchestrators: `apache/airflow`, `dagster-io/dagster`, `PrefectHQ/prefect`
- Engines (slice one path such as "how a query is planned"): `apache/spark`, `duckdb/duckdb`, `trinodb/trino`, `apache/flink`, `apache/datafusion`, `pola-rs/polars`
- Streaming and CDC: `apache/kafka`, `debezium/debezium`
- Formats: `apache/iceberg`, `delta-io/delta`, `apache/arrow`
- Transformation and quality: `dbt-labs/dbt` (formerly `dbt-labs/dbt-core`), `fivetran/great_expectations` (formerly under the `great-expectations` organization), `sqlfluff/sqlfluff`
- Ingestion and metadata: `dlt-hub/dlt`, `meltano/meltano`, `OpenLineage/OpenLineage`, `datahub-project/datahub`

**Where adopters are listed (checked 2026-11-14).** `apache/airflow` names its users in `INTHEWILD.md` and `datahub-project/datahub` in `ADOPTERS.md`, both at the repository root. Fetch `https://raw.githubusercontent.com/<org>/<repo>/HEAD/<file>` and record that URL as the evidence for `used_by`. For the other repositories an adopters file at the root was not found or not checked: look on the project's own site or its foundation's project page. Verify again on the day you use it.

**Avoid.** Vendor comparison posts where the vendor wins; "modern data stack" opinion threads; Medium tutorials; Hadoop and MapReduce-era how-tos presented as current practice (teach them as history); tutorials that load data with `SELECT *` and no incremental logic; benchmarks without published methodology; abandoned Airflow plugins and providers; courses built around a single paid platform's certification.

## Lesson recipes

| Kind of concept | Component | Concrete example |
|---|---|---|
| Pipelines end to end | `FlowAnimation` | Records flow source → ingest → raw → staged → mart → dashboard; learner injects a duplicate and a null and sees where each is caught |
| Streaming and logs | `FlowAnimation` | Events enter a partitioned topic, two consumer groups read at their own offsets; a late event arrives after the watermark |
| Batch execution | `FlowAnimation` | A Spark job: partitions are mapped, shuffled by key, and reduced; one skewed key makes one task slow |
| DAGs and lineage | `Graph3D` | A dbt lineage graph or an Airflow DAG; click a node to highlight everything downstream; `editable` so the learner adds a model and its dependencies |
| Schemas | `Graph3D` | A star schema with the fact table in the centre and dimensions around it; a snowflake variant for comparison |
| Task and run lifecycles | `StateMachine` | Airflow task: scheduled → queued → running → success, failed → up for retry; a CDC connector: snapshot → streaming |
| Platform architecture | `SystemDiagram` | Sources, ingestion, object storage, table format, query engine, transformation, BI |
| Ordered interactions | `SequenceDiagram` | A two-phase commit sink for exactly-once; a `MERGE` upsert for an incremental model |
| Tunables | `ParamPlayground` | Window size and allowed lateness against which events are counted; number of partitions against task time; file size against query time |
| SQL and pipeline code | `CodeWalkthrough` | An incremental dbt model line by line; an idempotent load with `MERGE`; a window function |
| Measurements | `Chart` | Row-store versus column-store scan time; Parquet versus CSV size; cost by query |
| Evolution | `Timeline` | Warehouse → Hadoop → cloud warehouse → lakehouse |
| Static structure | `Mermaid` | Entity-relationship diagram, medallion layers, folder layout of a partitioned table |

**Activities.**

- `PredictReveal`: "The job is re-run for yesterday with `INSERT`. How many rows are in the table now?" "An event with event time 10:02 arrives at 10:20 with a 10-minute watermark: is it counted?"
- `OrderSteps`: order an incremental load, a backfill, a CDC snapshot-then-stream start
- `MatchPairs`: slowly-changing-dimension type to behaviour; file format to property; delivery guarantee to outcome
- `Quiz`: batch or streaming for a stated freshness need; choose the grain of a fact table

**3D versus 2D.** Use `Graph3D` for lineage graphs and DAGs above about 12 nodes and for star and snowflake schemas, where depth separates layers (raw, staged, mart). Use `FlowAnimation` for records moving through stages and for streaming. When the lesson is about the rows themselves (a join, a deduplication, a slowly changing dimension), show a tiny table before and after with `CodeWalkthrough`; do not draw rows in 3D.

**Custom simulation ideas.** A window-and-watermark simulator with draggable events on a timeline; a row-versus-column storage reader that shows which bytes a query touches; a shuffle visualiser with adjustable key skew; an idempotency tester that re-runs a load and compares row counts; a slowly-changing-dimension stepper; a partition-pruning demo over a folder tree.

**Visual recipes** (visual-first plans; standard in `harness/rubrics/visuals.md`):

- A registered end-to-end data-flow `Diagram` (sources, ingestion, storage, transformation, serving) for every pipeline topic.
- `AlgorithmStepper` for joins, shuffles, deduplication and slowly changing dimensions on small tables.
- `FlowAnimation` with `breakable` for streaming and late events; `Video` for a record moving through a pipeline with watermarks.
- `CompareView` for row versus column storage, batch versus streaming, with measured numbers from the sources.

## Mini project patterns

Use public datasets (for example NYC taxi trips, GitHub Archive samples, open government data) or generated data. Guided → independent.

1. **Model a business in a star schema** (guided, 1–2 h): design fact and dimension tables for a small shop dataset and answer five questions with SQL in DuckDB. Proves: grain, facts, dimensions. Real use: every reporting layer.
2. **Idempotent batch load** (guided, 2 h): load daily CSV files into a table so that re-running any day changes nothing. Proves: incremental and idempotent loads. Real use: nightly ingestion.
3. **ELT with dbt** (semi-guided, 2–3 h): raw tables to staging to marts with tests and documentation on DuckDB. Proves: layered transformation and data tests. Real use: analytics engineering.
4. **Orchestrate it** (semi-guided, 2–3 h): an Airflow or Dagster DAG that extracts from an API, loads, transforms, and validates, with retries and a backfill. Proves: scheduling and recovery. Real use: production pipelines.
5. **Data quality gate** (semi-guided, 2 h): add schema, uniqueness, freshness, and row-count checks that stop the pipeline on bad data. Proves: testing data, not just code. Real use: trusted dashboards.
6. **Change data capture** (independent, 3 h): stream changes from PostgreSQL through Debezium and Kafka into an analytics table; show an update and a delete arriving. Proves: log-based replication. Real use: keeping a warehouse in sync.
7. **Streaming aggregation** (independent, 3 h): tumbling-window counts over an event stream with late-event handling. Proves: event time and watermarks. Real use: real-time metrics.
8. **Make it faster and cheaper** (independent, 2 h): convert CSV to partitioned Parquet, measure scan time and size, and tune file layout. Proves: columnar storage and pruning. Real use: cost control.

Tests compare row counts and checksums between source and target and re-run the pipeline twice to prove idempotency.

## Repository analysis focus

| What to find | Where it usually lives |
|---|---|
| Pipeline definitions | `dags/`, `pipelines/`, `jobs/`, `assets/`, `flows/` |
| Transformation layers | `models/staging`, `models/intermediate`, `models/marts`, `dbt_project.yml` |
| Data models and grain | model SQL, `schema.yml`, entity-relationship docs |
| Incremental and backfill logic | incremental materialisations, partition parameters, `MERGE` statements, backfill scripts |
| Idempotency and reruns | overwrite-by-partition code, deduplication keys, checkpoints |
| Schema management | migration tools, schema registry subjects, contracts, evolution rules |
| Data quality | tests in `schema.yml`, `tests/`, expectation suites, anomaly checks, freshness checks |
| Orchestration settings | schedules, retries, SLAs, sensors, pools, concurrency limits |
| Storage layout | partitioning and clustering keys, file formats, compaction jobs, retention |
| Performance techniques | predicate pushdown, broadcast joins, caching, partition sizing, vectorisation |
| Configuration and environments | profiles, targets (dev, prod), connection handling, secrets |
| Lineage and documentation | exposures, docs generation, catalog integration |
| Testing of code | unit tests with small fixtures, integration tests with containers, CI that builds a slim environment |
| Access and privacy | masking, role grants, PII tags |
| CI and deployment | `.github/workflows/*`, slim CI, blue-green schema swaps |

**External services to record as `_tech` notes.** Warehouses and query engines, object storage, brokers, schema registries, orchestrators, ingestion tools, catalogs, BI tools, monitoring and alerting.

**Findings worth ranking high.** How reruns are made safe, how late and duplicate data is handled, how schema changes roll out, how the project keeps CI cheap, naming and layering conventions that let a newcomer find a model.

## Capstone shape

**Production ready means.**

- Idempotent and incremental: any run can be repeated or backfilled without duplicates
- Layered data (raw, staged, marts) with documented grain and keys
- Data tests (unique, not null, relationships, freshness, row-count reconciliation) that fail the run
- Orchestrated with retries, alerts on failure, and a documented backfill command
- Schema changes handled deliberately; a contract for the main source
- Configuration per environment; secrets outside the repository
- Unit tests for transformation functions with tiny fixtures; an end-to-end test on sample data
- Logging of row counts in and out of every step; a run summary
- One command to run locally (DuckDB or Docker); `ARCHITECTURE.md` with the lineage diagram; ADRs (batch or streaming, table format, modeling choice)

**Recommended structure.**

```
src/
  extract/      Extractor classes per source behind a Source interface
  load/         Loader classes behind a Sink interface
  transform/    pure functions and SQL models (or a dbt project in transform/)
  quality/      Check classes, a QualityGate
  orchestration/  DAG or asset definitions
  config.py     Settings class
data/           sample inputs (small, public)
tests/          unit/, integration/, data/
```

**Where OOP and SOLID fit.** Use classes at the edges: sources, sinks, and checks behind small interfaces so a new source is a new class (open/closed, dependency inversion). Keep transformations as pure functions or SQL models: data in, data out, no hidden state. That functional style is what makes pipelines testable and re-runnable; do not model rows as rich objects or hide transformations in inheritance.

**Example capstones.**

- City bike or taxi analytics pipeline: daily ingest, star schema, quality gate, a dashboard-ready mart
- GitHub activity pipeline: API extraction, incremental loads, contributor metrics
- E-commerce CDC pipeline: PostgreSQL changes through Kafka to an analytics store with near-real-time order metrics
- Personal finance warehouse: bank CSV exports normalised, categorised, and reconciled
- Weather and energy data lakehouse: partitioned Parquet with an Iceberg or Delta table and time-travel queries

## Recall focus

Worth remembering a year later:

- Decision rules: batch or streaming; ETL or ELT; warehouse, lake, or lakehouse; when Spark is needed; which slowly-changing-dimension type
- Properties: idempotency, grain, event time versus processing time, delivery guarantees
- Failure modes: duplicates on rerun, late data, schema drift, data skew, small files, silent wrong data
- Trade-offs: freshness versus cost and complexity, normalised versus denormalised, row versus column storage
- SQL patterns that recur: window functions, `MERGE`, deduplication with `ROW_NUMBER`

Question styles: Explain ("why does columnar storage make aggregations faster?"), Compare ("tumbling versus sliding window"), Debug ("row counts doubled after a retry; what is missing?"), Decide ("the dashboard may be 24 hours stale: batch or streaming, and why?"). Include short SQL cards that ask for the query shape, not the full query.

## Safety and ethics

- Public or synthetic data only. Never copy production or personal data into a project.
- When a dataset has personal fields, mask or drop them at ingestion and document it; respect dataset licenses and terms.
- Credentials for warehouses and brokers live in environment variables; profiles with secrets are git-ignored.
- Paid cloud warehouses only on request, with a cost note and query limits; local engines by default.
- Scrape only sources that allow it, at a polite rate.
- **Experience recipes** (adaptive plans; `harness/rubrics/experiences.md`, the selector decides): explainer for a batch run; interactive for partitioning and skew; branching for batch vs streaming vs lambda/kappa; hybrid for exactly-once delivery across failures.
