# Pick the right tool for each security symptom

A quick security pass on a page has three checks. Retire.js finds libraries with known vulnerabilities. The Content-Security-Policy response header shows which scripts the page allows. The match patterns and permissions of an extension show which pages its content scripts can read. Each deep dive shows the result of a weak choice and of the right choice.

**Purpose.** Choose the right check for three security symptoms of a page (an old library, a missing CSP header, an extension that asks for every site) and put the checks in one quick order.

## Main path

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

## Deep dive: Old library version

### 1. Weak choice: read the version by eye

**On screen.** Two columns, "Elements panel" and "Retire.js", fill in pairs; verdict: Use a scanner that knows the vulnerable versions..

**Notes.** The Elements panel shows the script tag and maybe a version, but not which versions have known vulnerabilities.

### 2. Right choice: scan with Retire.js

**On screen.** Numbered steps appear one at a time: Retire.js finds the library and version → It checks its list of vulnerable versions → It reports the known vulnerability.

**Notes.** Retire.js detects JavaScript libraries and reports versions with known vulnerabilities. It runs as a command line tool and inside Burp Suite and OWASP ZAP.

## Deep dive: Missing CSP header

### 1. Where the policy comes from

**On screen.** Two columns, "HTTP response header" and "meta element", fill in pairs; verdict: Read the response headers first..

**Notes.** The server sends the policy in the Content-Security-Policy response header. A meta element can also set a policy, but it lacks some features.

### 2. Allowlist or strict policy

**On screen.** Two columns, "Allowlist" and "Strict CSP", fill in pairs.

**Notes.** MDN recommends a strict policy with nonces or hashes for scripts, because an allowlist of hosts is hard to keep safe.

## Deep dive: Broad host access

### 1. What host access gives a content script

**On screen.** Nodes manifest.json, Content script, Page DOM. A packet moves manifest→script (match patterns pick pages), script→dom (reads and changes the page); each node lights up when the packet arrives.

**Notes.** The manifest match patterns choose the pages. A content script runs in each matching page and reads its DOM.

### 2. Right choice: read the access first

**On screen.** Two columns, "All sites" and "activeTab", fill in pairs; verdict: Prefer the narrow access..

**Notes.** Access to all sites lets the content script read every page you open. activeTab gives access only after you invoke the extension.

