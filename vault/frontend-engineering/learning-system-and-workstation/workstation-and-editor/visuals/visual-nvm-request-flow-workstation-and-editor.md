---
title: "One nvm install request end to end"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-19
sources: [nvm-sh-nvm-repo]
---
# One nvm install request end to end

**Sequence** · teaches Node version management

**Why this visual.** Follow one `nvm install 22` through resolution, download, verification, and the PATH rewrite.

```mermaid
sequenceDiagram
  participant U as User
  participant CLI as cli-dispatch
  participant VV as versions-and-nvmrc
  participant DS as download-and-security
  participant IN as install-node
  U->>CLI: nvm install 22
  CLI->>VV: nvm_version "22"
  VV-->>CLI: concrete version
  CLI->>IN: nvm_install_binary
  IN->>DS: nvm_download_artifact
  DS-->>IN: checksum-verified tarball
  IN->>VV: nvm_change_path
  VV-->>U: PATH points at node 22
```

## What it shows

The command resolves the shorthand to a version, fetches the version index, downloads the tarball, verifies its checksum, then rewrites PATH. Each message is a function call cited in the architecture note.

Text alternative: A sequence diagram where the user calls nvm install, the router resolves the alias, download-and-security returns a verified tarball, install-node installs it, and versions-and-nvmrc rewrites PATH.

## Check yourself

Which step must pass before the tarball is moved into the cache?

Answer: The checksum comparison, so an unverified archive is never cached.

## Sources

- nvm-sh/nvm — https://github.com/nvm-sh/nvm (`nvm-sh-nvm-repo`)

## Used in

- [[nvm-architecture]]

Back to [[visuals-workstation-and-editor|all visuals]].

## My insights
