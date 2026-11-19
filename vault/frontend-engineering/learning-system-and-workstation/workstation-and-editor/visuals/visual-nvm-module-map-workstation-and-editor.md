---
title: "nvm's modules and how they call each other"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-19
sources: [nvm-sh-nvm-repo]
---
# nvm's modules and how they call each other

**Architecture** · teaches Node version management

**Why this visual.** See how one shell script is split into responsibilities that call each other.

```mermaid
flowchart LR
  U[User] --> IS[install-script: bootstrap nvm]
  U --> CLI[cli-dispatch: nvm router]
  IS --> CLI
  CLI --> VV[versions-and-nvmrc: resolve version + PATH]
  CLI --> AL[aliases-and-listing: aliases + lists]
  VV --> DS[download-and-security: fetch + verify]
  AL --> DS
  DS --> IN[install-node: download, extract, build]
  IN --> VV
```

## What it shows

The installer bootstraps nvm, the router dispatches each command, resolution turns a request into a version, and download plus install fetch and verify it. Each arrow matches a function call cited in the architecture note.

Text alternative: A flowchart: the user reaches either install-script or the cli-dispatch router, the router calls version resolution and alias listing, and both lead into download-and-security and then install-node.

## Check yourself

Which module writes the new node onto the PATH?

Answer: versions-and-nvmrc, via nvm_change_path, after install-node has installed the binary.

## Sources

- nvm-sh/nvm — https://github.com/nvm-sh/nvm (`nvm-sh-nvm-repo`)

## Used in

- [[nvm-architecture]]

Back to [[visuals-workstation-and-editor|all visuals]].

## My insights
