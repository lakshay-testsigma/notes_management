# Data Analytics playbook

Guidance for the stage skills. Each `##` heading is read by one skill; keep the eight headings and their order.

## How this domain is learned

**Prerequisite chain.** A topic may assume everything above it.

1. Spreadsheets-level thinking: rows, columns, filters, pivot tables
2. SQL: select, filter, join, group, window functions
3. Descriptive statistics: distributions, centre, spread, percentiles
4. Data wrangling with pandas or SQL: cleaning, reshaping, tidy data
5. Visualization: encodings, chart choice, honest design
6. Inference: sampling, confidence intervals, hypothesis tests
7. Experimentation: A/B tests, power, pitfalls
8. Metrics and product analytics: funnels, retention, cohorts
9. Communication: the narrative, the recommendation, the dashboard
10. Extensions: forecasting, causal inference outside experiments

**Beginner misconceptions to correct early.**

- "Analytics is making charts." It is answering a decision question; the chart is the last step.
- "Correlation shows cause." Confounding, selection, and reverse causation explain most surprising correlations.
- "A p-value below 0.05 means it is true." It is the probability of data this extreme if there were no effect; it says nothing about effect size or importance.
- "The average describes the group." Skewed data needs medians and percentiles; averages hide subgroups (Simpson's paradox).
- "More data fixes bias." A biased sample stays biased at any size.
- "Check the A/B test daily and stop when significant." Peeking inflates false positives.
- "Clean data is given." Most of the work is finding duplicates, missing values, and wrong joins; a join that multiplies rows is the classic silent error.
- "A dashboard is the deliverable." A recommendation someone can act on is the deliverable.
- "More metrics is better." A few well-defined metrics with clear owners beat fifty.

**Choosing depth.**

- `quick`: one technique (window functions, a box plot, confidence interval, a cohort table).
- `standard`: one method or tool (A/B testing, funnel analysis, pandas group-by workflows, chart design, a BI tool).
- `deep`: a pillar (SQL for analysis, statistics for decision making, experimentation, data visualization).

**Cutting a topic into lesson pages.**

1. The decision question that needs it
2. The idea with a tiny dataset the learner can see in full
3. The computation, step by step
4. The picture that shows the result honestly
5. The traps (bias, wrong denominator, peeking, misleading axis)
6. How to state the conclusion and its uncertainty
7. A published real analysis that uses it

## Trusted sources

**Official documentation (tier A candidates).** pandas (pandas.pydata.org), DuckDB (duckdb.org/docs), PostgreSQL manual, SciPy and statsmodels docs, scikit-learn user guide, Matplotlib, seaborn, Plotly, Vega-Altair, Jupyter, dbt (docs.getdbt.com), Apache Superset, Metabase documentation, and the docs of Tableau, Power BI, and Looker when the topic is that tool.

**Reference handbooks and free texts.**

- NIST/SEMATECH e-Handbook of Statistical Methods (itl.nist.gov/div898/handbook)
- *OpenIntro Statistics* (free at openintro.org)
- Mode SQL Tutorial (mode.com/sql-tutorial)
- From Data to Viz (data-to-viz.com) for chart selection; the Financial Times Visual Vocabulary
- Seeing Theory (seeing-theory.brown.edu), a visual introduction to probability and statistics from Brown University
- Khan Academy statistics and probability; StatQuest with Josh Starmer (video explanations)

**Standard books.**

- *Storytelling with Data*, Cole Nussbaumer Knaflic (Wiley, 2015)
- *The Visual Display of Quantitative Information*, Edward R. Tufte (Graphics Press)
- *Fundamentals of Data Visualization*, Claus O. Wilke (O'Reilly, 2019; free online)
- *Python for Data Analysis*, Wes McKinney (O'Reilly, 3rd edition 2022; free online)
- *Practical Statistics for Data Scientists*, Peter Bruce, Andrew Bruce, Peter Gedeck (O'Reilly, 2nd edition 2020)
- *Trustworthy Online Controlled Experiments*, Ron Kohavi, Diane Tang, Ya Xu (Cambridge University Press, 2020)
- *SQL for Data Analysis*, Cathy Tanimura (O'Reilly, 2021)
- *The Data Warehouse Toolkit*, Ralph Kimball and Margy Ross (Wiley, 3rd edition 2013)
- *R for Data Science*, Wickham, Çetinkaya-Rundel, Grolemund (O'Reilly, 2nd edition 2023; free online)
- *Naked Statistics*, Charles Wheelan (W. W. Norton, 2013); *The Art of Statistics*, David Spiegelhalter (2019)
- *How to Lie with Statistics*, Darrell Huff (W. W. Norton, 1954)
- *Lean Analytics*, Alistair Croll and Benjamin Yoskovitz (O'Reilly, 2013)
- *Causal Inference: The Mixtape*, Scott Cunningham (Yale University Press, 2021; free online)
- *Exploratory Data Analysis*, John W. Tukey (Addison-Wesley, 1977)
- *Think Stats*, Allen B. Downey (O'Reilly; free online)

**Defining papers.**

- "Tidy Data", Hadley Wickham, Journal of Statistical Software, 2014
- "A Layered Grammar of Graphics", Hadley Wickham, Journal of Computational and Graphical Statistics, 2010
- "Graphical Perception: Theory, Experimentation, and Application to the Development of Graphical Methods", Cleveland and McGill, Journal of the American Statistical Association, 1984
- "Graphs in Statistical Analysis" (Anscombe's quartet), F. J. Anscombe, The American Statistician, 1973
- "Controlled Experiments on the Web: Survey and Practical Guide", Kohavi, Longbotham, Sommerfield, Henne, Data Mining and Knowledge Discovery, 2009
- "Online Controlled Experiments at Large Scale", Kohavi et al., KDD 2013
- "Improving the Sensitivity of Online Controlled Experiments by Utilizing Pre-Experiment Data" (CUPED), Deng, Xu, Kohavi, Walker, WSDM 2013
- "The ASA Statement on p-Values: Context, Process, and Purpose", Wasserstein and Lazar, The American Statistician, 2016
- "Sex Bias in Graduate Admissions: Data from Berkeley" (Simpson's paradox), Bickel, Hammel, O'Connell, Science, 1975
- "Statistical Modeling: The Two Cultures", Leo Breiman, Statistical Science, 2001
- "The Split-Apply-Combine Strategy for Data Analysis", Hadley Wickham, Journal of Statistical Software, 2011

**Engineering and data blogs.** Netflix Tech Blog (experimentation series); Airbnb Engineering and Data Science; Spotify Engineering (experimentation platform); Microsoft Experimentation Platform articles; Uber Engineering; Booking.com data science posts; dbt Labs Developer Blog; Evan Miller ("How Not To Run an A/B Test" and the sample size calculator); Our World in Data (method notes and chart practice); The Pudding and FlowingData for visual storytelling; the GitLab Data Team handbook; Amplitude's North Star Playbook.

**Organizations whose repositories count as production grade.** NumFOCUS-sponsored projects (pandas, NumPy, SciPy, Matplotlib, Jupyter), the Apache Software Foundation (Superset), Metabase, dbt Labs, DuckDB, Our World in Data, PostHog, and data teams that publish their real analytics code.

**Flagship repositories for repo-intel.** This stage is optional here: skip it with `tutor skip <topic> repo-intel --reason "method topic, no code repository teaches it"` when the topic is a statistical method or a communication skill, and put a published analysis into the digest stage instead.

- Real analytics projects: `dbt-labs/jaffle-shop` (dbt Labs' official small example; low star count and no detected license, so it qualifies only under the rubric's official-sample rule, and the license must be checked before quoting); GitLab's `gitlab-data/analytics` (on gitlab.com; metric definitions and models of a real company)
- Open data pipelines and charts: `owid/etl` and `owid/owid-grapher` (how Our World in Data builds and documents every dataset; small star counts, trusted through the organization)
- Product analytics and experimentation: `PostHog/posthog`, `growthbook/growthbook` (the statistics engine is readable)
- BI tools: `apache/superset`, `metabase/metabase`, `evidence-dev/evidence`, `lightdash/lightdash`
- Libraries (slice one feature such as group-by): `pandas-dev/pandas`, `duckdb/duckdb`, `statsmodels/statsmodels`, `mwaskom/seaborn`, `vega/altair`
- Practice datasets: `rfordatascience/tidytuesday`

**Trusted public data.** Government and institutional portals (data.gov, Eurostat, World Bank Open Data, OECD, national statistics offices), Our World in Data, Kaggle datasets with a stated license and source, Google BigQuery public datasets, the UCI Machine Learning Repository.

**Avoid.** "Top 10 Python libraries" listicles; Medium and Towards Data Science tutorials as primary sources; dashboards-as-portfolio videos with no question behind them; statistics explanations that define the p-value as "the probability the result is due to chance"; vendor content that redefines standard metrics; Kaggle notebooks with high votes but no validation; datasets with no source, date, or license; infographics with no data link.

## Lesson recipes

| Kind of concept | Component | Concrete example |
|---|---|---|
| Distributions and uncertainty | `ParamPlayground` | Sliders for sample size and effect size redraw two sampling distributions and the confidence interval; the learner sees overlap shrink |
| Experiment design | `ParamPlayground` | Baseline rate, minimum detectable effect, and power give required sample size and test duration |
| Chart choice and encoding | `Chart` | The same dataset as pie, bar, and dot plot; a truncated axis next to a zero-based axis; Anscombe's quartet |
| Analysis workflow | `FlowAnimation` | Question → data → clean → explore → model → communicate; rows flow through a join and visibly multiply when the key is not unique |
| Funnels and cohorts | `FlowAnimation` | Users drop out step by step through signup → activation → purchase; learner changes one step's rate |
| SQL and pandas steps | `CodeWalkthrough` | A window function evaluated row by row; a group-by shown as split, apply, combine; a cohort retention query |
| Relationships between variables | `VectorSpace3D` | A 3D scatter of three metrics where a confounder separates two groups; rotate to see Simpson's paradox appear and disappear |
| Metric trees and data models | `Graph3D` | A North Star metric broken into input metrics; a table relationship graph showing which joins are safe |
| Processes with states | `StateMachine` | User lifecycle: new → active → dormant → resurrected → churned |
| Analytics architecture | `SystemDiagram` | Event tracking → warehouse → transformation → semantic layer → BI tool |
| History | `Timeline` | An experiment timeline with the peeking points marked; a metric with launches annotated |
| Static structure | `Mermaid` | A decision tree for choosing a statistical test or a chart type |

**Activities.**

- `PredictReveal`: "Group A converts 10 of 100, group B 14 of 100. Significant at 5 percent?" "This join has duplicate keys on the right: how many rows come back?"
- `OrderSteps`: order the steps of an A/B test from hypothesis to decision; order an analysis workflow
- `MatchPairs`: question type to chart type; data problem to cleaning step; bias name to example
- `Quiz`: spot the flaw in a described analysis; pick the right denominator for a rate

**3D versus 2D.** Prefer 2D. Charts for communication should almost never be 3D: 3D bars and pies distort values, and the lessons should say so. `VectorSpace3D` is justified for one thing: showing three variables at once so that a hidden grouping or confounder becomes visible when rotated. `Graph3D` helps for metric trees and large table-relationship graphs.

**Custom simulation ideas.** A coin-flip sampling simulator that builds a sampling distribution live; a peeking simulator that runs 1,000 A/A tests and counts false positives when stopped early; a "make this chart honest" editor (fix axis, order, colour); a join explorer that shows the result rows for each join type on two tiny tables; a regression-to-the-mean demo; a Simpson's paradox toggle that splits and merges groups.

**Visual recipes** (visual-first plans; standard in `harness/rubrics/visuals.md`):

- `Chart` and `ParamPlayground` for distributions, sample size, confidence intervals and effect size; never 3D charts.
- `CompareView` for an honest versus a misleading chart, or two metric definitions.
- `SortBuckets` for classifying metrics, biases or chart types; `AlgorithmStepper` for a join or a group-by on a tiny table.
- A registered end-to-end analysis-workflow `Diagram` (question, data, cleaning, analysis, decision) for process topics.

## Mini project patterns

Mini projects are analyses. `starter/` holds the dataset (or a download script), a notebook or SQL file with questions and TODOs; `solution/` holds the completed analysis and a `check.py` that asserts the key numbers. Guided → independent.

1. **Answer five business questions with SQL** (guided, 1–2 h): a shop dataset in DuckDB; revenue by month, top customers, repeat rate. Proves: joins, aggregation, window functions. Real use: daily analyst requests.
2. **Clean a messy dataset** (guided, 2 h): duplicates, missing values, mixed date formats, wrong types; document every decision. Proves: data wrangling and auditability. Real use: every real dataset.
3. **Exploratory analysis with a one-page finding** (semi-guided, 2 h): explore a public dataset and write three findings with one chart each. Proves: from exploration to statement. Real use: stakeholder updates.
4. **Analyse an A/B test** (semi-guided, 2 h): given experiment data, check sample-ratio mismatch, compute the effect and interval, and write the ship or no-ship recommendation. Proves: inference for decisions. Real use: product launches.
5. **Funnel and cohort retention** (semi-guided, 2–3 h): build a funnel and a retention table from event data and find the weakest step. Proves: product analytics. Real use: growth work.
6. **Redesign a bad chart** (independent, 1–2 h): take a misleading published-style chart and rebuild it honestly with a short justification. Proves: visual encoding and ethics. Real use: reports and decks.
7. **Define a metric** (independent, 2 h): write a precise metric definition (numerator, denominator, grain, exclusions), implement it in SQL, and test edge cases. Proves: metric design. Real use: company dashboards.
8. **Small dashboard that answers one question** (independent, 2–3 h): three charts and a headline number in a notebook, Evidence, or Metabase. Proves: dashboard design. Real use: self-serve reporting.

## Repository analysis focus

When the stage runs, look for how a real team makes numbers trustworthy.

| What to find | Where it usually lives |
|---|---|
| Metric definitions | `metrics/`, semantic-layer YAML, model documentation, handbook pages |
| Data models and grain | `models/` SQL, `schema.yml`, entity documentation |
| Statistical methods | statistics engine or `stats/` package, test selection, variance reduction, sequential testing |
| Query generation and semantics | query builders, semantic-layer code, how filters and joins are made safe |
| Data validation | tests on models, expectations, reconciliation queries |
| Chart defaults and visual rules | chart configuration, colour scales, axis rules, style guides |
| Reproducibility | notebooks versus scripts, pinned environments, seeds, data snapshots |
| Documentation of sources | dataset metadata, provenance fields, method notes |
| Performance | caching of query results, pre-aggregation, sampling |
| Access control and privacy | row-level permissions, anonymisation, aggregation thresholds |
| Testing | tests of statistical code against known results, fixtures |
| CI | checks that models build and tests pass before merge |

**External services to record as `_tech` notes.** Warehouse or database, transformation tool, BI or notebook tool, event-tracking tool, experimentation platform, charting libraries, hosting.

**Findings worth ranking high.** How one metric is defined once and reused, how the statistics engine guards against peeking and sample-ratio mismatch, how every published number traces back to a source.

## Capstone shape

The capstone is an analysis report backed by reproducible code. It still has `src/`, `tests/`, `ARCHITECTURE.md`, and an ADR, because the gate requires them and because analysis code deserves them.

**Production ready means.**

- A stated decision question, audience, and recommendation on the first screen of the README
- One command rebuilds every number and chart from raw data
- Raw data is never edited; cleaning is code with documented decisions
- Metric definitions written down (numerator, denominator, grain, exclusions)
- Uncertainty reported (intervals, sample sizes) and limits stated
- Tests: data checks (row counts, uniqueness, ranges) and unit tests for metric functions with tiny hand-computed fixtures
- Charts follow the lesson rules: labelled axes, honest scales, one message per chart
- `ARCHITECTURE.md` shows the data flow from raw files to report; ADRs record method choices (which test, which exclusion rule)
- A short report (`report.md` or a notebook exported to HTML) readable by a non-analyst

**Recommended structure.**

```
data/raw/        untouched inputs (or a download script)
src/
  load.py        read raw data
  clean.py       cleaning functions, each documented
  metrics.py     metric functions (pure)
  stats.py       tests and intervals
  charts.py      chart functions with shared style
  build_report.py  runs everything, writes report/
sql/             queries, one per question
report/          report.md, figures/
tests/           test_clean.py, test_metrics.py, data checks
```

**Where OOP and SOLID fit.** Lightly. Analysis is a pipeline of pure functions over data frames; keep it that way (single responsibility per function, no hidden state, no notebooks as the source of truth). A class is useful for a `Metric` definition (name, SQL, grain) or a `Dataset` with validation; do not build class hierarchies around data frames.

**Example capstones.**

- Subscription churn analysis: who leaves, when, and one recommended intervention with expected impact
- A/B test readout for a checkout change, with guardrail metrics and a ship decision
- City mobility report from public bike or taxi data: demand patterns and a station recommendation
- Personal spending analysis: categorised transactions, trends, and a savings plan
- Marketing channel analysis: cost per acquisition by channel with caveats about attribution

## Recall focus

Worth remembering a year later:

- Decision rules: which chart for which question; which test for which data; median or mean; when an experiment is needed
- Definitions stated correctly: p-value, confidence interval, power, statistical versus practical significance
- Traps: Simpson's paradox, survivorship bias, selection bias, peeking, sample-ratio mismatch, join fan-out, regression to the mean
- The analysis workflow and the structure of a recommendation
- SQL patterns: window functions, cohort tables, deduplication, safe rate calculation

Question styles: Explain ("why does peeking inflate false positives?"), Compare ("mean versus median for income data"), Debug ("revenue doubled after adding a join; what happened and how do you confirm?"), Decide ("the result is significant but the lift is 0.1 percent: ship or not, and why?"). Add small "read this chart" and "compute by hand" cards.

## Safety and ethics

- Use public, licensed, or synthetic data. Never put personal data in notebooks, charts, or reports; aggregate so that no individual is identifiable.
- Honest reporting: state sample size, period, exclusions, and uncertainty; show results that weaken the conclusion; never call a correlation a cause.
- No misleading visuals: no truncated bar axes, cherry-picked date ranges, or dual axes chosen to suggest a relationship.
- Decide the metric and the test before looking at the outcome; do not search subgroups until something is significant.
- Analyses about groups of people need care with fairness and wording; describe populations, do not judge them.
- **Experience recipes** (adaptive plans; `harness/rubrics/experiences.md`, the selector decides): explainer for a metric pipeline; interactive for sample size against confidence; branching for choosing a test or a chart for a question; hybrid only for a full experiment design.
