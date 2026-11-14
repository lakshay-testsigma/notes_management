# Building a topic-specific interactive component

Read this only when you are the worker of the first unit and a page needs a
visual that no shared component can provide.

## 1. When to build one

Build a topic-specific component only when all three are true:

- The core mechanism of the topic cannot be shown with a shared component.
  Examples: a B-tree node splitting, an attention matrix, a token bucket the
  learner can spam, a consumer group the learner drives by hand.
- The learner does something in it that changes what they see. An animation
  that only plays can almost always be a `FlowAnimation`.
- The outline or the playbook's "Custom simulation ideas" points to it, or you
  can say in one sentence what the learner will understand through it and not
  without it.

A topic has at most two of these. Each one costs build time and maintenance, and
every one that is not needed makes the site less uniform. When in doubt, use the
closest shared component.

## 2. Where it lives and how it is used

- Folder: `site/src/components/topics/<slug>/` (the key `topic_components_dir`
  in the output of `tutor paths`). One file per component, named in PascalCase
  after what it shows: `ConsumerGroupSim.tsx`, `BTreeSplit.tsx`.
- It is a React component in a `.tsx` file with a default export and no
  required props, styled with the site's CSS variables and shared classes.
  `site/README.md` and `site/COMPONENTS.md` describe these conventions, and
  they win over this file. If the site already has a topic-specific component
  (look in `site/src/components/topics/`), read one as a model.
- The page imports it directly under the frontmatter and uses it with
  `client:visible`, inside a `Figure` that gives it a caption:

  ```mdx
  import ConsumerGroupSim from '@topics/redis-streams/ConsumerGroupSim.tsx';

  <Figure caption="One stream, one group, three workers.">
    <ConsumerGroupSim client:visible />
  </Figure>
  ```

  `client:visible` is what makes the component interactive in the browser. It
  is required here and forbidden on shared components, which already have it
  built in.
- Write the import with the `@topics` alias shown above:
  `@topics/<slug>/<Name>.tsx`. The file extension is required. The alias is
  what `site/COMPONENTS.md` documents, and the validator counts a component
  imported this way as the page's visual.
- Only the first unit writes into this folder. Other workers use a component
  only after the first unit has finished, and they read its props from the
  comment at the top of its file.

## 3. Rules for the component

- **Small and focused.** One mechanism, under about 200 lines. If it grows
  beyond that, it is trying to show two things.
- **Props are plain data with defaults.** The page passes strings, numbers,
  booleans, arrays, and objects, and the component works with no props at all.
- **A comment at the top** states what it shows, each prop with its type and
  default, and one usage example. This is its only documentation.
- **Real data inside.** The default data is the real system of the topic, the
  same as for shared components.
- **No new dependencies.** Use what `site/package.json` already has. Do not add
  a package for one component.
- **It looks like the rest of the site.** Reuse the shared wrapper, the plain
  text buttons, and the style variables that the README names. No cards, no
  boxes with shadows, no new fonts or colors.
- **It works for everyone.** Controls are real buttons that work with a
  keyboard, state changes are also described in text, the layout works at a
  width of 320 pixels, and animation stops when the system asks for reduced
  motion.
- **No network and no storage.** Everything runs in the browser from the props.
- **It builds.** A syntax or type error in this file breaks every page of the
  site, not only yours.

## 4. Checking it

A worker in a parallel batch does not run the full site build. Check the
component in this order:

1. Read the file once more for unclosed tags, missing imports, and props that
   are used but not declared.
2. If `site/package.json` has a `check` script and no other worker is building,
   run `npm --prefix site run check` and fix the errors that name your file.
3. Name the component in the `FILES` line of your return, and say in `PROBLEMS`
   if you could not check it. The stage runner's build is the final test.

## 5. Handoff

A topic-specific component is the most common reason a lesson unit runs long.
If the component is finished but pages remain, or the reverse, hand off as
described under "Context budget" in `SKILL.md`, and list in `## Remaining`
exactly which pages are unwritten and whether the component file is complete.
