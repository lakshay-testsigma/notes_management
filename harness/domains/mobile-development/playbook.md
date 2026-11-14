# Mobile Development playbook

Guidance for the stage skills. Each `##` heading is read by one skill; keep the eight headings and their order.

## How this domain is learned

Default stack is React Native with Expo and TypeScript, because it runs on both platforms from one machine and reuses web knowledge. Use Kotlin with Jetpack Compose, Swift with SwiftUI, or Flutter when the topic is specific to that platform.

**Prerequisite chain.** A topic may assume everything above it.

1. JavaScript or TypeScript and React basics (or Kotlin, Swift, or Dart for a native topic)
2. What is different on a phone: app lifecycle, small screens, touch, unreliable network, battery, permissions, app stores
3. Layout and components: flexbox layout, lists, safe areas, platform conventions
4. Navigation: stacks, tabs, modals, deep links
5. State and data fetching
6. Local storage and offline behaviour
7. Device capabilities: camera, location, notifications, background work
8. Performance: startup, frame rate, memory, list rendering
9. Testing and release: builds, signing, store review, over-the-air updates
10. Native internals: how the framework talks to the platform

**Beginner misconceptions to correct early.**

- "A mobile app is a small website." The operating system can pause or kill the app at any time; state must survive that.
- "The network is there." Mobile networks are slow and intermittent; every screen needs offline, loading, and retry behaviour.
- "React Native renders a web view." It renders real native views; JavaScript drives them.
- "The simulator is enough." Performance, permissions, cameras, and notifications behave differently on real devices.
- "Ask for all permissions at launch." Ask in context, when the feature is used, and handle refusal.
- "Ship a fix like a website." Store review and users who do not update mean old versions live for months; APIs must stay backward compatible.
- "AsyncStorage is a database, and it is fine for tokens." It is an unencrypted key-value store; use a database for data and the secure store for secrets.
- "One codebase means identical apps." Platform conventions differ (back gesture, navigation patterns, typography) and users notice.
- "60 frames per second is automatic." Long lists, heavy re-renders, and work on the UI thread drop frames.

**Choosing depth.**

- `quick`: one API or mechanism (safe area insets, deep links, pull to refresh, secure storage).
- `standard`: one capability or library (navigation, push notifications, offline storage with SQLite, list performance, animations).
- `deep`: a pillar (React Native architecture, Jetpack Compose, SwiftUI, offline-first sync, mobile release engineering).

**Cutting a topic into lesson pages.**

1. The user moment (what the user is trying to do on the phone)
2. The platform constraint behind it
3. The mental model in one picture
4. The smallest working screen
5. Lifecycle and failure: background, kill, no network, permission denied
6. Performance and battery cost
7. Platform differences and how a production app handles it

## Trusted sources

**Official documentation (tier A candidates).**

- Android Developers (developer.android.com), including the Guide to app architecture and Jetpack Compose docs
- Apple Developer Documentation (developer.apple.com), SwiftUI tutorials, and the Human Interface Guidelines
- React Native (reactnative.dev) and Expo (docs.expo.dev)
- Flutter (docs.flutter.dev) and Dart (dart.dev)
- Kotlin (kotlinlang.org), including Kotlin Multiplatform; Swift (swift.org) and *The Swift Programming Language* (docs.swift.org)
- Material Design 3 (m3.material.io)
- React Navigation (reactnavigation.org), Reanimated (docs.swmansion.com), Firebase docs (firebase.google.com/docs), SQLite (sqlite.org)
- fastlane (docs.fastlane.tools), Maestro, Detox
- Store policy: App Store Review Guidelines, Google Play Developer Policy Center

**Standards.** OWASP Mobile Application Security: MASVS and MASTG (mas.owasp.org); W3C WCAG for accessibility; platform accessibility guides (VoiceOver, TalkBack).

**Standard books and courses.**

- *Kotlin in Action*, Sebastian Aigner, Roman Elizarov, Svetlana Isakova, Dmitry Jemerov (Manning, 2nd edition 2024)
- *Android Programming: The Big Nerd Ranch Guide* (Big Nerd Ranch)
- *The Swift Programming Language*, Apple (free)
- *Thinking in SwiftUI* and *Advanced Swift* (objc.io)
- *Building Mobile Apps at Scale: 39 Engineering Challenges*, Gergely Orosz (2021)
- *Mobile First*, Luke Wroblewski (A Book Apart, 2011)
- *Clean Architecture*, Robert C. Martin (Prentice Hall, 2017) for layering
- Stanford CS193p, Developing Apps for iOS (free lectures)
- Hacking with Swift and "100 Days of SwiftUI", Paul Hudson
- Android Basics with Compose (Google's official course) and Android codelabs; Flutter codelabs

**Defining papers and talks.** This domain is defined by platform guides and conference sessions more than papers.

- Apple WWDC session videos and Google I/O talks for the platform feature in question (the session by the team that built it)
- "Local-First Software: You Own Your Data, in Spite of the Cloud", Kleppmann, Wiggins, van Hardenberg, McGranaghan, Onward! 2019 (offline-first design)
- "The information capacity of the human motor system in controlling the amplitude of movement", Paul Fitts, Journal of Experimental Psychology, 1954 (Fitts's law, touch targets)
- The React Native New Architecture documentation on reactnative.dev (Fabric, TurboModules, JSI)

**Engineering blogs.** Android Developers Blog; Swift.org blog; React Native blog; Expo blog; Shopify Engineering (React Native at scale); Airbnb Engineering (the 2018 "React Native at Airbnb" series, server-driven UI); Uber Engineering (rider app rewrite, RIBs); Discord engineering blog; Instagram and Meta Engineering; Slack Engineering; Spotify Engineering; Block's Cash App Code Blog; Duolingo blog; Callstack and Software Mansion blogs (React Native core contributors); The Pragmatic Engineer, Gergely Orosz.

**Organizations whose repositories count as production grade.** Google (`android`, `flutter`), Apple (`apple`, `swiftlang`), the React Native project (`react/react-native`, formerly `facebook/react-native`), Expo, JetBrains, Software Mansion, Callstack, and companies that publish the app they ship.

**Flagship application repositories for repo-intel.**

- React Native and Expo apps: `bluesky-social/social-app` (Expo, one codebase for iOS, Android, web), `Expensify/App`, `mattermost/mattermost-mobile`, `artsy/eigen`, `RocketChat/Rocket.Chat.ReactNative`
- Android: `android/nowinandroid` (Google's reference app: Compose, modularisation, offline-first), `android/architecture-samples`, `signalapp/Signal-Android`, `duckduckgo/Android`
- iOS: `signalapp/Signal-iOS`, `wikimedia/wikipedia-ios`, `kickstarter/ios-oss`, `pointfreeco/swift-composable-architecture` (architecture library with case studies)
- Flutter: `flutter/samples`, `immich-app/immich` (slice `mobile/`), `AppFlowy-IO/AppFlowy`
- Libraries worth one slice: `react-navigation/react-navigation`, `software-mansion/react-native-reanimated`, `Shopify/flash-list`, `lysine-dev/okhttp` and `lysine-dev/retrofit` (both formerly under `square`)
- Starters (tier B, for capstone structure): `infinitered/ignite`

**Avoid.** Tutorials using deprecated APIs (class components, the old React Native bridge-only modules, `AsyncTask`, XML-only Android UI for new work, UIKit storyboards for a SwiftUI topic); Expo guides from before the current SDK's workflow (classic "eject"); clone-an-app YouTube series with no tests or architecture; libraries with no release in the last year or no New Architecture support; Medium posts; "best mobile framework" comparison articles from agencies.

## Lesson recipes

| Kind of concept | Component | Concrete example |
|---|---|---|
| App lifecycle | `StateMachine` | Not running → foreground active → inactive → background → suspended → terminated; learner sends "home button", "phone call", "low memory" events |
| Navigation structure | `Graph3D` | Screens as nodes, stack pushes and tab switches as edges; `editable` so the learner builds a tab-plus-stack navigator and tests a deep link path |
| Framework architecture | `FlowAnimation` | A tap travels native touch → JavaScript handler → state update → render → native view commit, old bridge versus the New Architecture |
| Network and sync | `FlowAnimation` | Offline write goes to a local queue, the connection returns, the queue syncs, a conflict is resolved; learner toggles airplane mode |
| Push notifications and auth | `SequenceDiagram` | App, operating system, push service (APNs or FCM), and backend exchanging tokens and a message; OAuth with PKCE on mobile |
| App and backend architecture | `SystemDiagram` | UI layer, state, repository, local database, API client, backend, push provider |
| Layout and animation values | `ParamPlayground` | Flexbox props against a phone frame; spring stiffness and damping against a bouncing card; touch target size against miss rate |
| Component and hook code | `CodeWalkthrough` | A `FlatList` with stable keys and memoised rows; a permission request flow; a Compose state hoisting example |
| Performance | `Chart` | Frame times with and without list virtualization; cold-start time by phase; app size by asset type |
| Release process | `Timeline` | Build → sign → upload → review → phased rollout → over-the-air patch |
| Static structure | `Mermaid` | View hierarchy, module graph, project folder layout |

**Activities.**

- `PredictReveal`: "The user fills a form, switches apps for 20 minutes, and returns. What do they see?" "The row key is the array index and an item is deleted from the top: what happens to the row state?"
- `OrderSteps`: order the push-notification registration steps, a store release, the permission request flow
- `MatchPairs`: storage option to use case (secure store, key-value, SQLite, file); platform convention to platform
- `Quiz`: choose native, React Native, or Flutter for a described app; choose where to store a token

**3D versus 2D.** Use `Graph3D` for navigation graphs and module dependency graphs of larger apps. Use `StateMachine` for lifecycle, which is the most important picture in this domain, and 2D for everything about layout, since a phone screen is 2D. A topic-specific phone-frame mock is usually worth more than any 3D view.

**Custom simulation ideas.** A phone frame that the learner can background, kill, rotate, and take offline to see how a sample screen reacts; a gesture playground (pan, pinch, swipe thresholds); a list scroller with a frame-drop meter; a deep-link tester that resolves a URL to a screen stack; a sync-conflict simulator with two devices editing one record; a safe-area and notch overlay tool.

## Mini project patterns

Projects run in Expo Go or a simulator with no paid accounts. Guided → independent.

1. **One polished screen** (guided, 1–2 h): a list-and-detail screen with pull to refresh, empty and error states, safe areas. Proves: layout, lists, states. Real use: almost every app screen.
2. **Navigation shell** (guided, 2 h): tabs plus stacks, a modal, typed route params, and one deep link. Proves: navigation model. Real use: every multi-screen app.
3. **Form with device input** (semi-guided, 2 h): a profile form with keyboard handling, validation, and a photo from the camera or library, with the permission flow. Proves: permissions and input. Real use: onboarding and profiles.
4. **Offline-first notes** (semi-guided, 2–3 h): local SQLite storage, works without network, survives app kill. Proves: persistence and lifecycle. Real use: field and travel apps.
5. **Secure login** (semi-guided, 2 h): token stored in the secure store, auto-login, logout, expired-token handling against a mock API. Proves: secure storage and auth flow. Real use: any account-based app.
6. **Smooth long list** (independent, 2 h): a 10,000-item feed made smooth by virtualization, memoisation, and image caching, with measurements. Proves: performance. Real use: feeds and catalogs.
7. **Local notifications and background work** (independent, 2–3 h): a reminder app that schedules notifications and handles taps into the right screen. Proves: notifications and deep links. Real use: habit and calendar apps.
8. **Sync with conflict handling** (independent, 3 h): queue offline edits and sync to a mock server with a last-write-wins or merge rule. Proves: offline sync. Real use: collaborative apps.

Tests use React Native Testing Library for behaviour and plain unit tests for logic kept outside components.

## Repository analysis focus

| What to find | Where it usually lives |
|---|---|
| Framework, SDK versions, build setup | `package.json`, `app.json` or `app.config.*`, `eas.json`, `build.gradle(.kts)`, `Podfile`, `pubspec.yaml`, Xcode project |
| Module and folder structure | `src/`, `app/` (file-based routes), `features/`, Android `:feature:*` and `:core:*` modules, Swift packages |
| Navigation | navigator setup, route definitions, deep-link config, `AndroidManifest.xml` intent filters, associated domains |
| State management and data flow | stores, view models, reducers, query client, unidirectional data flow |
| Networking | API client, interceptors, retries, token refresh, offline queue |
| Persistence and sync | database schema and migrations, repositories, sync engine, conflict rules |
| Design system | component library, theme, tokens, dark mode, dynamic type |
| Platform-specific code | `*.ios.*` and `*.android.*` files, native modules, `expect`/`actual`, platform channels |
| Permissions and privacy | manifest permissions, `Info.plist` usage strings, privacy manifests, consent flows |
| Performance techniques | list configuration, image caching, lazy screens, startup work, baseline profiles |
| Error handling and crash reporting | error boundaries, crash SDK setup, logging |
| Feature flags and remote config | flag clients, gating code |
| Internationalization and accessibility | locale files, accessibility labels, RTL handling |
| Testing strategy | unit tests, component or UI tests, end-to-end flows (`.maestro/`, `e2e/`), screenshot tests |
| CI and release | `.github/workflows/*`, `fastlane/`, signing handling, versioning, over-the-air update channels |

**External services to record as `_tech` notes.** Push providers (APNs, FCM), analytics, crash reporting, authentication providers, backend-as-a-service, maps, payments and in-app purchase, over-the-air update service, build service, feature-flag service.

**Findings worth ranking high.** How the app stays usable offline, how it protects startup time, how one codebase handles platform differences, how releases are staged and rolled back, how modules keep build times down.

## Capstone shape

**Production ready means.**

- Runs on iOS and Android (or one platform done properly for a native topic) from a clean clone with documented steps
- Every screen handles loading, empty, error, offline, and permission-denied states
- State survives backgrounding and process death where the user would expect it
- Tokens in the secure store; no secrets in the bundle; inputs validated
- Accessibility: labels, touch targets of at least 44 by 44 points, dynamic text sizes, sufficient contrast
- Smooth scrolling on a mid-range device; startup work kept small; images sized and cached
- Tests: unit tests for logic, component tests for key screens, one end-to-end flow
- Typed navigation and API layer; lint and type checks in CI
- Crash-safe error boundary and a logging wrapper; environment config per build type
- README with run, test, and build instructions; `ARCHITECTURE.md`; ADRs (navigation structure, storage choice, state approach)

**Recommended structure (React Native with Expo).**

```
app/                 routes (Expo Router): screens only compose features
src/
  features/<name>/
    components/      function components
    hooks/           screen logic
    model.ts         types and pure functions
  data/
    ApiClient.ts     class behind an interface
    repositories/    NoteRepository etc. (local + remote)
    db/              schema and migrations
  services/          AuthService, NotificationService, SyncService (classes)
  ui/                shared components and theme
  config.ts
tests/               unit, component, e2e/
```

**Where OOP and SOLID fit.** UI in React Native, Compose, and SwiftUI is declarative functions or structs; keep it that way. Use classes for the data and service layer (repositories, API client, sync engine, view models on Android) behind interfaces so they can be faked in tests. Dependency inversion matters most at the device boundary: wrap camera, storage, and notifications so logic is testable without a device.

**Example capstones.**

- Offline-first field notes app with photos, local database, and background sync
- Habit tracker with reminders, streaks, and a home-screen-ready summary
- Expense splitter for trips that works offline and syncs between two devices
- Local events browser with maps, search, deep links, and saved items
- Reading-list app that saves articles for offline reading with a share-sheet entry

## Recall focus

Worth remembering a year later:

- The app lifecycle states and what must be saved at each transition
- Decision rules: which storage for which data; native, React Native, or Flutter; when to go offline-first; push versus local notification
- Failure modes: lost state after process death, list jank, permission denial dead ends, token expiry loops, breaking old app versions with an API change
- Platform differences that cause bugs: back behaviour, safe areas, keyboard handling, permission models
- The release path and why backward compatibility matters

Question styles: Explain ("why can the system kill a backgrounded app, and what must the app do about it?"), Compare ("secure store versus AsyncStorage versus SQLite"), Debug ("scrolling stutters only on Android release builds with images; what do you check?"), Decide ("a delivery driver app used in poor coverage: what storage and sync design, and why?").

## Safety and ethics

- Request the minimum permissions, in context, with a clear reason string; the feature must degrade gracefully when refused.
- Collect the minimum data; no tracking or analytics SDKs in learning projects unless the lesson is about them, and then with consent.
- Secrets never ship in the app bundle; tokens go in the secure store; signing keys and provisioning files are never committed.
- Do not publish to a store unless the learner asks; follow store policies and never copy another app's name, icon, or assets.
- No dark patterns: honest notifications, easy opt-out, no fake urgency.
