---
title: "Operating system process"
topic: shared
stage: concept
tags: [concept]
created: 2026-11-18
---

# Operating system process

A process is one running program. The operating system gives it standard input, standard output and standard error, a copy of the environment variables, and a working directory. When the process ends, it returns an exit code: 0 means success, other numbers mean failure. Shell pipes, `git bisect run` and CI checks all read these streams and exit codes.

## Where it shows up

- [[01-brief-workstation-and-editor]]
- [[06-capstone-workstation-and-editor]]

## My insights
