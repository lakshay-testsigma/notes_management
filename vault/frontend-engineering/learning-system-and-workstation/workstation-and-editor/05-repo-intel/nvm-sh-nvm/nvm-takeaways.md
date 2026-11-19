---
title: "nvm-sh/nvm — takeaways"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-19
sources: [nvm-sh-nvm-repo]
---

# nvm-sh/nvm — takeaways for the capstone

The capstone is "Setup doctor". These are the things worth borrowing.

1. **Give each audit failure its own exit code.** The doctor reports "missing Node", "missing
   git identity", "bad editor setting" — give each a distinct code so scripts can branch on the
   cause. From [[nvm-findings|finding 3]].

2. **Verify before you write anything.** When the doctor reads or writes a config file, treat
   the contents as hostile and write via a temp file plus rename. From [[nvm-findings|finding 1]]
   and [[nvm-findings|finding 2]].

3. **Make the check read-only and fork-free.** Audit the machine without spawning a subprocess
   per check, and never run the things you audit. From [[nvm-findings|finding 5]].

4. **Report `missing` and `misconfigured` as different states.** nvm splits "no `.nvmrc`" (exit
   1) from "empty `.nvmrc`" (exit 2); the doctor should split "absent" from "present but wrong".
   From [[nvm-findings|finding 3]].

5. **Idempotency is a feature, not an afterthought.** A re-run of the doctor must converge on
   the same report, and any fix it applies must not duplicate itself. From
   [[nvm-findings|finding 7]].

6. **Test the failure cases by faking the machine.** Mock `node`, `git`, and `curl` as real
   executables on a rewritten PATH, then assert the exact argument vector — proving no secret or
   path leaks. From [[nvm-findings|finding 8]].

7. **Keep a written trust boundary for your checks.** Decide which inputs are payloads and which
   are metadata, and state it in one place, the way nvm's threat model does. From
   [[nvm-findings|finding 1]].

## What not to copy

- **The whole-tool single-file layout.** A ~7,000-line `nvm.sh` makes sense to install as one
  script; a learning-project doctor is better split into small, testable functions.
- **The multi-OS CI matrix.** Testing four shells × three OSes × two C libraries is overkill for
  a doctor that targets one OS.
- **The hard-coded teardown list.** Hand-enumerating 150 function names to `unset` only matters
  when you source into a user's shell; a doctor can exit normally.

## My insights
