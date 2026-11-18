# Visual candidates — how-to-learn-frontend

# Visual candidates — unit `docs` (how-to-learn-frontend)

One line per sourced relationship. Every line names a source id and the exact section it came from.

- sequence | Getting started modules → Core modules → Extension modules | mdn-learn-web-development §"Don't know where to get started?" | candidate for Diagram (study order)
- sequence | tutorial → open example in the Playground → edit the code → Reset on a mistake → read the solution at the bottom of the question | mdn-learn-web-development §"Test your skills" | candidate for OrderSteps / Video
- comparison | "Test your skills" (one feature) vs "Challenges" (several features together into a complete website or program) | mdn-learn-web-development §"Test your skills" | candidate for CompareView
- dependency | example code for every article is kept on GitHub and can be cloned, so the learner can read the shipped source | mdn-learn-web-development §"Getting our code examples" | candidate for Diagram
- number | MDN Learn covers "beginner to 'comfortable' (not 'beginner' to 'expert')", and then hands over to the rest of MDN | mdn-learn-web-development §"About Learn web development" | candidate for a key number on the scope of the area
- sequence | feature request → explainer document and code demo → working group discussion → vendor experimental implementation → text added to the specification → standards positions | mdn-web-standards-model §"Standards bodies and processes" | candidate for Video (explainer)
- dependency | WHATWG → HTML Living Standard; TC39 and ECMA → ECMAScript; Khronos → WebGL; W3C → CSS, JavaScript, HTTP | mdn-web-standards-model §"Standards bodies and processes" | candidate for Diagram (who owns which spec)
- comparison | specifications (how the technology must work) vs MDN guides (how to use the technology) | mdn-web-standards-model §"Web standards" | candidate for CompareView
- dependency | standards acceptance needs security, accessibility, compatibility and patent checks before a feature is accepted | mdn-web-standards-model §"Standards bodies and processes" | candidate for a checklist diagram
- state-change | Limited availability → Newly available → Widely available | web-dev-baseline §"How do things become Baseline?" | candidate for StateMachine
- number | 30 months between the newly interoperable date and Widely available | web-dev-baseline §"How do things become Baseline?" | candidate for a key number in the lesson
- dependency | a feature reaches Newly available only when all four core browser engines support it | web-dev-baseline §"The core browser set" | candidate for Diagram (core browser set)
- comparison | Baseline as a project-wide target vs MDN and Can I Use as a per-feature lookup | web-dev-baseline §"Where to find Baseline" | candidate for CompareView
- number | features group into yearly sets, "Baseline 2023" through "Baseline 2026" | web-dev-baseline §"Baseline targets" | candidate for a timeline
- decision | feature detection vs browser sniffing | mdn-feature-detection §"The concept of feature detection" | candidate for a branching deck
- sequence | CSS test via `element.style.property` → CSS test via `CSS.supports()` → native `@supports` at-rule, which needs no JavaScript and fewer HTTP requests | mdn-feature-detection §"Writing your own feature detection tests" | candidate for OrderSteps
- comparison | four JavaScript test patterns: object member, element property, method return value, retained assigned value | mdn-feature-detection §"JavaScript" | candidate for CompareView
- comparison | `@supports` with AND / OR / NOT logic against a media query, which selects by device traits instead of feature support | mdn-feature-detection §"@supports" | candidate for CompareView
- decision | a feature that cannot be detected needs a polyfill instead of a test | mdn-feature-detection §"JavaScript" | candidate for a branch in a deck

# Visual candidates — unit `repos` — concept `reading-source-code`

Only relationships a vetted source states. Each line names the source id and the exact section or file.

- sequence | `nanoid()` → `customAlphabet(urlAlphabet)` → `customRandom` → random byte pool → `alphabet[byte % alphabet.length]` → 21-character id | ai-nanoid-repo `index.js` (customRandom, customAlphabet, urlAlphabet) | candidate for a CodeWalkthrough or an explainer video
- sequence | read path: public export → call chain → the test that pins the behaviour | ai-nanoid-repo `index.js` and `test/index.test.js`; pmndrs-zustand-repo `src/vanilla.ts` and `tests/basic.test.tsx` | candidate for a learning-loop diagram
- comparison | Nano ID 21 symbols vs UUID v4 36 symbols, 126 random bits vs 122 | ai-nanoid-repo README §Comparison with UUID | candidate for a CompareView
- comparison | `customAlphabet` at 3,955,574 ops/sec vs `nanoid` at 25,580,859 ops/sec vs `crypto.randomUUID` at 6,583,303 ops/sec | ai-nanoid-repo README §Benchmark | candidate for a bar chart
- decision | secure generator (hardware crypto) vs non-secure generator (`Math.random`) | ai-nanoid-repo README §Security and §Non-Secure; `non-secure/index.js` | candidate for a branching deck
- parameter | ID size sets id length and collision probability; 21 by default | ai-nanoid-repo README §API and §Custom Alphabet or Size | experiment for an interactive lesson
- number | nanoid is 117 bytes minified and brotlied, with no dependencies | ai-nanoid-repo README intro and §Nano ID | candidate for a number callout
- comparison | zustand over redux: simple, hook-first, no context providers, transient updates | pmndrs-zustand-repo README §Why zustand over redux? | candidate for a CompareView
- comparison | zustand over context: less boilerplate, renders only on change, action-based state | pmndrs-zustand-repo README §Why zustand over context? | candidate for a CompareView
- sequence | store created → `setState` merges → `subscribe` returns an unsubscribe function → React hook re-renders on change | pmndrs-zustand-repo `src/vanilla.ts` (createStoreImpl, setState, subscribe) and `src/react.ts` | candidate for a CodeWalkthrough
- architecture | `src/vanilla.ts` core plus seven middleware modules (combine, devtools, immer, persist, redux, ssrSafe, subscribeWithSelector) | pmndrs-zustand-repo `src/middleware/` | candidate for an architecture diagram
- sequence | CI runs the same tests on Node 24, 22 and latest | ai-nanoid-repo `.github/workflows/test.yml` | candidate for a CI diagram

# Visual candidates — unit discovery-01

Every line states a relationship that a vetted source states, with the source id and the
exact section or page.

## `staying-current`

- sequence | subscribe to the RSS feed → read the stable and beta release notes → check the Chrome Status page for the current version → read the `New in Chrome` summary | chrome-for-developers-release-notes §Release notes, §Follow | candidate for Video
- comparison | Chrome for Developers release notes vs Chrome Platform Status notes, which hold the notes from Chrome 155 onward | chrome-for-developers-release-notes §Release notes | candidate for CompareView
- number | Chrome 155 is the first release whose notes live on Chrome Platform Status | chrome-for-developers-release-notes §Release notes | candidate for a timeline step in the sequence
- decision | read the stable channel vs the beta channel vs the Chrome Status milestone page | chrome-for-developers-release-notes §Release notes → `Always updating` | candidate for a branching deck
- dependency | the site feed `/static/blog/feed.xml` carries the announcements that the release-notes index lists | chrome-for-developers-release-notes §Follow | candidate for a flow diagram on the lesson page

## `practice-platforms`

- sequence | choose your challenge → build it your way → submit and improve → level up as you go | frontendmentor-challenges §How it works (steps 1 to 4) | candidate for Video and for the OrderSteps activity
- comparison | design challenges, built to a design file, vs product challenges, built from a spec with no design file | frontendmentor-challenges §Two ways to practice | candidate for CompareView
- number | 133 professional projects across five difficulty levels | frontendmentor-challenges §How it works, step 1 | candidate for a stat callout
- number | 1,207,602 people building portfolio-worthy projects | frontendmentor-challenges §Join 1,207,602 people building portfolio-worthy projects | candidate for a stat callout
- decision | hand-code the early levels first, then bring in an agent, then test with a keyboard and on a small screen before submitting | frontendmentor-challenges §Why developers choose Frontend Mentor → `Build by hand first, then with AI` | candidate for a branching deck
- dependency | a review reads the challenge brief and checks code quality, accessibility, commits and README | frontendmentor-challenges §Get feedback on every solution with Pro | candidate for a flow diagram
- sequence | deploy the project → write a README on what was built and the decisions made → explain it in an interview | frontendmentor-challenges §Why developers choose Frontend Mentor → `Build a portfolio you can explain` | candidate for Video

## `teaching-in-public`

- sequence | pick a contribution type → claim a task on the task board and tag the `@mdn/community` team → receive hints → open a pull request → get the writing reviewed → the page is published | mdn-getting-started-contributing §Ways to contribute, §Choosing what to work on and getting started, §Contributions | candidate for Video
- comparison | work on good first issues vs review pull requests vs help beginners vs translate vs fix known issues vs keep browser compatibility data up to date | mdn-getting-started-contributing §Ways to contribute | candidate for CompareView
- comparison | challenge stacks: HTML and CSS only vs HTML, CSS and JS vs HTML, CSS, JS and API, each card labelled newbie, junior, intermediate, advanced or guru | frontendmentor-challenges §Our latest challenges cards | candidate for CompareView
- number | each contribution type has an approximate time, shown on the contributors task board | mdn-getting-started-contributing §What can I do to help? | experiment for an interactive lesson: pick a contribution type and see the time cost
- parameter | contribution content is licensed Attribution-ShareAlike, while code samples are Creative Commons CC-0 | mdn-getting-started-contributing §Contributions | candidate for a labelled diagram of the two licence terms
- decision | write the code sample yourself vs hand it to a team reviewer for English polish | mdn-getting-started-contributing §What do I need to get started? | candidate for a branching deck

## Candidate that needs a second source before it can be drawn

- sequence | the annual survey sections, from Features through Libraries, Front-end Frameworks, Meta-Frameworks, Testing and Build Tools to Usage and Demographics | State of JavaScript 2025 (https://2025.stateofjs.com/en-US, verified 2026-11-18, not recorded as a source) | hold until the orchestrator adds a source id
