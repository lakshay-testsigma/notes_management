---
title: "Workstation & editor — resources"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: resources
tags: [frontend-engineering, learning-system-and-workstation]
created: 2026-11-18
---

# Workstation & editor — resources

Every source below was checked against a live page before it was recommended.

<!-- tutor:generated:start -->
**12 vetted sources.** Tier A is canonical (official docs, the defining paper, the standard book, the reference implementation). Tier B is strong and widely used.

## Official documentation

- **[Bash Reference Manual](https://www.gnu.org/software/bash/manual/bash.html)** — GNU Project (Free Software Foundation), 2026 · tier A
  - Why it is trusted: The official manual of GNU Bash from the GNU Project. It defines Pipelines, Redirections, Shell Variables (including PATH), the shell Environment and Shell Scripts.
  - Used for: lesson
  - Verified: 2026-11-18
- **[Best practices for Claude Code](https://code.claude.com/docs/en/best-practices)** — Anthropic, 2026 · tier A
  - Why it is trusted: Official Anthropic documentation of the tool. It teaches specific prompts, giving the agent a check to run (tests), and review by a fresh reviewer that did not write the code.
  - Used for: brief, lesson
  - Verified: 2026-11-17
- **[Git reference manual: git-bisect and git-reflog](https://git-scm.com/docs/git-bisect)** — Git project, 2026 · tier A
  - Why it is trusted: The official reference manual pages of the Git project on git-scm.com, covering the current git bisect run exit codes and reflog expiry defaults.
  - Used for: lesson
  - Verified: 2026-11-17
- **[GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow)** — GitHub, 2026 · tier A
  - Why it is trusted: The official GitHub Docs description of the branch, pull request, review and merge workflow, published by GitHub on docs.github.com.
  - Used for: lesson
  - Verified: 2026-11-17
- **[Node.js documentation: Packages (module system, type field) and Corepack (packageManager)](https://nodejs.org/api/packages.html)** — OpenJS Foundation / Node.js, 2026 · tier A
  - Why it is trusted: Official Node.js API documentation. The Packages page defines how .mjs, .cjs and the package.json "type" field choose ES module or CommonJS; the Corepack page documents the packageManager field.
  - Used for: digest, lesson
  - Verified: 2026-11-17
  - Digest: [[nodejs-packages-docs-workstation-and-editor|read the digest]]
- **[Node.js Releases (release statuses and LTS schedule)](https://nodejs.org/en/about/previous-releases)** — OpenJS Foundation / Node.js, 2026 · tier A
  - Why it is trusted: The Node.js project's own release page; it states which versions are LTS, Alpha or end-of-life and the LTS rules.
  - Used for: brief, lesson
  - Verified: 2026-11-17
- **[npm Docs: package.json (engines) and npx](https://docs.npmjs.com/cli/v11/configuring-npm/package-json)** — npm, Inc. (GitHub), 2026 · tier A
  - Why it is trusted: The official npm CLI documentation. The package.json page defines the engines field (the node versions a package works on); the npx page defines running package binaries.
  - Used for: lesson
  - Verified: 2026-11-17
- **[Visual Studio Code documentation](https://code.visualstudio.com/docs/getstarted/settings)** — Microsoft (VS Code team), 2026 · tier A
  - Why it is trusted: Official VS Code documentation by Microsoft. The settings page lists default, user, remote, workspace and workspace folder scopes; the debugging page covers launch.json, breakpoints, logpoints and Node.js debugging; the tasks, snippets, user interface, basic editing, code navigation and profiles pages cover tasks.json, the Command Palette, snippets, multi-cursor, F12/F2 and profile templates.
  - Used for: brief, lesson
  - Verified: 2026-11-18

## Books

- **[Pro Git](https://git-scm.com/book/en/v2)** — Scott Chacon and Ben Straub, 2014 · tier A
  - Why it is trusted: The standard Git book, hosted on the official git-scm.com site, published by Apress, free to read online under CC BY-NC-SA 3.0 with a chapter on Git branching, rebasing and bisect.
  - Used for: brief, digest, lesson
  - Verified: 2026-11-17
  - Digest: [[chacon-2014-pro-git-workstation-and-editor|read the digest]]

## Repositories

- **[conventional-changelog/commitlint](https://github.com/conventional-changelog/commitlint)** — conventional-changelog (organisation), 2026 · tier B
  - Why it is trusted: The de facto TypeScript linter for Conventional Commits, owned by the conventional-changelog organisation under the MIT license, with CI workflows, vitest tests and a commitlint config in nestjs/nest.
  - Used for: repo-intel, lesson
  - Verified: 2026-11-17

## Standards

- **[LLM05:2025 Improper Output Handling](https://genai.owasp.org/llmrisk/llm052025-improper-output-handling/)** — OWASP GenAI Security Project, 2026 · tier A
  - Why it is trusted: OWASP entry in the Top 10 for LLM Applications. It says to treat model output as untrusted input, and lists generated code with SQL injection or hallucinated package names as a risk.
  - Used for: brief, lesson
  - Verified: 2026-11-17
- **[Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)** — Conventional Commits project, 2026 · tier B
  - Why it is trusted: The published 1.0.0 specification of the commit message format, on its own site; an industry convention (not a formal standards body) that maps feat, fix and BREAKING CHANGE to SemVer and is enforced by commitlint.
  - Used for: lesson, brief
  - Verified: 2026-11-17
<!-- tutor:generated:end -->

## My insights
