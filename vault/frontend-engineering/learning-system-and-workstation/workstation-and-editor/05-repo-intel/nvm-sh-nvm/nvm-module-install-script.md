---
title: "nvm-sh/nvm — module install-script"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-19
sources: [nvm-sh-nvm-repo]
---

# nvm-sh/nvm — module: install-script

## Responsibility

This slice is the second entry point of nvm: the ~590-line `install.sh` that a user pipes
straight into `bash` to bootstrap the machine, plus the `nvm-exec` wrapper that later runs a
command under a chosen Node version. Where `nvm.sh` manages versions once nvm is installed,
`install.sh` has to *get nvm onto the machine* without assuming any of its own tooling is
present: it detects git/curl/wget, downloads nvm itself (as a git clone or three script
files), finds and edits the user's shell profile, and only then hands off to the freshly
sourced `nvm.sh`. Its 24 tests in `test/install_script/` pin down the failure and attack
cases of that bootstrapping path.

## Key files

| File | Role |
|------|------|
| `install.sh` | The bootstrap script: download/install nvm, detect and edit the shell profile, warn about system Node, clean up after itself |
| `nvm-exec` | Wrapper that sources `nvm.sh --no-use`, selects a version from `NODE_VERSION` or `.nvmrc`, and `exec`s the user command |
| `test/install_script/*` | 24 shell tests: injection, download failure, git-config isolation, profile detection and idempotency, exit codes |

## How it works

1. The whole script is wrapped in a top-level `{ … }` brace group whose comment says it "ensures
   the entire script is downloaded" before anything runs (`install.sh:3 @ ad42d90`,
   `install.sh:588 @ ad42d90`). Immediately inside, a guard refuses to run unless the shell is
   actually bash (`install.sh:25-29 @ ad42d90`).
2. `nvm_do_install` is the entry point, run on the last line unless `NVM_ENV=testing`
   (`install.sh:586 @ ad42d90`). It first validates `NVM_DIR`: a *file* with that name aborts
   with exit 1; a missing default dir is created; a missing non-default dir aborts
   (`install.sh:447-463 @ ad42d90`).
3. A macOS check aborts with guidance when `xcode-select` is present but unconfigured and the
   system `git`/`curl` are the stubs Apple ships (`install.sh:466-471 @ ad42d90`).
4. The install method is chosen: `git` if present, else curl/wget, honouring an explicit
   `$METHOD` override and rejecting an unrecognised value (`install.sh:472-497 @ ad42d90`).
   `install_nvm_from_git` clones (or inits, or updates) the repo and checks out the requested
   tag/ref/changeset (`install.sh:158-236 @ ad42d90`); `install_nvm_as_script` downloads
   `nvm.sh`, `nvm-exec` and `bash_completion` (`install.sh:261-325 @ ad42d90`).
5. Back in `nvm_do_install`, the profile is detected (`install.sh:340-380 @ ad42d90`), and the
   `export NVM_DIR=…` plus the `[ -s "$NVM_DIR/nvm.sh" ] && …` source line are appended if not
   already present (`install.sh:501-556 @ ad42d90`). Then `nvm.sh` is sourced, global npm
   modules are checked, an optional `NODE_VERSION` is installed, and `nvm_reset` unsets every
   function the installer defined (`install.sh:558-572 @ ad42d90`, `install.sh:579-584 @ ad42d90`).
6. `nvm-exec` repeats the version-selection idea for a single command: source `nvm.sh --no-use`,
   `nvm use` the `$NODE_VERSION` or the `.nvmrc` version, then `exec "$@"` so the new process
   replaces the wrapper (`nvm-exec:8-24 @ ad42d90`).

## Beyond the textbook

### Download the whole script before executing it

- Textbook version: `curl …/install.sh | bash` — bash starts reading the pipe as bytes arrive, so a
  dropped connection can leave the machine with a *half-executed* install (nvm half-installed, or a
  profile half-edited).
- What they do: the entire body of `install.sh` is one `{ … }` brace group; the opening comment
  states the reason — "this ensures the entire script is downloaded" — and only after the closing
  brace is reached does the shell run it (`install.sh:3 @ ad42d90`, `install.sh:588 @ ad42d90`).
- Why: `bash` reads and parses a complete brace group before running it, so the whole script must
  arrive first; a truncated download produces a syntax error, not a partial install.
- Evidence: `install.sh:3 @ ad42d90`, `install.sh:588 @ ad42d90`

### Install three files atomically: temp names, then rename only after every download succeeds

- Textbook version: download each file straight to its final path; one failed fetch leaves a mix of
  new and old files, or a truncated `nvm.sh` overwriting the working one.
- What they do: `install_nvm_as_script` downloads `nvm.sh`, `nvm-exec` and `bash_completion` to
  `*.download` names in parallel (three background jobs, PIDs captured), waits for all three, and
  only then `mv -f`s them into place — the comment says this is "so that a failed download never
  replaces a working install with a partial or empty file" (`install.sh:281-324 @ ad42d90`).
- Why: the code path is deliberately all-or-nothing; on any download error it removes the temp
  files and returns, leaving the prior install untouched. The test
  `install_nvm_as_script_download_failure` asserts exactly that: a mid-download failure leaves the
  old `nvm.sh` intact, installs no `nvm-exec`, and leaves no `.download` behind
  (`test/install_script/install_nvm_as_script_download_failure:35-45 @ ad42d90`).
- Evidence: `install.sh:281-312 @ ad42d90`, `test/install_script/install_nvm_as_script_download_failure:40 @ ad42d90`

### Isolate the install's git from the repository in the current directory

- Textbook version: run `git clone "$url"` and `git fetch` from wherever the user happens to be;
  git then reads `.git/config` of the project in `$PWD`, whose `url.<base>.insteadOf` or
  `core.sshCommand` settings silently rewrite the nvm URL or run arbitrary commands.
- What they do: every git invocation in `install_nvm_from_git` is qualified with explicit
  `--git-dir="$INSTALL_DIR/.git"` and `--work-tree="$INSTALL_DIR"` (`install.sh:194-232 @ ad42d90`),
  so the clone's own config is the only one read.
- Why: the test `install_nvm_from_git_ignores_cwd_repo` builds a hostile project whose config
  points the URL at an SSH host that `touch`es a marker on connect, then proves the marker never
  appears and the expected commit is still checked out, from both the project root and a
  subdirectory (`test/install_script/install_nvm_from_git_ignores_cwd_repo:40-61 @ ad42d90`).
- Evidence: `install.sh:215-218 @ ad42d90`, `test/install_script/install_nvm_from_git_ignores_cwd_repo:50 @ ad42d90`

### Idempotent profile editing that ignores commented-out lines

- Textbook version: append the source line, or `grep nvm.sh "$profile"` to decide; a user's
  commented-out `# [ -s "$NVM_DIR/nvm.sh" ] && …` line makes the check pass while nvm still is not
  actually loaded, so a re-run skips appending the real line.
- What they do: `nvm_profile_has_line` pipes the profile through
  `sed 's/^[[:space:]]*#.*//'` before grepping, so any line that starts with (possibly indented)
  `#` is erased and cannot count as present (`install.sh:51-54 @ ad42d90`).
- Why: re-running the installer must converge to a correct state, not just "no duplicate text".
  The tests cover a bare, space-indented and tab-indented commented line (all still append) versus
  an active indented line (not appended), for both the `nvm.sh` and `bash_completion` lines
  (`test/install_script/nvm_do_install_commented_profile_lines:51-61 @ ad42d90`,
  `test/install_script/nvm_install_profile_commented:57-91 @ ad42d90`).
- Evidence: `install.sh:51-54 @ ad42d90`

### Write a portable profile line by rewriting the path under `$HOME` as a literal `$HOME`

- Textbook version: embed the resolved install path — `export NVM_DIR="/home/alice/.nvm"` — which
  breaks the moment the user moves machines or their home directory changes.
- What they do: before building the source string, `nvm_do_install` rewrites any `NVM_DIR` that
  lives under `$HOME` into a `$HOME`-prefixed *literal* (`install.sh:505-510 @ ad42d90`), so the
  profile gets `export NVM_DIR="$HOME/.nvm"` instead of an absolute path
  (`install.sh:512 @ ad42d90`).
- Why: the comment on the guard explains the trap it avoids — "an empty `$HOME` would make every
  absolute path look like it is inside it"; the rewrite is a `case` pattern on `${HOME}/*`, not a
  regex. The test `nvm_do_install_home_prefix` pins the tricky edges: a sibling dir whose name
  merely *starts with* `$HOME` is not rewritten, `HOME=/` is handled, and a name containing `.` or
  `:` is matched literally (`test/install_script/nvm_do_install_home_prefix:50-63 @ ad42d90`).
- Evidence: `install.sh:505-512 @ ad42d90`, `test/install_script/nvm_do_install_home_prefix:52-60 @ ad42d90`

### Detect the system Node honestly before warning the user about it

- Textbook version: run `npm list -g` and warn if anything shows up; this mis-reports npm's own
  scaffolding, runs a Windows `npm` under WSL, and can read the `.npmrc` of whatever project the
  user is standing in.
- What they do: `nvm_check_global_modules` skips the check when npm already lives under `NVM_DIR`
  (`install.sh:398-399 @ ad42d90`), returns early for a Windows `npm` that has an `npm.cmd` beside
  it *and* is running under WSL (`install.sh:401-404 @ ad42d90`), and runs npm from `/` "so it does
  not apply the npmrc of the (untrusted) project that `$PWD` is in" (`install.sh:406-410 @ ad42d90`).
- Why: the warning only has value if it describes the user's *system* Node, and only that node is
  the one nvm will shadow. The test fakes each case — npm itself only installed, a Windows npm with
  `npm.cmd`, and a `cwd@[$(pwd)]` marker that must print `cwd@[/]` to prove npm ran from the root
  (`test/install_script/nvm_check_global_modules:66-100 @ ad42d90`).
- Evidence: `install.sh:401-410 @ ad42d90`, `test/install_script/nvm_check_global_modules:87-100 @ ad42d90`

## Tests and what they protect

- **Command injection.** `nvm_download_no_eval_injection` builds a URL containing
  `$(touch …)` and asserts the substitution never runs and the URL reaches curl/wget as one literal
  argument; it also proves spaces in an output path stay single-argument and an `&` in a query
  string is not backgrounded (`test/install_script/nvm_download_no_eval_injection:43-80 @ ad42d90`).
- **Downloader argument shape.** `nvm_download_curl_q_first` asserts `-q` is the *first* curl
  argument so a user's `.curlrc` is skipped (`test/install_script/nvm_download_curl_q_first:33-34 @
  ad42d90`); the injection test also checks the curl→wget flag translation (`-C -`→`-c`,
  `--progress-bar`→`--progress=bar`, `-o`→`-O`, `-s`→`-q`) (`test/install_script/nvm_download_no_eval_injection:82-96 @ ad42d90`).
- **Atomicity on failure.** `install_nvm_as_script_download_failure` mocks a downloader that writes
  part of `nvm.sh` then returns 56, and asserts the old file is untouched, no other file is
  installed, and `nvm_do_install` exits non-zero before touching the profile
  (`test/install_script/install_nvm_as_script_download_failure:35-69 @ ad42d90`).
- **Git install states.** `install_nvm_from_git` drives clone, init-into-empty, and update of an
  existing repo, each with the correct ref/changeset/avoided-ref (`test/install_script/install_nvm_from_git:88-136 @ ad42d90`); the companion test proves the cwd repo's config has no effect.
- **Profile detection order.** `nvm_detect_profile` asserts the full precedence: `PROFILE` first
  (with `/dev/null` meaning "touch nothing"), then `$SHELL`-specific files, then a fixed fallback
  list `.profile`→`.bashrc`→`.bash_profile`→`.zprofile`→`.zshrc`, ending empty when none exist
  (`test/install_script/nvm_detect_profile:37-149 @ ad42d90`).
- **Edit correctness.** Comment/indent idempotency (`nvm_do_install_commented_profile_lines`,
  `nvm_install_profile_commented`), byte-for-byte profile content including a missing trailing
  newline (`nvm_do_install_profile_without_trailing_newline:50-63 @ ad42d90`), literal `%s` in
  paths not consumed by `printf` (`nvm_do_install_printf_format:35-68 @ ad42d90`), and the
  `TRIED_PROFILE` message naming the attempted profile (`nvm_do_install_tried_profile:48-66 @ ad42d90`).
- **Exit codes and cleanup.** `nvm_mkdir_error_handling` asserts exit 2 for git/mkdir failure and
  return 1 for the script path (`test/install_script/nvm_mkdir_error_handling:27-47 @ ad42d90`);
  `nvm_reset` asserts every installer function is unset afterwards (`test/install_script/nvm_reset:29-36 @ ad42d90`).
- **Integration smoke.** `nvm_install_with_node_version` installs Node 8 and lists it
  (`test/install_script/nvm_install_with_node_version:7-12 @ ad42d90`); `nvm_install_with_aliased_dot`
  verifies sourcing works even when `.` is aliased to `:` (`test/install_script/nvm_install_with_aliased_dot:5-22 @ ad42d90`).

## Error handling, performance, and security

- **Bad input.** `NVM_DIR` that is a file aborts with exit 1 and a precise message
  (`install.sh:448-451 @ ad42d90`); a non-default `NVM_DIR` that does not exist aborts rather than
  silently creating an unexpected directory (`install.sh:459-461 @ ad42d90`); an unrecognised
  `$METHOD` aborts with exit 1 (`install.sh:494-496 @ ad42d90`); an invalid `$NVM_METHOD` makes
  `nvm_source` return an error (`install.sh:109-111 @ ad42d90`).
- **Failure of a dependency.** `mkdir` failure exits 2 (`install.sh:184-187 @ ad42d90`); a git
  init, remote-add, clone or checkout failure each exits 2 with a "Please report this!" message
  (`install.sh:190-217 @ ad42d90`); a downloader that fails mid-file returns 1/2/3 and cleans up
  its temp files (`install.sh:283-311 @ ad42d90`).
- **Hostile input is never re-parsed.** `nvm_download` forwards every argument as a literal argv
  element to `command curl`/`command wget` and translates wget flags by iterating `$@` with
  `set --`, never with `eval` (`install.sh:124-156 @ ad42d90`); the injection test proves it.
- **Credentials and config hygiene.** `nvm_has_executable` un-aliases and un-functions a name so
  only a real binary on `PATH` counts (`install.sh:11-19 @ ad42d90`); `nvm_grep` clears
  `GREP_OPTIONS` so a user's grep settings cannot change matching behaviour (`install.sh:31-33 @ ad42d90`).
- **Performance.** The three script downloads run in parallel and the script waits on all PIDs
  (`install.sh:283-312 @ ad42d90`); the git clone is `--depth=1` (`install.sh:201 @ ad42d90`) and
  after checkout the repo is shrunk with `reflog expire --expire=now` and
  `gc --auto --aggressive --prune=now` (`install.sh:228-234 @ ad42d90`).
- **Self-cleanup.** `nvm_reset` unsets every function the installer defined so the caller's shell
  is not polluted (`install.sh:579-584 @ ad42d90`).

## Technologies and services seen

- **bash** — the target shell; the script refuses to run under zsh or without `$BASH_VERSION`
  (`install.sh:25-29 @ ad42d90`)
- **git** — clone/init/update/checkout path, shallow clone and `gc --aggressive` cleanup
  (`install.sh:194-232 @ ad42d90`)
- **curl** — primary downloader, invoked as `curl -q --fail --compressed` with `-q` first
  (`install.sh:125-127 @ ad42d90`)
- **wget** — fallback downloader, driven through a curl→wget argument translation loop
  (`install.sh:128-154 @ ad42d90`)
- **sed** — strips commented-out lines before the profile "already present" check
  (`install.sh:53 @ ad42d90`)
- **grep** — wrapped as `nvm_grep` with `GREP_OPTIONS=''` cleared (`install.sh:31-33 @ ad42d90`)
- **printf** — `nvm_echo` and the profile lines, using `%b` so `$HOME`/`\n` survive
  (`install.sh:22 @ ad42d90`, `install.sh:530 @ ad42d90`)
- **xcode-select** — macOS Command Line Tools detection before a confusing git/curl failure
  (`install.sh:466-471 @ ad42d90`)
- **npm** — system-Node warning and optional first Node install (`install.sh:408 @ ad42d90`,
  `install.sh:249-250 @ ad42d90`)
- **GitHub (`github.com` / `raw.githubusercontent.com`)** — the download endpoints, built by
  `nvm_source` and overridable via `NVM_INSTALL_GITHUB_REPO` / `NVM_SOURCE`
  (`install.sh:100-113 @ ad42d90`)

## Worth exploring interactively

- **`install_nvm_as_script` atomic download** — step through the all-or-nothing install:
  (1) `nvm_source` builds the three URLs (`install.sh:100-113 @ ad42d90`), (2) three downloads
  start in the background, each to a `.download` temp name (`install.sh:283-300 @ ad42d90`),
  (3) `wait` runs on each captured PID and any failure triggers removal of the temp files
  (`install.sh:301-312 @ ad42d90`), (4) only then does `mv -f` put the files in place
  (`install.sh:317-324 @ ad42d90`). Fits **FlowAnimation** because the learner watches the three
  parallel jobs converge on a single gate and sees a failed fetch roll back to the untouched install.
- **`nvm_do_install` profile decision tree** — follow the profile branch:
  (1) `nvm_detect_profile` returns a path or empty (`install.sh:340-380 @ ad42d90`), (2) the
  `$HOME` rewrite turns `NVM_DIR` into a literal `$HOME` (`install.sh:505-510 @ ad42d90`),
  (3) `PROFILE=/dev/null` skips editing entirely, an empty result prints "Profile not found", and
  otherwise `nvm_profile_has_line` decides append vs already-present for both the `nvm.sh` and
  `bash_completion` lines (`install.sh:518-551 @ ad42d90`). Fits **StateMachine** because the
  profile moves between *untouched*, *not found*, *source appended*, and *already present* states.

## Open questions

- `nvm_latest_version` hardcodes `"v0.41.0"` rather than querying GitHub (`install.sh:47-49 @
  ad42d90`), so a release must bump this string; how that bump is enforced (a release script or
  manual step) lives in the build-and-infra slice.
- The `nvm_check_global_modules` and `nvm_install_node` calls hand off to functions defined in
  `nvm.sh` after it is sourced (`install.sh:560-564 @ ad42d90`); their full behaviour is in the
  cli-dispatch and install-node modules, not here.

## My insights
