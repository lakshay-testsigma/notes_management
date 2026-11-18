---
title: "Pick the right tool for each security symptom"
topic: frontend-engineering/learning-system-and-workstation/browser-extension-toolkit
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-18
sources: [retirejs-repo, mdn-csp-docs, chrome-extensions-content-scripts-docs]
---
# Pick the right tool for each security symptom

**Branching presentations** · teaches Security and privacy extensions, Vulnerable library detection, Security headers and CSP inspection

**Why this visual.** Choose the right check for three security symptoms of a page (an old library, a missing CSP header, an extension that asks for every site) and put the checks in one quick order.

Branching presentation (HyperFrames slideshow), 5 main slides and 3 deep dives: "Old library version", "Missing CSP header", "Broad host access". Status: **built**.

Editable project: `projects/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/videos/security-pass-slides` (change `deck.json`, then `tutor deck frontend-engineering/learning-system-and-workstation/browser-extension-toolkit build security-pass-slides`). Present it live: `npx --yes hyperframes@0.9.59 present projects/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/videos/security-pass-slides/composition`.

On the site it opens in the Deep dive tab of its experience; composition `/media/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/security-pass-slides/composition/index.html`.

## Outline

A quick security pass on a page has three checks. Retire.js finds libraries with known vulnerabilities. The Content-Security-Policy response header shows which scripts the page allows. The match patterns and permissions of an extension show which pages its content scripts can read. Each deep dive shows the result of a weak choice and of the right choice.

**Purpose.** Choose the right check for three security symptoms of a page (an old library, a missing CSP header, an extension that asks for every site) and put the checks in one quick order.

### Main path

### 1. Which tool sees this problem?

**On screen.** Title card with "A quick security pass in three checks".

**Notes.** State the task: three symptoms, three tools, and one short order for a security pass.

### 2. Three symptoms on one page

**On screen.** Numbered steps appear one at a time: The page loads an old library version → The response has no CSP header → A helper extension asks for all sites.

**Notes.** Each symptom is a different kind of fact: a version, a response header, and a permission in a manifest.

### 3. Pick a symptom, then a tool

**On screen.** Two columns, "Symptom" and "Tool that sees it", fill in pairs.

**Notes.** Open one deep dive per symptom. Each shows a weak choice, its result, and the right check. Back returns here.

**Branches.** deep dive "Old library version", deep dive "Missing CSP header", deep dive "Broad host access".

### 4. Order the quick pass

**On screen.** Numbered steps appear one at a time: 1. Scan loaded libraries with Retire.js → 2. Read the CSP response header → 3. Check extension host access.

**Notes.** Start with what the page loads, then what the page allows, then what your own tools can read.

### 5. Match the tool to the fact

**On screen.** Two columns, "Wrong tool" and "Right tool", fill in pairs.

**Notes.** A wrong tool gives a calm answer to the wrong question. Ask what kind of fact the symptom is, then pick the tool that reads it.

### Deep dive: Old library version

### 1. Weak choice: read the version by eye

**On screen.** Two columns, "Elements panel" and "Retire.js", fill in pairs; verdict: Use a scanner that knows the vulnerable versions..

**Notes.** The Elements panel shows the script tag and maybe a version, but not which versions have known vulnerabilities.

### 2. Right choice: scan with Retire.js

**On screen.** Numbered steps appear one at a time: Retire.js finds the library and version → It checks its list of vulnerable versions → It reports the known vulnerability.

**Notes.** Retire.js detects JavaScript libraries and reports versions with known vulnerabilities. It runs as a command line tool and inside Burp Suite and OWASP ZAP.

### Deep dive: Missing CSP header

### 1. Where the policy comes from

**On screen.** Two columns, "HTTP response header" and "meta element", fill in pairs; verdict: Read the response headers first..

**Notes.** The server sends the policy in the Content-Security-Policy response header. A meta element can also set a policy, but it lacks some features.

### 2. Allowlist or strict policy

**On screen.** Two columns, "Allowlist" and "Strict CSP", fill in pairs.

**Notes.** MDN recommends a strict policy with nonces or hashes for scripts, because an allowlist of hosts is hard to keep safe.

### Deep dive: Broad host access

### 1. What host access gives a content script

**On screen.** Nodes manifest.json, Content script, Page DOM. A packet moves manifest→script (match patterns pick pages), script→dom (reads and changes the page); each node lights up when the packet arrives.

**Notes.** The manifest match patterns choose the pages. A content script runs in each matching page and reads its DOM.

### 2. Right choice: read the access first

**On screen.** Two columns, "All sites" and "activeTab", fill in pairs; verdict: Prefer the narrow access..

**Notes.** Access to all sites lets the content script read every page you open. activeTab gives access only after you invoke the extension.

## What it shows

Each symptom needs the tool that can see it: a version needs a vulnerability database, a policy needs the response header, and access needs the extension manifest.

Text alternative: A quick security pass on a page has three checks. Retire.js finds libraries with known vulnerabilities. The Content-Security-Policy response header shows which scripts the page allows. The match patterns and permissions of an extension show which pages its content scripts can read. Each deep dive shows the result of a weak choice and of the right choice.

## Check yourself

A page loads an old copy of a JavaScript library. Which check tells you whether that version has known vulnerabilities?

Answer: Retire.js: it compares the library version with its list of versions that have known vulnerabilities.

## Sources

- RetireJS/retire.js — https://github.com/RetireJS/retire.js (`retirejs-repo`)
- Content Security Policy (CSP) (MDN) — https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP (`mdn-csp-docs`)
- Content scripts (Chrome for Developers) — https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts (`chrome-extensions-content-scripts-docs`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/lesson/06-security-privacy-extensions/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/06-security-privacy-extensions.mdx`)

Back to [[visuals-browser-extension-toolkit|all visuals]].

## My insights
