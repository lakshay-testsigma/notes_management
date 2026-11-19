# Visual candidates — Workstation & editor (merged)

Grouped by concept id. Every line names a vetted source id and section. Draw only relationships from this file or from digests and repo-intel evidence.

## workstation-setup

- architecture | dotfiles repo → symlink script → `~/.bashrc`, `~/.gitconfig`, `~/.ssh/config`, `~/.tmux.conf` | mit-missing-semester §"Customizing the Shell" | candidate for Diagram
- list | four benefits of versioned, symlinked dotfiles: easy installation, portability, synchronization, change tracking | mit-missing-semester §"Customizing the Shell" | list for the dotfiles project README

## terminal-and-shell

- sequence | a typed command runs, prints to STDOUT, and `|` feeds that output into the next command's STDIN | mdn-command-line §"Connecting commands together with pipes" | candidate for an explainer video
- comparison | global `npm install -g` vs local project install: access anywhere vs reproducible for the team | mdn-command-line §"Where to install our CLI tools" | candidate for CompareView
- decision | Windows terminal choice: `cmd` vs PowerShell vs Git Bash vs WSL; the article recommends WSL for Unix parity | mdn-command-line §"Windows" | branch for a deck
- sequence | terminal window → shell prompt → command split on whitespace → program runs with arguments | mit-missing-semester "Topic 1: The Shell" §"Navigating in the shell" | candidate for Video
- parameter | the order of directories in `$PATH` decides which `node` or `git` runs | mit-missing-semester "Topic 1: The Shell" §"What is available in the shell?" | experiment for an interactive lesson
- sequence | `cat file` → `grep` → `sort` → `uniq`, all processes start at once | mit-missing-semester "Command-line Environment" §"Streams" | candidate for FlowAnimation
- comparison | stdout is piped; stderr is not piped unless redirected (`2>`, `&>`, `2>&1`) | mit-missing-semester "Command-line Environment" §"Streams" | candidate for CompareView
- state change | `Ctrl-C` → SIGINT → stop; `Ctrl-Z` → SIGTSTP → suspended → `fg`/`bg` | mit-missing-semester "Command-line Environment" §"Signals" | candidate for StateMachine
- sequence | shell start → `~/.zshrc` sourced → Oh My Zsh loads plugins and a theme → prompt and aliases change | ohmyzsh-ohmyzsh-repo README §"Getting Started" | diagram or short video

## git-and-github

- decision | HTTPS credential helper vs SSH key on each machine | github-set-up-git-docs §"Authenticating with GitHub from Git" | branch for a deck
- comparison | merge commit vs squash-and-merge vs rebase-and-merge | pro-git-book §3 (Git Branching — merging and rebasing) | candidate for CompareView
- decision | choose merge commit when each commit matters, squash when the PR is one change, rebase when history must stay linear | pro-git-book §3 (Git Branching) | branch for a deck

## editor-setup

- comparison | settings precedence: default < user < remote < workspace < workspace folder < language-specific < policy | vscode-settings-docs §"Settings precedence" | candidate for CompareView or branching deck
- decision | user settings (global, personal) vs workspace settings (`.vscode/settings.json`, shared via version control) | vscode-settings-docs §"User settings", §"Workspace settings" | branch for a deck
- sequence | change a setting in the Settings editor → written to `settings.json` → VS Code applies it | vscode-settings-docs §"Settings editor", §"Settings JSON file" | candidate for a short explainer
- security | executable-naming settings (`git.path`, `terminal.external.*`) allowed only at user scope because a workspace could inject a command | vscode-settings-docs §"Settings and security" | candidate for a warning note

## ai-assisted-development

- decision | AI agent action: run in a sandbox, require approval, or refuse — before a command touches the repo | openai-codex-repo docs/sandbox.md ("Sandbox & approvals") | branching deck on safe AI use
- architecture | Codex CLI runs locally: terminal → model → proposed edits → sandbox/approval → applied change | openai-codex-repo README intro, docs/sandbox.md | explainer for the AI page

## node-version-management

- sequence | `nvm install 22` → `nvm use 22` → `node` resolves through `$PATH` to the active version's `bin` | nvm-sh-nvm-repo README §"Usage", §"Default aliases" | explainer video for the Node page
- parameter | the version named in `.nvmrc` (or `lts/*`) decides which Node binary runs in that directory | nvm-sh-nvm-repo README §".nvmrc", §"Long-term support" | experiment for an interactive lesson
- comparison | project-pinned `.nvmrc` + `nvm use` per directory vs one global default alias | nvm-sh-nvm-repo README §".nvmrc" vs §"Default global packages" | CompareView
- decision | per-user, per-shell install vs system-wide Node install | nvm-sh-nvm-repo README §"Intro" | branch for a deck
- sequence | a Node major moves Current (6 months) → LTS → end-of-life; production uses Active or Maintenance LTS | nodejs-releases-docs §"Node.js Releases" | candidate for a timeline explainer
- number | LTS typically guarantees critical bug fixes for 30 months | nodejs-releases-docs §"Node.js Releases" | number for a lesson intro
- decision | odd vs even majors up to v26 vs the annual cycle from v27 | nodejs-releases-docs §"Node.js Releases" | branch or comparison
- comparison | "Recommended" vs "Community" installation methods (multi-version support, official binaries, open source) | nodejs-releases-docs §"Recommended and community installation methods" | candidate for CompareView
