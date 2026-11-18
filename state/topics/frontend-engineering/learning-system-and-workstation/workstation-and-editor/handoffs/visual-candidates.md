# Visual candidates — workstation-and-editor

<!-- from visual-candidates-discovery-01-editor-ai.md -->
# Visual candidates
1. Settings precedence stack (ordered, later wins): Default, User, Remote, Workspace, Workspace Folder, then Policy overrides all. Source vscode-settings-docs, "Settings precedence".
2. Debug actions comparison: Continue F5, Step Over F10, Step Into F11, Step Out Shift+F11. Source: https://code.visualstudio.com/docs/editor/debugging "Debug actions" (not recorded).
3. Breakpoint states: red filled = enabled, gray filled = disabled, hollow gray = not registered. Same page, "Breakpoints".
4. Prevention checklist for model output: validate, encode, parameterize queries, CSP, log. Source owasp-llm05-improper-output-handling, "Prevention strategies".
5. Agent loop: failing test, fix, run check, fresh-subagent review against spec. Source claude-code-best-practices, "Give Claude a check to run".

<!-- from visual-candidates-discovery-01-git.md -->
- sequence | git bisect start -> bad -> good <rev> -> Git checks out midpoint -> mark good/bad -> repeat -> first bad commit -> bisect reset | git-scm-docs (git-bisect, Description/Examples); chacon-2014-pro-git (Git Tools - Debugging with Git, "Binary Search") | candidate for Video and hybrid lab
- parameter | number of commits between good and bad decides the number of test steps (binary search; Pro Git shows "Bisecting: 6 revisions left to test") | chacon-2014-pro-git (Binary Search) | experiment for an interactive lesson
- decision | git bisect run exit code: 0 good, 1-127 except 125 bad, 125 skip, other aborts | git-scm-docs (git-bisect, "Bisect run") | candidate for a decision table
- sequence | rebase: find common ancestor -> diff each commit -> save temp -> reset branch to base -> apply each change; then fast-forward merge | chacon-2014-pro-git (Git Branching - Rebasing) | candidate for Video / CompareView
- comparison | merge makes a three-way merge commit (endpoints); rebase replays commits (linear history); same final snapshot | chacon-2014-pro-git (Rebasing) | candidate for CompareView
- decision | rule: do not rebase commits that exist outside your repository | chacon-2014-pro-git (Rebasing, "The Perils of Rebasing") | branch for a deck
- number | reflog expiry: 90 days reachable, 30 days unreachable | git-scm-docs (git-reflog, gc.reflogExpire / gc.reflogExpireUnreachable) | number for recovery lesson
- sequence | GitHub flow: branch -> commit and push -> pull request -> review -> merge -> delete branch | github-flow-docs (GitHub flow steps) | candidate for Video
- state change | draft PR cannot be merged until marked ready for review | github-flow-docs / about pull requests (Draft pull requests; page https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests, not yet a source) | note only
- dependency | commit type maps to release: fix -> PATCH, feat -> MINOR, BREAKING CHANGE (! or footer) -> MAJOR | conventionalcommits-spec-1-0-0 (Specification, Summary) | candidate for CompareView and release-notes demo
- structure | message anatomy: <type>[scope]: <description> / blank line / body / blank line / footers | conventionalcommits-spec-1-0-0 (Specification) | candidate for annotated diagram

<!-- from visual-candidates-discovery-01-shell-node.md -->
- decision | .mjs=ESM, .cjs=CommonJS, .js follows nearest package.json "type", no type = CommonJS | nodejs-packages-docs § package.json and file extensions | branch for a deck
- sequence | nearest package.json search: current folder, then parents, until node_modules or volume root | nodejs-packages-docs § package.json field definitions | candidate for Video
- sequence | ssh-keygen -t ed25519, start ssh-agent, ssh-add, upload public key | github-ssh-key-docs § steps | candidate for Video
- comparison | Node lines: v26, v24, v22 LTS; v25 and older EOL; v27 Alpha | nodejs-releases-docs § table | candidate for CompareView
- number | LTS bug fixes for 30 months | nodejs-releases-docs § LTS | candidate for intro
- state change | Corepack bundled in Node 14.19.0 up to but not 25.0.0 | nodejs-corepack-docs § README | candidate for CompareView
- parameter | order of redirections (> file vs 2>&1) changes where stderr goes | GNU Bash manual § Redirections (read by curl, not in sources.json) | experiment for an interactive experience

<!-- from visual-candidates-discovery-02-children.md -->
- sequence | exit code 0 good, 1-127 except 125 bad, 125 skip, other aborts | gitdocs git-bisect, run section | candidate for Video
- decision | exit code chooses good, bad, skip or abort | gitdocs git-bisect, run section | branch for a deck
- comparison | .mjs/.cjs/"type" decide ESM or CJS | node packages.html Determining module system | candidate for CompareView
- parameter | "type" value module/commonjs changes how .js loads | node packages.html Determining module system | experiment for an interactive experience
- state change | branch as a pointer moving with each commit, HEAD | pg Branches in a Nutshell | candidate for Diagram
- parameter | stash and pop around a branch switch | pg Stashing and Cleaning | experiment for an interactive experience
- comparison | breakpoint, conditional breakpoint, logpoint | vsc debugging page, Breakpoints sections | candidate for CompareView

