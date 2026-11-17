# Writing standard (ASD-STE100, about 80%)

Every generated explanation follows this standard: research summaries, brief,
lesson pages, concept notes, digests, repository notes, project READMEs and
tutorials, capstone documents, final notes, recall cards and video scripts. It
takes about 80% of ASD-STE100 Simplified Technical English: the rules that make
technical text fast to read for a developer who is new to the subject. It does
not take the full STE dictionary, and it never removes technical depth to make
a sentence shorter.

`tutor style <file>` reports sentence length, passive voice and academic words
for any file. The gates of visual-first plans print the same report as
warnings. A warning never fails a gate; a reviewer checks the rest
(`writing-standard` in the content review).

## The rules

1. **Short sentences.** Aim for 15–20 words. A sentence over 25 words is a
   warning: split it at the "and", "which" or "because". One sentence states one
   fact or one instruction.
2. **Active voice.** Name who does what: "The leader sends AppendEntries", not
   "AppendEntries is sent". Use the passive only when the actor is unknown or
   unimportant, and then at most in one sentence of four.
3. **One word, one meaning.** Pick one term for one thing and keep it ("entry",
   never also "record" and "item" for the same thing). Use the term the canonical
   source uses.
4. **Define before use.** Introduce a technical term in the sentence where it
   first appears, in plain words, before a diagram, a component or a later
   paragraph relies on it. After that, use it freely.
5. **Plain words.** "use" not "utilize", "help" not "facilitate", "start" not
   "commence", "about" not "approximately", "to" not "in order to", "show" not
   "demonstrate". `tutor style` lists the ones it finds.
6. **Small steps.** Break a complex idea into connected parts: what it is, how it
   works step by step, what it is for, what it costs, how it fails. Each part
   builds on the one before; say how they connect ("so", "because", "then").
7. **Instructions are imperative.** "Run `npm test`", "Fail s4". Number steps
   that happen in order.
8. **Concrete before abstract.** Start with a real situation, a real command or
   real numbers, then generalize.

## Beginner first, then depth

Write in layers, the same order as the site's depth control:

| Layer | What it holds | Where |
|---|---|---|
| Basic intuition | One sentence of what and why, with an analogy when it helps | first paragraph of a page or note |
| Detailed explanation | The mechanism, step by step, with the visual | the page prose and its visual |
| Interactive visualization | What to change, what to watch | the hand-over sentences around a component |
| Technical internals | Data structures, exact algorithm, edge cases | `<Depth level="internals">` on a page, or a concept note |
| Real-world implementation | Production practice, scale, operations, trade-offs | `<Depth level="production">`, repo-intel, capstone |

Never drop the deeper layers to keep the first one short: move them to their
layer.

## Mark what kind of statement it is

A learner must see the difference between a verified fact and an aid to
understanding. Use these plain-paragraph leads (never a box or a quote):

- **Verified facts** carry their source: a source id in frontmatter, a
  `Sources` line under a visual, or `path/to/file:line @ sha` for code. No lead
  word is needed.
- `**Analogy.**` A comparison that helps intuition. Say where it breaks: "Like a
  vote, except a server can vote only once per term."
- `**Assumption.**` Something taken as given for this explanation or example
  (a network that does not reorder messages, a fixed price).
- `**Interpretation.**` or `**So.**` A conclusion the author draws from the
  sources, not a claim the sources make.
- `**Note.**` An important remark (already the site rule).

## Examples, trade-offs, applications

Every concept explanation includes at least one practical example with real
names and numbers, its main trade-off ("you pay X to get Y"), and where it is
used in real systems. A failure mode or limit belongs with the mechanism, not
in a separate warning.

## Check before you finish

- [ ] No sentence over 25 words without a reason; average 20 or fewer (`tutor style`).
- [ ] Active voice in at least three of four sentences.
- [ ] Every term defined at first use; one term per thing.
- [ ] Analogies, assumptions and interpretations are marked.
- [ ] A concrete example, a trade-off and a real use are present.
- [ ] The technical depth of the sources is still there, in its layer.
