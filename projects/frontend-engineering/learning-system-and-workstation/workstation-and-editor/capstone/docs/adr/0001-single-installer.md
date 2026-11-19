# 0001. Deliver the dotfiles as one self-contained installer, not a zip archive

## Status

Accepted, 2026-11-19.

## Context

The app must hand the developer a "ready dotfiles repository": several files
plus an install script and a checklist. In a browser, the obvious way to hand
over several files is a zip archive. Zipping needs a dependency (for example
JSZip), and the downloader then has to build and stream an archive before the
browser can save it.

The generated installer already has to write every file to its home location
atomically and idempotently. If the installer is self-contained — if its body
already holds the content of every file — then one download is the whole
repository, and the same script both delivers and installs the files.

## Decision

The generator embeds every file's content into `install.sh` as a quoted
heredoc. The browser downloads that one file. Running it writes each file to its
home location through a temp file and a single rename, and appends shared lines
only when they are absent.

## Alternatives considered

- **A zip archive built with JSZip.** One more dependency, and the downloaded
  archive still needs an unzip step before the files are usable. It separates
  "deliver" from "install" for no benefit here.
- **One download per file.** Correct but poor: the developer has to place seven
  files by hand, which is exactly the work the tool removes.

## Consequences

- One download is the whole repository; no archive library is needed.
- The installer is the delivery mechanism and the install mechanism in one
  file, matching how nvm ships a single script.
- Editing a file means regenerating the installer; the generator rebuilds it
  from the same content every time, so the two cannot drift.
