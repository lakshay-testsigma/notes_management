# Storyboard schema (`video.json`)

Folder: `<videos_dir>/<id>/video.json` (`tutor paths <topic> --json`). Complete
examples in three domains: `harness/examples/videos/` (Raft write commit,
backpropagation weight update, marketing funnel).

```json
{
  "id": "raft-write-commit",
  "title": "How a Raft cluster commits one write",
  "purpose": "See why a write is safe only after a majority of servers store it.",
  "sequence_reason": "The commit depends on an ordered chain of messages, so motion shows cause and effect better than one static diagram.",
  "summary": "Text alternative of the whole video, 12+ words.",
  "explanation": "Shown under the player, 8+ words.",
  "learning_check": { "question": "…", "answer": "…" },
  "concept_ids": ["log-replication"],
  "source_ids": ["raft-paper"],
  "used_in": ["site/src/content/lessons/<topic>/02-the-write-path.mdx"],
  "narration": { "engine": "auto", "voice": null },
  "scenes": [
    { "id": "intro", "duration": 5, "heading": "One write, three servers",
      "narration": "A Raft cluster commits a write in a fixed order. Watch one write travel.",
      "visual": { "type": "title", "subtitle": "Leader, followers, majority" } }
  ]
}
```

Limits checked by `tutor video build`: 3–10 scenes; each 3–20 s; total 20–120 s
(30–90 recommended); narration 3–60 words and at most 2.8 words per second;
scene `source_ids` a subset of the video's; source ids in `sources.json`;
concept ids in `plan.curriculum` when the plan has one.

## Scene types

| `visual.type` | Fields | On screen |
|---|---|---|
| `title` | `subtitle?` | Large heading (on screen from frame 0 when first: it is the thumbnail). |
| `steps` | `items` (2–6 strings) | Numbered steps revealed in turn; the current one highlighted. |
| `flow` | `nodes` (2–6 `{id, label, sub?}`), `path` (1–8 `{from, to, packet?, label?}`) | Boxes in a row; a dot carrying `packet` moves along each hop; the reached node lights up; `label` is a one-line note. Adjacent forward hops are straight; a hop that skips a node goes over the top; backward hops go underneath. |
| `compare` | `left`/`right` `{label, items}`, `verdict?` | Two columns filled in pairs; verdict held long enough to read. |
| `equation` | `expression`, `terms` (1–5 `{text, note}`; `text` must occur in `expression`) | The expression with each term highlighted in turn and explained. |
| `timeline` | `events` (2–7 `{label, detail?}`) | A line with events revealed left to right. |
| `bars` | `items` (2–7 `{label, value}`), `unit?` | Bars grow in turn with their value. |
| `custom` | `html` (`scenes/<name>.html`), `script?` (`scenes/<name>.js`), `labels` (words on screen), `description?` | Your own fragment. |

## Custom scenes

`scenes/<name>.html` is inserted into the scene's stage (1920×600 px, top 240
px). `scenes/<name>.js` runs as the body of `function (tl, T, D, scene)`:
`tl` is the shared paused GSAP timeline, `T` the scene start in seconds, `D`
its duration, `scene` its element. Rules, from the HyperFrames contract:

- Add tweens to `tl` at absolute times (`T + offset`); never play, pause or seek.
- Deterministic only: no `Math.random`, no `Date.now`, no timers, no network.
- Never show/hide clips or control media from script; the runtime does that.
- Text at least 28 px on the 1080p frame; use the CSS variables `--ink`,
  `--ink-2`, `--accent`, `--soft`, `--line-strong`, `--good`, `--bad`.
- List every word shown on screen in `labels`, so the narration check works.
