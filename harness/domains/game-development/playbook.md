# Game Development playbook

Guidance for the stage skills. Each `##` heading is read by one skill; keep the eight headings and their order.

## How this domain is learned

Default stack is TypeScript in the browser (HTML Canvas or Phaser 3): zero install, instant feedback, and game logic that can be unit-tested. Switch to Godot (GDScript), Unity (C#), or Unreal (C++) only when the topic is about that engine; state the switch in the plan.

**Prerequisite chain.** A topic may assume everything above it.

1. Programming basics and 2D math: coordinates, vectors, angles, distance
2. The game loop: input, update, render; delta time and fixed timestep
3. Drawing: sprites, the canvas or scene, cameras
4. Input and movement: velocity, acceleration, character controllers
5. Collision detection and response
6. Game state: scenes, state machines, entities and components
7. Game feel: animation, easing, particles, sound, screen shake
8. Game AI: state machines, steering, pathfinding, behaviour trees
9. Content: levels, tile maps, procedural generation, save data
10. Advanced: physics engines, shaders and rendering, 3D, multiplayer networking, optimisation

**Beginner misconceptions to correct early.**

- "The engine makes the game." Engines provide a loop, rendering, and tools; design, feel, and architecture are still the work.
- "Start with the dream game." Scope kills beginner projects; finish tiny games (Pong, Breakout, a one-screen platformer) first.
- "Move things a fixed amount per frame." Movement must be multiplied by elapsed time, or the game runs at different speeds on different machines.
- "Physics should be realistic." Good-feeling games cheat: coyote time, jump buffering, variable jump height.
- "Graphics make it fun." The core loop must be fun with rectangles; polish multiplies, it does not create.
- "Every object needs its own class in a deep hierarchy." Composition (components, ECS) scales better than `Enemy extends Character extends Entity`.
- "Check everything against everything." Collision needs a broad phase (grid, quadtree) before the narrow phase.
- "Multiplayer can be added later." Networking shapes the whole architecture (determinism, authority, prediction).
- "Optimise early." Measure first; most beginner games are limited by a few hot loops or draw calls.

**Choosing depth.**

- `quick`: one technique (delta time, AABB collision, lerp and easing, coyote time, a simple state machine).
- `standard`: one system (the game loop, tile maps, A* pathfinding, particle systems, a character controller, a quadtree).
- `deep`: a pillar (entity component systems, 2D physics, rendering and shaders, multiplayer netcode, procedural generation).

**Cutting a topic into lesson pages.**

1. What the player feels or sees when it is missing or wrong
2. The idea with a picture and a toy the learner can poke
3. The math or algorithm on a tiny case
4. The code inside the game loop
5. Edge cases and bugs (tunnelling, jitter, frame-rate dependence)
6. Tuning for feel and performance
7. How a shipped game or engine does it

## Trusted sources

**Official documentation (tier A candidates).**

- Godot Engine docs (docs.godotengine.org), Unity Manual and Unity Learn (docs.unity3d.com, learn.unity.com), Unreal Engine documentation (dev.epicgames.com)
- Phaser (phaser.io), three.js (threejs.org), Babylon.js docs, PixiJS (pixijs.com), Bevy (bevy.org), raylib (raylib.com), SDL (libsdl.org), LÖVE (love2d.org)
- MDN: Canvas API, WebGL, Web Audio, Gamepad API, and the game development section (developer.mozilla.org)
- Khronos Group specifications: OpenGL, Vulkan, WebGL, glTF (khronos.org); WebGPU (W3C)
- Box2D documentation (box2d.org)

**Standard books.**

- *Game Programming Patterns*, Robert Nystrom (2014; free at gameprogrammingpatterns.com): the first book to read
- *Game Engine Architecture*, Jason Gregory (CRC Press, 3rd edition 2018)
- *Real-Time Rendering*, Akenine-Möller, Haines, Hoffman, and co-authors (CRC Press, 4th edition 2018)
- *Real-Time Collision Detection*, Christer Ericson (Morgan Kaufmann, 2005)
- *The Art of Game Design: A Book of Lenses*, Jesse Schell (CRC Press, 3rd edition 2019)
- *Game Feel*, Steve Swink (Morgan Kaufmann, 2008)
- *A Theory of Fun for Game Design*, Raph Koster
- *Rules of Play*, Katie Salen and Eric Zimmerman (MIT Press, 2003)
- *The Nature of Code*, Daniel Shiffman (free at natureofcode.com)
- *3D Math Primer for Graphics and Game Development*, Fletcher Dunn and Ian Parberry (CRC Press, 2nd edition 2011; free at gamemath.com)
- *Physically Based Rendering: From Theory to Implementation*, Pharr, Jakob, Humphreys (MIT Press, 4th edition 2023; free at pbr-book.org)
- *Artificial Intelligence for Games*, Ian Millington (CRC Press)
- *Multiplayer Game Programming*, Joshua Glazer and Sanjay Madhav (Addison-Wesley, 2015)

**Canonical online references.**

- Red Blob Games, Amit Patel (redblobgames.com): pathfinding, hex grids, procedural maps
- Gaffer On Games, Glenn Fiedler (gafferongames.com): "Fix Your Timestep!", networking and networked physics series
- Gabriel Gambetta, "Fast-Paced Multiplayer" (client-side prediction, server reconciliation, lag compensation)
- LearnOpenGL, Joey de Vries (learnopengl.com); WebGL2 Fundamentals and WebGPU Fundamentals
- The Book of Shaders, Patricio Gonzalez Vivo and Jen Lowe (thebookofshaders.com); Inigo Quilez's articles (iquilezles.org)
- Ray Tracing in One Weekend, Peter Shirley (raytracing.github.io)
- Catlike Coding, Jasper Flick (Unity tutorials); GDQuest and KidsCanCode (Godot tutorials)
- Valve Developer Community, "Source Multiplayer Networking"
- Game AI Pro (free chapters at gameaipro.com)
- Harvard CS50's Introduction to Game Development

**Defining papers and talks.**

- "MDA: A Formal Approach to Game Design and Game Research", Hunicke, LeBlanc, Zubek, AAAI Workshop on Challenges in Game AI, 2004
- "A Formal Basis for the Heuristic Determination of Minimum Cost Paths" (A*), Hart, Nilsson, Raphael, IEEE Transactions on Systems Science and Cybernetics, 1968
- "Flocks, Herds, and Schools: A Distributed Behavioral Model", Craig Reynolds, SIGGRAPH 1987; "Steering Behaviors For Autonomous Characters", Reynolds, GDC 1999
- "An Image Synthesizer" (Perlin noise), Ken Perlin, SIGGRAPH 1985
- "The Rendering Equation", James Kajiya, SIGGRAPH 1986
- "Advanced Character Physics" (Verlet integration), Thomas Jakobsen, GDC 2001
- "Latency Compensating Methods in Client/Server In-game Protocol Design and Optimization", Yahn Bernier, Valve, GDC 2001
- "1500 Archers on a 28.8: Network Programming in Age of Empires and Beyond", Bettner and Terrano, GDC 2001
- "The TRIBES Engine Networking Model", Frohnmayer and Gift, GDC 2000
- "Overwatch Gameplay Architecture and Netcode", Timothy Ford, GDC 2017 (ECS and netcode)
- "I Shot You First: Networking the Gameplay of Halo: Reach", David Aldridge, GDC 2011
- "Three States and a Plan: The A.I. of F.E.A.R.", Jeff Orkin, GDC 2006; "Handling Complexity in the Halo 2 AI", Damian Isla, GDC 2005 (behaviour trees)
- "Juice It or Lose It", Martin Jonasson and Petri Purho, 2012; "The Art of Screenshake", Jan Willem Nijman (Vlambeer), 2013
- "Math for Game Programmers: Building a Better Jump", Kyle Pittman, GDC 2016
- "Evolve Your Hierarchy", Mick West, 2007 (component-based entities)
- "Real Shading in Unreal Engine 4", Brian Karis, SIGGRAPH 2013 course notes

The GDC Vault and the GDC YouTube channel are the main source of post-mortems and technical talks; SIGGRAPH is the top venue for rendering.

**Engineering blogs.** Unity blog and Unreal Engine tech blog; Godot blog; Riot Games Technology; Factorio Friday Facts (Wube Software); Game Developer (gamedeveloper.com, formerly Gamasutra) post-mortems; the Fabien Sanglard code reviews of id Software engines (fabiensanglard.net).

**Organizations whose repositories count as production grade.** The Godot Foundation, id Software (historic source releases), Khronos Group, Epic Games and Unity (source-available under their own licenses; record that), Bevy, Phaser Studio, the three.js and Babylon.js teams, Valve, Erin Catto (Box2D), Jolt Physics.

**Flagship repositories for repo-intel.**

- Engines (slice one system: the main loop, the scene tree, the physics step): `godotengine/godot`, `bevyengine/bevy`, `phaserjs/phaser`, `mrdoob/three.js`, `BabylonJS/Babylon.js`, `raysan5/raylib`, `libgdx/libgdx`, `pixijs/pixijs`
- Complete open-source games: `OpenTTD/OpenTTD`, `wesnoth/wesnoth`, `OpenRA/OpenRA`, `Anuken/Mindustry`, `CleverRaven/Cataclysm-DDA`, `luanti-org/luanti`, `SuperTux/supertux`
- Historic, frozen, and still the best study material: `id-Software/DOOM`, `id-Software/Quake`, `id-Software/Quake-III-Arena` (tier B as "frozen reference"; the rubric's 12-month commit rule does not apply to these)
- Physics and ECS: `erincatto/box2d`, `jrouwe/JoltPhysics`, `dimforge/rapier`, `SanderMertens/flecs`, `skypjack/entt`
- Networking: `ValveSoftware/GameNetworkingSockets`, `colyseus/colyseus`, `heroiclabs/nakama`
- Official samples: `godotengine/godot-demo-projects`, `Unity-Technologies/EntityComponentSystemSamples`

**Free assets with clear licenses.** Kenney (kenney.nl, CC0), OpenGameArt.org (check each license), Google Fonts, freesound.org (check each license).

**Avoid.** "Make an MMO in one video" tutorials; tutorials for engine versions two major releases old (Godot 3 for a Godot 4 topic, Unity's old input system presented as current); asset-flip templates; forum answers that fix a physics bug by raising the frame rate; AI-generated asset packs with unclear rights; any source that hides how movement relates to delta time.

## Lesson recipes

| Kind of concept | Component | Concrete example |
|---|---|---|
| The game loop and frame pipeline | `FlowAnimation` | Input → update → physics → render repeating each frame; learner lowers the frame rate and sees a non-delta-time sprite slow down while a correct one does not |
| Networking | `FlowAnimation` | Client input packets travel to the server and state returns with adjustable latency; with prediction off the player feels lag, with prediction on it snaps on correction |
| Entity and AI states | `StateMachine` | Player: idle → run → jump → fall → land; enemy: patrol → chase → attack → flee; the learner fires events and watches illegal transitions get rejected |
| Vectors and 3D math | `VectorSpace3D` | Dot product as facing check (is the enemy in front?), cross product for a surface normal, a camera frustum; the learner drags the vectors |
| Scene graphs and ECS | `Graph3D` | A scene tree where moving a parent moves its children; entities linked to components and the systems that process them; `editable` to attach a component |
| Navigation graphs | `Graph3D` (`editable`) | Learner builds a waypoint graph, sets start and goal, and watches A* expand nodes |
| Tunable feel | `ParamPlayground` | Gravity, jump velocity, coyote time, and jump buffer on a live character; easing curves; spring constants; steering weights for a flock |
| Algorithms in code | `CodeWalkthrough` | A fixed-timestep loop with accumulator; AABB overlap test; A* in 40 lines; an ECS system loop |
| Multiplayer ordering | `SequenceDiagram` | Client prediction, server authoritative update, reconciliation, and replay of unacknowledged inputs |
| Engine architecture | `SystemDiagram` | Platform layer, renderer, physics, audio, scripting, asset pipeline, and the game on top |
| Performance | `Chart` | Collision checks with brute force versus a spatial grid as entity count grows; frame-time graph with a spike |
| History | `Timeline` | Rendering techniques from sprites to ray tracing; the history of netcode models |
| Static structure | `Mermaid` | Class or component layout, level format, asset pipeline |

**Activities.**

- `PredictReveal`: "A bullet moves 600 px per second and the wall is 10 px thick at 30 frames per second: does it hit?" (tunnelling) "Which node does A* expand next?"
- `OrderSteps`: order the stages of one frame; order the rendering pipeline; order client-side prediction steps
- `MatchPairs`: pattern (object pool, observer, command, state) to the problem it solves; MDA aesthetic to a mechanic
- `Quiz`: pick the collision shape, the data structure for broad phase, or the netcode model for a described game

**3D versus 2D.** 3D is natural here for vector math, cameras, transforms, lighting, and scene graphs, and `VectorSpace3D` is the right tool for the math pages. Keep 2D for 2D game concepts (tile maps, sprites, 2D collision), where a flat interactive canvas is clearer and closer to what the learner will build. Do not use `Graph3D` for a state machine; use `StateMachine`.

**Custom simulation ideas.** This domain should lean on topic-specific playable toys: a jump-tuning sandbox; a collision playground with draggable shapes showing overlap and the separating axis; a quadtree that subdivides as the learner adds points; a flocking sandbox; a noise-terrain generator with octave sliders; a pathfinding grid where walls are painted; a netcode simulator with a latency and packet-loss slider; a shader editor with a live preview; a "juice" toggle board that turns screen shake, particles, and easing on and off for the same game.

## Mini project patterns

Each is a small playable thing that runs in the browser with `npm run dev`. Game logic lives in plain modules with unit tests; rendering stays thin. Guided → independent.

1. **A complete tiny game** (guided, 2 h): Pong or Breakout with a start screen, score, win and lose. Proves: the loop, input, collision, game states. Real use: the skeleton of every game.
2. **Character controller that feels good** (guided, 2 h): platformer movement with acceleration, variable jump, coyote time, and jump buffering, all tunable. Proves: game feel through numbers. Real use: any action game.
3. **Collision system** (semi-guided, 2–3 h): AABB and circle tests, resolution, and a spatial grid broad phase, with a stress test of 2,000 objects. Proves: correctness and performance. Real use: bullets, pickups, crowds.
4. **Enemy AI** (semi-guided, 2–3 h): a state machine enemy plus A* pathfinding on a tile map. Proves: decision and navigation. Real use: any game with opponents.
5. **Entity component system refactor** (semi-guided, 2–3 h): turn an inheritance-based starter into components and systems, then add a new behaviour without touching existing ones. Proves: composition over inheritance. Real use: games that grow.
6. **Procedural level** (independent, 2–3 h): generate a dungeon or terrain from a seed, reproducibly, and guarantee it is completable. Proves: noise, generation, validation. Real use: roguelikes and sandbox games.
7. **Juice pass** (independent, 2 h): take the plain tiny game and add easing, particles, sound, screen shake, and hit pause, with a reduced-motion option. Proves: polish as a system. Real use: making a prototype feel like a product.
8. **Two-player networked prototype** (independent, 3 h): an authoritative server over WebSocket with client-side prediction and artificial latency. Proves: netcode basics. Real use: real-time multiplayer.

Every README names the "feel" acceptance check ("the jump still works when pressed 80 ms before landing") next to the automated tests.

## Repository analysis focus

| What to find | Where it usually lives |
|---|---|
| Main loop and timing | `main.*`, `engine.*`, `game.*`, `loop`, `tick`, `update` functions, timestep handling |
| Entity model | scene tree or node classes, ECS `world`, `component`, `system` modules |
| Rendering path | `render*/`, `gfx/`, `drivers/`, shader folders, batching and culling code |
| Physics and collision | `physics/`, broad phase and narrow phase, solver, integration step |
| Input handling | input mapping, action systems, device abstraction |
| Game AI | state machines, behaviour trees, navigation mesh and pathfinding modules |
| Asset pipeline | importers, resource loaders, caching, file formats |
| Scripting and data-driven design | script bindings, data files (JSON, Lua, resources) that define content |
| Networking | `net*/`, replication, snapshots, prediction, rollback, serialization |
| Memory and performance techniques | object pools, custom allocators, data-oriented layouts, job systems, profiling hooks |
| Save and load | serialization, versioning of save data |
| Platform abstraction | `platform/`, per-OS backends, build targets |
| Tools | editor code, level editors, debug overlays and consoles |
| Testing strategy | unit tests for math and containers, replay or deterministic tests, screenshot comparison |
| Build and CI | `CMakeLists.txt`, `SConstruct`, `Cargo.toml`, `package.json`, workflows, platform matrices |

**External technologies to record as `_tech` notes.** Graphics APIs (OpenGL, Vulkan, Metal, DirectX, WebGPU), windowing and input libraries (SDL, GLFW), physics engines, audio libraries, scripting languages, asset formats (glTF), networking libraries, platform SDKs and store services.

**Findings worth ranking high.** How the loop separates simulation from rendering, how the code stays data-driven, the tricks that keep frame time stable (pooling, batching, spatial structures), how determinism or network authority is enforced, and anything the engine does that contradicts the simple tutorial version.

## Capstone shape

The capstone is a small, complete, polished game: a start, a core loop, an end, and a reason to replay.

**Production ready means.**

- Complete loop: title screen, play, win and lose, restart; pause and settings
- Fixed-timestep simulation separated from rendering; frame-rate independent
- Game logic in testable modules with no rendering imports; unit tests for math, collision, state transitions, and generation (seeded)
- Data-driven content: levels, enemy stats, and tuning values in data files, not hard-coded
- Stable performance target stated and measured (for example 60 frames per second with 500 entities)
- Input remapping or at least keyboard plus touch or gamepad; a reduced-motion option
- Asset loading with a loading state and error handling; all assets licensed and credited in `CREDITS.md`
- Save data with a version field
- A production build that runs from static files; README with controls and how to run, test, and build
- `ARCHITECTURE.md` with the loop and system diagram; ADRs (ECS or object model, physics approach, engine choice); a one-page design note using the MDA lens

**Recommended structure.**

```
src/
  core/        Game, GameLoop, Clock, EventBus, SceneManager (classes)
  ecs/         World, Entity ids, component types, System base class
  systems/     MovementSystem, CollisionSystem, RenderSystem, AISystem
  scenes/      TitleScene, PlayScene, GameOverScene (State pattern)
  physics/     pure functions: overlap tests, integration
  ai/          StateMachine, Pathfinder
  render/      Renderer, Camera, SpriteSheet
  input/       InputMap
  data/        levels and tuning (JSON)
assets/        images, audio, CREDITS.md
tests/
```

**Where OOP and SOLID fit.** Classes suit the engine-like parts with clear lifetimes and contracts: `GameLoop`, `Scene`, `System`, `Renderer`, and the classic patterns (State, Command, Observer, Object Pool) from *Game Programming Patterns*. For game entities prefer composition: plain data components processed by systems, not deep inheritance. Keep math and collision as pure functions. Single responsibility per system is the rule that keeps a game changeable.

**Example capstones.**

- One-screen arcade game with waves, power-ups, and a local high-score table
- Tile-based roguelike with procedural dungeons, turn-based enemies, and permadeath
- Precision platformer with five hand-made levels and a level data format
- Tower defence with pathfinding enemies and data-driven towers
- Two-player networked arena game with an authoritative server

## Recall focus

Worth remembering a year later:

- The frame: order of input, update, physics, render, and why the timestep is fixed
- Decision rules: inheritance or components; which collision shape; which pathfinding or AI technique; which netcode model for which genre
- Formulas with meaning: position and velocity integration, dot product for facing, lerp and easing, distance checks without square roots
- Failure modes: frame-rate-dependent movement, tunnelling, jitter from mixing update rates, spiral of death, garbage-collection hitches, desync
- Feel techniques by name: coyote time, jump buffering, hit pause, screen shake, easing
- The MDA framework in one sentence

Question styles: Explain ("why accumulate time and step in fixed increments?"), Compare ("state machine versus behaviour tree"), Debug ("the player sometimes falls through thin platforms at low frame rates; cause and two fixes?"), Decide ("a fighting game needs responsive online play: prediction with reconciliation or rollback, and why?"). Add small "compute by hand" vector cards.

## Safety and ethics

- Use original assets or assets under a license that allows the use; credit them in `CREDITS.md`. Never copy characters, art, music, or names from commercial games.
- Record engine and library licenses; Unity and Unreal source is available under their own terms, not open source.
- Accessibility: avoid rapid full-screen flashing, offer reduced motion, do not rely on colour alone, allow control remapping where practical.
- No manipulative monetisation mechanics (loot-box gambling loops, fake scarcity) in example designs; if the topic is game economy, teach it critically.
- Multiplayer prototypes run on localhost; no cheating tools or bots for real online games.
