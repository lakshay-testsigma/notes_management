# General playbook (adaptive fallback)

Guidance for the stage skills. Each `##` heading is read by one skill; keep the eight headings and their order.

This pack is used for any topic that is not software engineering: mathematics, science, business, marketing, finance, product, writing, and anything else. The pipeline and the file layout stay exactly the same; this playbook says what each stage *means* for a non-code topic.

## How this domain is learned

**First, check the classification.** If the topic is really about building software, data, models, or systems, use the matching engineering domain instead. Use `general` only when the main skill is reasoning, deciding, calculating, or communicating.

**Classify the topic into one of four shapes.** The shape decides lessons, projects, and the capstone.

| Shape | Examples | Learned by |
|---|---|---|
| Formal | linear algebra, probability, proofs, physics, accounting rules | definitions → worked examples → practice problems → proofs or derivations |
| Framework | positioning, competitive strategy, prioritisation, unit economics | the problem it answers → the framework → applying it to real cases → knowing its limits |
| Skill | writing, negotiation, interviewing, presenting | model examples → rules of thumb → deliberate practice with feedback → self-review checklist |
| Descriptive | history of computing, how a market works, cognitive biases | the story or mechanism → evidence → competing explanations → implications |

**How each stage adapts.**

| Stage | In an engineering domain | In `general` |
|---|---|---|
| brief | what it is, why it exists | the same, plus who uses it and what decision or problem it serves |
| digest | paper or doc summary | summary of a primary source: the original paper, a textbook chapter, a filing, a standard, or a case-study teardown (see below) |
| repo-intel | deep dive into a repository | switched off in `pack.json`. Its job is done by a **case-study teardown** written as a digest unit |
| lesson | interactive pages | the same components, used for ideas instead of systems |
| mini-projects | small programs | small experiments, worksheets, problem sets, or drafts, with `starter/` and `solution/` |
| capstone | production-style project | a complete professional deliverable: campaign plan, financial model, strategy memo, worked proof set, research report |
| notes and recall | summary and cards | the same; cards favour definitions used correctly, decision rules, and worked mini-problems |

**Prerequisite chain.** There is no fixed chain. During intake, write the chain for this topic by asking: what vocabulary is needed, what arithmetic or math, what earlier idea this one answers or extends. Keep it to at most five prerequisites with a one-line bridge each.

**Beginner misconceptions to correct early.**

- "A framework gives the answer." Frameworks organise thinking; the inputs and judgment are the work.
- "A famous example proves the rule." Survivorship bias: look for the failures that used the same approach.
- "Math is memorising formulas." Understanding where a formula comes from makes it usable; practice problems are the learning, not the reading.
- "Business books are evidence." Many are opinion with anecdotes; separate measured findings from stories.
- "One school of thought is the field." In economics, marketing, psychology, and nutrition, name the competing views.
- "Reading equals knowing." Without producing something (a solved problem, a plan, a draft), nothing is retained.

**Choosing depth.**

- `quick`: one concept, formula, or framework (the time value of money, a 2x2 matrix, the chain rule, a writing rule).
- `standard`: a method with applications (positioning, a discounted cash-flow valuation, hypothesis testing by hand, a negotiation approach).
- `deep`: a pillar subject area the learner will keep using (linear algebra, corporate finance basics, marketing strategy, clear writing).

**Cutting a topic into lesson pages.**

1. The question or problem this idea answers
2. The idea in plain words with one picture
3. A worked example with real numbers or a real case
4. A second example where it works differently or fails
5. How to apply it step by step
6. Limits, criticism, and common misuse
7. A real-world case from start to finish

## Trusted sources

In an unfamiliar field there is no prepared list, so the research stage must find the field's own canon. Use this procedure, in order.

**Procedure for finding trusted sources in any field.**

1. **Find the standard textbook.** Look at the reading lists of two or three leading universities for the introductory course (MIT OpenCourseWare, Stanford, Harvard, Oxford, Cambridge course pages; Open Syllabus for the most-assigned texts). A book that appears on several lists is the standard text.
2. **Find the primary sources.** The original paper or book that introduced the idea; the law, standard, or filing itself; the dataset from the body that collects it.
3. **Find the field's institutions.** The professional body, the standards body, the regulator, the leading journals, the main prize. Their publications define what the field accepts.
4. **Find the recognised practitioners.** People whose work is cited by the textbook and the institutions, not people with the largest audience.
5. **Check for consensus and dispute.** A review article, a meta-analysis, or a textbook chapter says what is settled; record the main disagreement if one exists.
6. **Verify each item live** against `harness/rubrics/source-quality.md` and drop anything that cannot be verified.

**Source types, strongest first.** Primary sources and official data; standard university textbooks from academic publishers; peer-reviewed review articles and meta-analyses; publications of recognised institutions; lectures from leading universities; long-form work by recognised practitioners; high-quality journalism with named sources (tier B at most).

**Named anchors by field** (starting points a specialist would recognise; still verify each one).

- **Mathematics.** MIT OpenCourseWare (for example Gilbert Strang's 18.06 Linear Algebra); Khan Academy; 3Blue1Brown; Paul's Online Math Notes (Lamar University); OpenStax textbooks; *Introduction to Linear Algebra*, Gilbert Strang (Wellesley-Cambridge Press); *Calculus*, Michael Spivak; *How to Solve It*, George Pólya (Princeton University Press, 1945); *How to Prove It*, Daniel Velleman (Cambridge University Press); *Book of Proof*, Richard Hammack (free); *Introduction to Probability*, Joseph Blitzstein and Jessica Hwang (CRC Press; Harvard Stat 110); *Concrete Mathematics*, Graham, Knuth, Patashnik (Addison-Wesley); NIST Digital Library of Mathematical Functions.
- **Science.** OpenStax; *The Feynman Lectures on Physics* (free at feynmanlectures.caltech.edu); review articles in Nature and Science; university open courses; national academies and agencies (NASA, NIH, CERN).
- **Business and strategy.** *Competitive Strategy*, Michael Porter (Free Press, 1980) and "What Is Strategy?", Porter, Harvard Business Review, 1996; *The Innovator's Dilemma*, Clayton Christensen (Harvard Business School Press, 1997); *Good Strategy/Bad Strategy*, Richard Rumelt (2011); *The Lean Startup*, Eric Ries (2011); *Business Model Generation*, Osterwalder and Pigneur (Wiley, 2010); *High Output Management*, Andrew Grove; Harvard Business Review; company annual reports and shareholder letters; the Y Combinator Library and Paul Graham's essays for startups.
- **Marketing.** *Marketing Management*, Philip Kotler and Kevin Lane Keller (Pearson); *Positioning*, Al Ries and Jack Trout; *How Brands Grow*, Byron Sharp (Oxford University Press, 2010) and the Ehrenberg-Bass Institute; *Influence*, Robert Cialdini; *Crossing the Chasm*, Geoffrey Moore; *The Long and the Short of It*, Les Binet and Peter Field (IPA, 2013); *Obviously Awesome*, April Dunford (2019); the Journal of Marketing; the American Marketing Association; official platform documentation (Google Search Central, Google Ads Help, Meta Business Help Center) for channel mechanics.
- **Finance and economics.** *Principles of Corporate Finance*, Brealey, Myers, Allen (McGraw-Hill); *The Intelligent Investor*, Benjamin Graham; Aswath Damodaran's teaching material (NYU Stern) and *Investment Valuation* (Wiley); *Principles of Economics*, N. Gregory Mankiw; CORE Econ, *The Economy* (free at core-econ.org); *Thinking, Fast and Slow*, Daniel Kahneman (2011); primary data from SEC EDGAR, FRED (Federal Reserve Bank of St. Louis), the World Bank, IMF, and OECD; defining papers such as "Portfolio Selection", Harry Markowitz, Journal of Finance, 1952, "Capital Asset Prices", William Sharpe, Journal of Finance, 1964, "Prospect Theory", Kahneman and Tversky, Econometrica, 1979, and "The Market for Lemons", George Akerlof, Quarterly Journal of Economics, 1970.
- **Product and design.** *Inspired*, Marty Cagan (Wiley); *The Design of Everyday Things*, Don Norman (Basic Books); *The Mom Test*, Rob Fitzpatrick; Nielsen Norman Group articles (nngroup.com).
- **Communication and writing.** *On Writing Well*, William Zinsser; *The Elements of Style*, Strunk and White; *Style: Lessons in Clarity and Grace*, Joseph Williams; *Getting to Yes*, Roger Fisher and William Ury; *The Pyramid Principle*, Barbara Minto.
- **Learning and productivity.** *Make It Stick*, Brown, Roediger, McDaniel (Harvard University Press, 2014); *Deep Work*, Cal Newport; "Learning How to Learn", Barbara Oakley and Terrence Sejnowski (Coursera).
- **Health, law, and other regulated fields.** Only primary and institutional sources: WHO, national health agencies, Cochrane reviews, the statute or regulation text, the regulator's guidance.

**Record for every source** who the author is and why the field accepts them (position, citations, adoption in syllabi), using the `why_trusted` and `evidence` fields.

**Avoid.** Content farms and SEO articles; influencer threads, newsletters, and videos with no named sources; summaries of books in place of the book; quote collections; "guru" courses; statistics with no primary source (trace every number to where it was first measured); single-study headlines; vendor white papers as evidence for their own product; Wikipedia as a final source (use it only to find primary sources); anything that cannot name its author.

## Lesson recipes

The component set is the same; map the *kind of idea* to a component.

| Kind of idea | Component | Concrete example |
|---|---|---|
| A process with stages | `FlowAnimation` | A marketing funnel: 10,000 visitors flow through awareness → interest → trial → purchase and visibly drop off; the learner changes one conversion rate and watches the end number move |
| Money or value moving | `FlowAnimation` | Cash through a business: revenue in, costs out, what is left; compound interest filling a jar year by year |
| A quantitative relationship | `ParamPlayground` | Break-even point with sliders for price, unit cost, fixed cost; net present value with a discount-rate slider; a function's graph with coefficient sliders |
| Data and comparison | `Chart` | Market share over time; a company's revenue and margin from its filings; a distribution with mean and median marked |
| Geometry and vectors | `VectorSpace3D` | Vectors, span, and a linear transformation the learner can edit; a plane as the solution set of an equation; a 3D surface for a function of two variables |
| A map of related concepts or actors | `Graph3D` | Concept map of a subject (definitions → theorems → applications); a stakeholder or competitor map; `editable` so the learner builds the map and links the ideas |
| A system with parts and exchanges | `SystemDiagram` | A business model: customer segments, value proposition, channels, revenue, costs; a supply chain |
| An exchange between parties | `SequenceDiagram` | A negotiation round by round; a sales process between buyer, seller, and approver; how a card payment moves between parties |
| Stages something moves between | `StateMachine` | Customer lifecycle: stranger → lead → customer → repeat → churned; states of matter; a legal process |
| Step-by-step reasoning | `CodeWalkthrough` | A proof or derivation stepped line by line with the justification for each line; a worked calculation as a short Python snippet or spreadsheet formula list |
| History and sequence of events | `Timeline` | The history of an idea; a company case from founding to outcome |
| A classification or decision | `Mermaid` | A decision tree ("which pricing model?"); a taxonomy |

**Activities.**

- `PredictReveal`: "Price rises 10 percent and volume falls 5 percent: does profit go up or down?" "What is the next line of this proof?"
- `OrderSteps`: order the steps of a derivation, a research process, a launch plan
- `MatchPairs`: term to definition, bias to example, framework to the question it answers
- `Quiz`: apply the idea to a short scenario and choose the best action; never ask for a memorised phrase

**3D versus 2D.** Use `VectorSpace3D` for mathematics and physics with real spatial structure (vectors, surfaces, transformations). Use `Graph3D` for concept maps and actor networks when there are more than about 12 nodes or when the learner should build the map. For business, finance, and writing topics 2D is almost always clearer: a `Chart`, a `ParamPlayground`, or a `FlowAnimation`. Do not add 3D to a topic with no spatial or graph structure; the lesson rule only asks for 3D when that structure exists.

**Custom simulation ideas.** A market simulator where the learner sets price and sees demand and profit; a compound-growth explorer; a "run the campaign" budget allocator with diminishing returns; a proof-step sorter; a Monte Carlo dice or coin lab for probability; a negotiation role-play with scripted counterpart moves; a readability meter that scores a paragraph as the learner edits it.

**Visual recipes** (visual-first plans; standard in `harness/rubrics/visuals.md`):

- Marketing: a `Video` of a customer moving through the funnel, a registered funnel `Diagram`, and `SortBuckets` to classify tactics by funnel stage.
- Business and finance: `ParamPlayground` for unit economics, pricing and compound growth; `CompareView` for two strategies with numbers from the sources.
- Mathematics: `AlgorithmStepper` for proofs or procedures step by step, `ParamPlayground` for functions, `VectorSpace3D` only for real spatial structure.
- Any process topic gets one registered end-to-end workflow `Diagram`.

## Mini project patterns

Mini projects are small experiments and exercises. The folder contract stays: `starter/` holds the blank working files (worksheet, template, dataset, problem set) and `solution/` holds a completed version plus a way to check it (`answers.md`, a checklist, or a `check.py`). Sized for 1–3 hours, guided → independent.

1. **Worked problem set** (guided, 1–2 h): 6–10 problems rising in difficulty, with full solutions and the common wrong answer explained. Proves: the mechanics. Real use: any formal topic.
2. **Apply the framework to a real company or product** (guided, 2 h): fill a template (positioning statement, five forces, business model canvas) using public information with sources. Proves: turning a framework into statements about reality. Real use: strategy and marketing work.
3. **Build the small model** (semi-guided, 2 h): a spreadsheet or CSV-plus-Python model (unit economics, loan schedule, break-even, sample-size calculation) with stated assumptions and a sensitivity check. Proves: quantitative reasoning. Real use: business cases.
4. **Mini case teardown** (semi-guided, 2 h): one real event (a launch, a pricing change, a failure) analysed from primary sources: what happened, why, what the framework predicts, what is still unknown. Proves: evidence-based analysis. Real use: learning from others' decisions.
5. **Small real-world experiment** (semi-guided, 2–3 h): design and run something tiny and safe: five customer interviews with a script, two headline variants shown to ten people, a week of tracked data. Proves: testing an idea against reality. Real use: validating before investing.
6. **Draft, critique, redraft** (independent, 2 h): write a one-page piece (memo, pitch, explanation), review it against a checklist, rewrite, and note what changed. Proves: skill through revision. Real use: all professional communication.
7. **Teach it back** (independent, 1–2 h): explain the topic to a named audience in one page with one diagram and one example, then test it with three questions. Proves: real understanding. Real use: onboarding and stakeholder communication.
8. **Simulation in code** (independent, 2–3 h, when a calculation helps): a short Python script that simulates the idea (compound growth, a probability puzzle, a pricing experiment) with tests. Proves: the mechanism by building it. Real use: checking intuition.

Every README states the real use case, the deliverable, and the acceptance check ("the model's break-even matches the hand calculation within 1 unit").

## Repository analysis focus

**This stage is switched off in `pack.json`** because a non-code topic has no repository, and the repo-intel gate requires a commit SHA and file citations. Its purpose, learning from how professionals actually do it, is met by a **real-world case-study teardown**, produced in the digest stage as one of the planned digests (plan one extra digest target for it at `standard` and `deep`).

**Choosing the case.** A real, well-documented instance where the topic was applied at professional level: a company's strategy documented in its filings and shareholder letters; a campaign with published effectiveness results; a published proof or a classic solved problem; a public policy with measured outcomes; a well-documented failure. Prefer cases with primary documents over cases retold in books.

**What to look for** (the equivalent of architecture, practices, and dependencies).

| What to find | Where it usually appears |
|---|---|
| The situation and the goal | annual report, founder or executive letters, the paper's introduction |
| The decision and the alternatives rejected | strategy sections, interviews with named decision makers, board or investor materials |
| The structure of the solution (its "architecture") | the plan, the model, the proof outline, the campaign structure |
| The numbers | filings, published results, datasets, appendices |
| What it depended on (its "external services") | partners, channels, suppliers, regulation, market conditions, prior results a proof relies on |
| How it was tested or measured | experiments, metrics, audits, peer review |
| What went wrong and how it was handled | later reports, corrections, post-mortems, critical analyses |
| The outcome, with a date | subsequent results, follow-up studies |
| What professionals do beyond the textbook version | details that the standard framework does not mention |

**Evidence rule.** The same discipline as code citations: every claim cites the document and the place, written as `document-id, section or page` where `document-id` is a source id from `sources.json`. Statements without a source are removed. Separate what the documents show from the note's own interpretation with a plain "**Note.**" paragraph.

**Linking.** Named organisations, tools, and channels the case depends on get a `_tech` note only if they are technologies or services (for example an advertising platform); ideas get `_concepts` notes (for example "Network effects", "Price elasticity").

## Capstone shape

The capstone is a complete professional deliverable that solves a real problem. `pack.json` names the kind `case-study`; pick the concrete form by topic shape.

| Topic shape | Capstone form | Example |
|---|---|---|
| Framework (business, marketing, product) | a plan or strategy memo with supporting analysis | go-to-market plan for a real small product |
| Quantitative (finance, economics) | a model with assumptions, scenarios, and a recommendation | three-statement or unit-economics model for a small business |
| Formal (mathematics, science) | a worked proof or problem set with a written exposition | "linear algebra for 2D graphics": ten solved problems building to one application |
| Skill (writing, communication) | a portfolio piece with drafts and a review | a technical article with outline, two drafts, and a revision log |
| Descriptive | a research report answering one question from primary sources | "why did X fail?" with evidence and competing explanations |

**The gate still requires `README.md`, `ARCHITECTURE.md`, at least one ADR, `src/`, and `tests/`.** Map them like this:

```
capstone/
  README.md          the problem, the audience, the recommendation or result, how to read the rest
  ARCHITECTURE.md    the structure of the deliverable: its parts, how they depend on each other,
                     the flow of reasoning (with a mermaid diagram)
  docs/adr/          decision records: each key choice, the alternatives, why this one
                     (which segment to target, which discount rate, which proof strategy)
  src/               the deliverable itself: plan.md or memo.md, model/ (CSV + Python or
                     spreadsheet formulas written out), proofs/, data/ with sources
  tests/             the checks: checklist.md with acceptance criteria, test_model.py for
                     calculations, answers verified against a known result, a peer-review rubric
```

**Professional quality means** (the equivalent of "production ready").

- A specific real problem and a named audience; the conclusion stated first
- Every number has a source id; every assumption is listed and labelled as an assumption
- Sensitivity or scenario analysis for models; edge cases and a counter-example check for formal work
- The main risks and the strongest counter-argument are stated
- A clear recommendation or result that someone could act on, with next steps
- Checks that can be re-run: calculations in code or written formulas, a completed checklist
- Clean structure and plain writing; one diagram that shows the whole argument

**Where OOP and SOLID fit.** They mostly do not; the deliverable is a document or a model. When there is code (a financial model, a simulation), keep it as small pure functions with tests, and use a class only for a clear entity such as a `Scenario` or `LoanSchedule`. The transferable idea is structure: each section has one job, assumptions are separated from logic, and inputs can change without rewriting the model.

**Example capstones.**

- Launch plan for a small real product: positioning, audience, channels, budget, metrics, 90-day calendar
- Financial model and investment memo for a coffee shop or a software subscription business
- A worked proof set with exposition: the key theorems of a topic proved and applied to one concrete problem
- Competitive analysis of a real market from public filings, ending in a strategy recommendation
- A research report with primary sources answering one clearly bounded question

## Recall focus

Worth remembering a year later:

- Definitions the learner can use, not recite: each key term with one example and one non-example
- Decision rules: when to use this framework or method and when not to
- The core formulas with what each symbol means and a small number to check against
- The standard mistakes and biases (survivorship, confusing correlation with cause, anchoring on one case)
- The canonical example for each idea and the canonical counter-example
- For contested fields: the main positions and what evidence would change the answer

Question styles, matching the four card types: Explain ("why does a higher discount rate lower present value?"), Compare ("positioning versus messaging"; "permutation versus combination"), Debug ("this plan targets everyone and has twelve priorities: what is wrong with it?"; "find the invalid step in this proof"), Decide ("a product has high fixed cost and low unit cost: which pricing approach and why?"). For formal topics include short "solve it" cards with small numbers; the answer shows the steps.

## Safety and ethics

- **Education, not advice.** Health, legal, tax, and investment topics are explained in general terms. The brief says so in one plain sentence. Never tell the learner what to do with their own body, case, taxes, or money; point to a qualified professional for personal decisions.
- **No invented facts.** Never make up statistics, quotations, studies, or case details. Every figure carries a source id; if a number cannot be sourced, leave it out.
- **Consensus versus opinion.** Say which statements are settled and which are one school of thought. Do not present a popular book's thesis as established science.
- **Real people and companies.** Use public information only; describe decisions and outcomes, not character. Nothing private, leaked, or defamatory.
- **Experiments with people** (interviews, surveys, message tests): participants know what it is for, take part voluntarily, and their answers are kept anonymous. No deception.
- **Persuasion topics** (marketing, sales, negotiation, influence) are taught with honest methods; manipulative techniques are described so they can be recognised, not practised.
- **Academic honesty.** Problem-set solutions are for the learner's own study; cite sources and quote sparingly.
- **Experience recipes** (adaptive plans; `harness/rubrics/experiences.md`, the selector decides): explainer for any process the sources describe in order; interactive when a learner-changeable input changes the outcome; branching when sources compare valid options; hybrid only when several of these meet in one complex idea.
