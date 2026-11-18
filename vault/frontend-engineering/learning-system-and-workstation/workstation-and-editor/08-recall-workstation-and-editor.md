---
title: "Workstation & editor — recall cards"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: recall
tags: [frontend-engineering, learning-system-and-workstation, flashcards]
created: 2026-11-18
---

# Workstation & editor — recall cards

## Cards

<!-- card: wae-01 -->
You run `mytool` and get "command not found", but the file exists in `~/bin`. What is wrong and how do you fix it for every new shell?
?
`~/bin` is not in `PATH`, so the shell never searches it. Add `export PATH="$HOME/bin:$PATH"` to your shell startup file and open a new shell.

<!-- card: wae-02 -->
You pushed `feature` and a teammate built on it. Now `main` moved on. Rebase or merge `main` into `feature`, and why?
?
Merge. Rebase rewrites the commit ids your teammate already has, so their next pull shows duplicate commits and conflicts.

<!-- card: wae-03 -->
A price formatter broke somewhere in the last 30 commits. How do you find the bad commit with the least effort, and about how many tests does Git run?
?
`git bisect start HEAD <good>` then `git bisect run <test script>`. Each test halves the suspects, so about 5 tests (log2 of 30).

<!-- card: wae-04 -->
You ran `git reset --hard` and your last two commits are gone from `git log`. How do you get them back?
?
Run `git reflog`, find the commit id from before the reset, and run `git branch rescue <sha>` (or reset back to it). Reflog keeps where HEAD has been.

<!-- card: wae-05 -->
Which version bump does each message cause: `fix: round cents`, `feat: add coupons`, `feat!: drop old coupon API`?
?
Patch, minor, major. The `!` (or a `BREAKING CHANGE:` footer) marks a breaking change, so release tools bump the major version.

<!-- card: wae-06 -->
Your user settings say `editor.tabSize` 4 and the project's `.vscode/settings.json` says 2. Which applies in this project, and why does that help a team?
?
2, because Workspace settings override User settings. Everyone who opens the project gets the same formatting.

<!-- card: wae-07 -->
A `console.log` loop is slow to debug. What does a breakpoint give you instead?
?
It pauses the running code at that line so you can read every variable and the call stack, then step line by line, without editing the code.

<!-- card: wae-08 -->
An AI agent's diff passes all tests, but one line builds an SQL query by joining strings with user input. Merge or not?
?
Not. Passing tests do not prove safety. Model output is untrusted; send it back to use a parameterized query (OWASP LLM05). See [[visual-ai-review-loop-workstation-and-editor]].

<!-- card: wae-09 -->
A `.js` file contains `import`, and no `package.json` above it has a `type` field. How does Node.js load it, and what should you change?
?
Node.js detects the ESM syntax and loads it as an ES module, with a cost. Set `"type": "module"` (or use `.mjs`) so Node.js does not guess. See [[visual-nodejs-packages-docs-mechanism-workstation-and-editor]].

<!-- card: wae-10 -->
Two projects need Node 20 and Node 24. How do you make each project use its own version on your laptop and in CI?
?
Put the version in `.nvmrc` (for `nvm use`) and the range in `engines.node`; CI reads the same file. Then laptop and CI run the same major.

<!-- card: wae-11 -->
In the pipeline `grep 404 access.log | sort | uniq -c`, grep writes five lines. What does `sort` get and write?
?
The same five lines, reordered so equal lines are adjacent. Each stage reads only the previous stage's output. See [[visual-shell-pipeline-lab-workstation-and-editor]].

<!-- card: wae-12 -->
In the merge or rebase lab, `HEAD` is on `feature` and you commit. Which pointer moves?
?
Only `feature` moves to the new commit; `HEAD` still names `feature`. Other branches stay where they were. See [[visual-git-graph-lab-workstation-and-editor]].

<!-- card: wae-13 -->
Your team lints commit messages in a commit-msg hook, yet bad messages still reach main. Why, and what does commitlint's own repo do?
?
`git commit --no-verify` skips the hook. Run the same linter in CI on the pull-request range, with full history fetched so a shallow clone does not hide commits.

<!-- card: wae-14 -->
Why does commitlint exit with 9 for a bad command line instead of 1?
?
So scripts and CI can tell "bad commit message" (1) from "the tool was called wrongly" (9). Exit codes are its contract with callers.

<!-- card: wae-15 -->
You pushed a bad commit to main and others have pulled it. `git reset` or `git revert`, and why?
?
`git revert`. It adds a new commit that undoes the change, so shared history is not rewritten. `git reset` moves the branch pointer back and suits only commits nobody else has.

<!-- card: wae-16 -->
You fixed PATH with `export` yesterday, and today the tool is "not found" again. Why, and where does the line belong?
?
`export` changes only the current shell process. Bash reads startup files such as `~/.bashrc` when a new shell starts, so put the line there.

<!-- card: wae-17 -->
Your private branch has five commits: "wip", "fix typo", "wip 2"... You want two clean commits before opening the PR. Which command, and what rule limits it?
?
`git rebase -i` with `squash`/`fixup` and `reword` (or `git commit --amend` for only the last commit). Rewrite only commits you have not pushed, because rewriting changes commit ids.

<!-- card: wae-18 -->
You committed an API key, then removed it in the next commit. Is the key safe now? What must you do?
?
No. The key stays in the earlier commit, and anyone with the history can read it. Rotate the key at its provider, and add `.env` to `.gitignore` so it is not committed again.

<!-- card: wae-19 -->
Anyone can set `user.name` to your name. What does a signed commit add, and how does a maintainer refuse unsigned work?
?
A signature made with your private key (`git commit -S`), which others check with your public key (`git log --show-signature`). `git merge --verify-signatures` rejects commits without a trusted signature.

<!-- card: wae-20 -->
Every teammate types `npm run build` in a terminal before testing. How can the editor make this one shared keystroke?
?
Add a task to `.vscode/tasks.json` (type `npm`, script `build`) and commit it. ⇧⌘B (Ctrl+Shift+B) runs the build task for everyone.

## Reopen map

| Card | Outcome it covers | Reopen when missed |
|------|-------------------|--------------------|
| wae-01 | 1 | `01-terminal-and-shell` |
| wae-02 | 2 | `02-git-commit-graph`, [[visual-git-graph-lab-workstation-and-editor]] |
| wae-03 | 3 | `03-bisect-reflog-and-recovery`, [[visual-bisect-lab-workstation-and-editor]] |
| wae-04 | 3 | `03-bisect-reflog-and-recovery` |
| wae-05 | 4 | `04-pull-requests-and-conventional-commits`, [[visual-github-flow-workstation-and-editor]] |
| wae-06 | 5 | `05-editor-setup-and-debugging`, [[visual-settings-precedence-workstation-and-editor]] |
| wae-07 | 5 | `05-editor-setup-and-debugging`, [[visual-debug-session-path-workstation-and-editor]] |
| wae-08 | 6 | `06-ai-assisted-development`, [[visual-ai-review-loop-workstation-and-editor]] |
| wae-09 | 7 | `07-node-versions-and-modules`, [[visual-nodejs-packages-docs-mechanism-workstation-and-editor]] |
| wae-10 | 7 | `07-node-versions-and-modules` |
| wae-11 | 1 | `01-terminal-and-shell`, [[visual-shell-pipeline-lab-workstation-and-editor]] |
| wae-12 | 2 | `02-git-commit-graph`, [[visual-git-graph-lab-workstation-and-editor]] |
| wae-13 | 4 | [[commitlint-findings]] §4, [[03-mini-projects-workstation-and-editor]] |
| wae-14 | 4 | [[commitlint-findings]] §3 |
| wae-15 | 3 | `03-bisect-reflog-and-recovery` |
| wae-16 | 1 | `01-terminal-and-shell` |
| wae-17 | 4 | `02-git-commit-graph` |
| wae-18 | 4 | `04-pull-requests-and-conventional-commits` |
| wae-19 | 4 | [[signed-commits-workstation-and-editor]] |
| wae-20 | 5 | `05-editor-setup-and-debugging` |

## My insights
