# Security playbook

Guidance for the stage skills. Each `##` heading is read by one skill; keep the eight headings and their order. Every skill that works in this domain also reads `## Safety and ethics` first.

## How this domain is learned

Security is taught defensively: understand an attack in a lab the learner owns, in order to detect it and fix it. Every attack idea is paired with its defence in the same lesson.

**Prerequisite chain.** A topic may assume everything above it.

1. How the thing being attacked works: HTTP, cookies, sessions, SQL, the browser's same-origin policy, Linux basics, TCP/IP and DNS
2. Security goals and vocabulary: confidentiality, integrity, availability; threat, vulnerability, risk; trust boundary; attack surface
3. Threat modeling: what are we protecting, from whom, how could it fail
4. Web application vulnerabilities and their fixes (injection, XSS, CSRF, SSRF, broken access control)
5. Authentication, sessions, and authorization
6. Cryptography as a user: hashing, symmetric and asymmetric encryption, signatures, TLS; never invent your own
7. Secure development: code review, static analysis, dependency and supply-chain security
8. Network, cloud, and container security
9. Detection and response: logging, alerting, incident handling
10. Deeper system topics: memory safety, binary exploitation concepts, sandboxing

**Beginner misconceptions to correct early.**

- "Security is hacking." Most security work is design, review, configuration, and monitoring; offensive skill serves defence.
- "We use HTTPS, so we are secure." TLS protects data in transit only; it does nothing for injection or broken access control.
- "Encoding or encrypting equals safe." Base64 is not encryption, encryption is not integrity, hashing is not encryption, and fast hashes are wrong for passwords.
- "Validate input on the client." The client is controlled by the attacker; every check must be on the server.
- "Authentication equals authorization." Knowing who the user is does not decide what they may do; broken access control is the most common serious web flaw.
- "A scanner found nothing, so it is safe." Tools find known patterns; logic flaws need thinking.
- "Security through obscurity works." Assume the attacker knows the design; only the secrets are secret.
- "Roll your own crypto or auth." Use vetted libraries and standard protocols.
- "Attackers are geniuses." Most breaches use known flaws, weak or stolen credentials, and misconfiguration; basics done consistently matter most.
- "It is fine to test a site if I mean no harm." Testing without written authorization is illegal in most places. Labs only.

**Choosing depth.**

- `quick`: one mechanism or flaw (CSRF token, SameSite cookies, password hashing with a salt, a security header).
- `standard`: one vulnerability class or control (SQL injection, XSS, session management, JWT pitfalls, STRIDE threat modeling, TLS handshake).
- `deep`: a pillar (web application security, authentication and authorization, applied cryptography, cloud and container security, detection and response).

**Cutting a topic into lesson pages.**

1. The asset and the trust boundary (what is protected, who is trusted)
2. How the system normally works
3. The flaw: the wrong assumption, in one picture
4. The attack in a lab, step by step
5. Detection: what it looks like in logs and traffic
6. The fix and why it works; the fix that looks right but is not
7. Defence in depth and a real published incident

## Trusted sources

**Standards and frameworks (tier A candidates).**

- OWASP (owasp.org): Top 10 (current edition 2025), Application Security Verification Standard (ASVS), Cheat Sheet Series (cheatsheetseries.owasp.org), Web Security Testing Guide (WSTG), API Security Top 10, Mobile MASVS and MASTG, Top 10 for LLM Applications, SAMM
- MITRE: ATT&CK (attack.mitre.org), CWE and the CWE Top 25 (cwe.mitre.org), the CVE program (cve.org)
- NIST: National Vulnerability Database (nvd.nist.gov), Cybersecurity Framework 2.0, SP 800-53 (controls), SP 800-63 (digital identity), SP 800-61 (incident response), SP 800-207 (zero trust architecture), SP 800-218 (Secure Software Development Framework)
- FIRST: CVSS (first.org/cvss)
- CIS Benchmarks and CIS Critical Security Controls (cisecurity.org)
- CISA advisories and the Known Exploited Vulnerabilities catalog (cisa.gov)
- IETF RFCs: RFC 8446 (TLS 1.3), RFC 6749 (OAuth 2.0), RFC 7636 (PKCE), RFC 9700 (OAuth 2.0 security best current practice), RFC 7519 (JWT), RFC 8725 (JWT best current practice)
- W3C Web Authentication (WebAuthn) and Content Security Policy; OpenID Connect Core
- Supply chain: SLSA (slsa.dev), Sigstore (sigstore.dev), OpenSSF Scorecard and guides (openssf.org)
- NSA and CISA Kubernetes Hardening Guide

**Official documentation.** MDN Web Security (developer.mozilla.org); Mozilla web security guidelines and the SSL Configuration Generator; PortSwigger Burp Suite documentation; ZAP (zaproxy.org); Nmap reference guide (nmap.org); Wireshark; Metasploit; Semgrep; CodeQL; Trivy; Docker and Kubernetes security docs; cloud provider security documentation; Let's Encrypt.

**Authorized practice platforms.** PortSwigger Web Security Academy (free, the best structured web course), OWASP Juice Shop, DVWA, WebGoat, crAPI, Hack The Box, TryHackMe, OverTheWire, picoCTF (Carnegie Mellon University), pwn.college (Arizona State University), Cryptopals challenges.

**Standard books.**

- *Security Engineering*, Ross Anderson (Wiley, 3rd edition 2020; chapters free on the author's site)
- *The Web Application Hacker's Handbook*, Dafydd Stuttard and Marcus Pinto (Wiley, 2nd edition 2011; dated, and continued by the Web Security Academy)
- *The Tangled Web*, Michal Zalewski (No Starch Press, 2011)
- *Threat Modeling: Designing for Security*, Adam Shostack (Wiley, 2014)
- *Serious Cryptography*, Jean-Philippe Aumasson (No Starch Press; 2nd edition 2024)
- *Real-World Cryptography*, David Wong (Manning, 2021)
- *Cryptography Engineering*, Ferguson, Schneier, Kohno (Wiley, 2010)
- *Building Secure and Reliable Systems*, Adkins, Beyer, Blankinship, Lewandowski, Oprea, Stubblefield (O'Reilly, 2020; free at sre.google/books)
- *Alice and Bob Learn Application Security*, Tanya Janca (Wiley, 2020)
- *Web Security for Developers*, Malcolm McDonald (No Starch Press, 2020)
- *Designing Secure Software*, Loren Kohnfelder (No Starch Press, 2021)
- *Real-World Bug Hunting*, Peter Yaworski (No Starch Press, 2019)
- *Hacking: The Art of Exploitation*, Jon Erickson (No Starch Press, 2nd edition 2008)
- *Practical Malware Analysis*, Michael Sikorski and Andrew Honig (No Starch Press, 2012) for defensive analysis
- *Container Security*, Liz Rice (O'Reilly, 2020)
- *Hacking APIs*, Corey Ball (No Starch Press, 2022)

**Defining papers.**

- "The Protection of Information in Computer Systems", Saltzer and Schroeder, Proceedings of the IEEE, 1975 (design principles such as least privilege)
- "New Directions in Cryptography", Diffie and Hellman, IEEE Transactions on Information Theory, 1976
- "A Method for Obtaining Digital Signatures and Public-Key Cryptosystems", Rivest, Shamir, Adleman, Communications of the ACM, 1978
- "Password Security: A Case History", Morris and Thompson, Communications of the ACM, 1979
- "Reflections on Trusting Trust", Ken Thompson, Communications of the ACM, 1984
- "Smashing the Stack for Fun and Profit", Aleph One, Phrack 49, 1996
- "Why Johnny Can't Encrypt", Whitten and Tygar, USENIX Security 1999
- "The Geometry of Innocent Flesh on the Bone: Return-into-libc without Function Calls (on the x86)", Hovav Shacham, ACM CCS 2007
- "Robust Defenses for Cross-Site Request Forgery", Barth, Jackson, Mitchell, ACM CCS 2008
- "SoK: Eternal War in Memory", Szekeres, Payer, Wei, Song, IEEE S&P 2013
- "The Matter of Heartbleed", Durumeric et al., IMC 2014
- "BeyondCorp: A New Approach to Enterprise Security", Ward and Beyer, ;login:, 2014
- "Spectre Attacks: Exploiting Speculative Execution", Kocher et al., IEEE S&P 2019; "Meltdown: Reading Kernel Memory from User Space", Lipp et al., USENIX Security 2018
- "Intelligence-Driven Computer Network Defense Informed by Analysis of Adversary Campaigns and Intrusion Kill Chains", Hutchins, Cloppert, Amin, Lockheed Martin, 2011

Top academic venues: IEEE Symposium on Security and Privacy, USENIX Security, ACM CCS, NDSS. Practitioner venues: Black Hat, DEF CON.

**Courses.** Stanford CS253 Web Security; MIT 6.5660 Computer Systems Security (formerly 6.858); Dan Boneh's Cryptography I; Boneh and Shoup, *A Graduate Course in Applied Cryptography* (free online).

**Engineering blogs and reports.** Google Project Zero; PortSwigger Research; Trail of Bits blog; Google Security Blog; Microsoft Security Response Center; GitHub Security Lab; Cloudflare blog; Mandiant threat research; NCC Group research; Latacora ("Cryptographic Right Answers"); Schneier on Security; Krebs on Security; Troy Hunt; the Verizon Data Breach Investigations Report (annual); the DFIR Report; disclosed reports on HackerOne Hacktivity.

**Organizations whose repositories count as production grade.** OWASP, MITRE, NIST, the OpenSSF and CNCF, Google, GitHub, Trail of Bits, Aqua Security, Semgrep, ProjectDiscovery, Rapid7, HashiCorp, Ory, the Keycloak project.

**Flagship repositories for repo-intel.** Prefer defensive tools and real applications whose security design can be studied.

- Standards as code: `OWASP/CheatSheetSeries`, `OWASP/ASVS`, `OWASP/wstg`
- Lab targets: `juice-shop/juice-shop`, `digininja/DVWA`, `WebGoat/WebGoat`, `OWASP/crAPI`, `vulhub/vulhub`
- Identity and secrets: `keycloak/keycloak`, `ory/kratos`, `ory/hydra`, `hashicorp/vault`, `openbao/openbao`, `getsops/sops`
- Scanners and analysis: `semgrep/semgrep`, `github/codeql`, `aquasecurity/trivy`, `gitleaks/gitleaks`, `trufflesecurity/trufflehog`, `zaproxy/zaproxy`, `projectdiscovery/nuclei`, `google/oss-fuzz`
- Runtime, policy, and detection: `falcosecurity/falco`, `open-policy-agent/opa`, `wazuh/wazuh`, `SigmaHQ/sigma`, `osquery/osquery`, `OISF/suricata`, `zeek/zeek`
- Supply chain: `sigstore/cosign`, `ossf/scorecard`, `anchore/syft`, `anchore/grype`
- Cryptography libraries: `openssl/openssl`, `jedisct1/libsodium`, `pyca/cryptography`, `FiloSottile/age`
- Hardened real applications: `bitwarden/server`, `signalapp/Signal-Android`, `cure53/DOMPurify`, `coreruleset/coreruleset`, `helmetjs/helmet`
- Testing frameworks used in labs only: `rapid7/metasploit-framework`, `nmap/nmap`, `sqlmapproject/sqlmap`

**Where adopters are listed (checked 2026-11-14).** `keycloak/keycloak`, `falcosecurity/falco`, and `open-policy-agent/opa` name their adopters in `ADOPTERS.md` at the repository root. Fetch `https://raw.githubusercontent.com/<org>/<repo>/HEAD/ADOPTERS.md` and record that URL as the evidence for `used_by`. For the other repositories an adopters file at the root was not found or not checked: look on the project's own site or its foundation's project page. Verify again on the day you use it.

**Avoid.** "Hack any account" videos and anything promising access to real systems; exploit dumps and payload lists presented without defence; paste sites and forums trading leaked data; blog posts that fix a vulnerability with a blocklist or regex; outdated advice (MD5 or SHA-1 for passwords, forced periodic password rotation, security questions, the OAuth implicit flow for new apps, storing JWTs wherever is convenient without discussing the trade-off); vendor fear marketing; certification dump sites; tools from unknown authors that need root.

## Lesson recipes

| Kind of concept | Component | Concrete example |
|---|---|---|
| An attack and its defence | `FlowAnimation` | SQL injection in a lab login: the input travels browser → server → query builder → database; toggle "parameterised query" and the same input arrives as harmless data |
| Browser-side attacks | `FlowAnimation` | Stored XSS in the lab app: a script goes into a comment, another user's browser runs it, the cookie tries to leave; toggle output encoding, CSP, and HttpOnly one at a time |
| Protocols | `SequenceDiagram` | TLS 1.3 handshake; OAuth authorization-code flow with PKCE; a CSRF request with and without a token; a passkey login |
| Attack paths and trust | `Graph3D` | A lab network as an attack graph: internet → web server → database; `editable` so the learner adds a firewall rule or removes a credential and sees which paths disappear |
| Threat models | `SystemDiagram` | A data-flow diagram with trust boundaries drawn; each element labelled with its STRIDE threats and the chosen mitigation |
| Sessions, tokens, incidents | `StateMachine` | Session: anonymous → authenticated → elevated → expired or revoked; incident: detect → triage → contain → eradicate → recover → review |
| Vulnerable and fixed code | `CodeWalkthrough` | Side by side: string-built SQL versus a parameterised query; unsafe `innerHTML` versus safe text; a missing ownership check versus the corrected handler |
| Cryptographic parameters | `ParamPlayground` | Password length and character set against guesses needed; hash work factor against cracking time and login time; key size against security level |
| Data and trends | `Chart` | Breach causes from a public annual report; time-to-crack by hash algorithm; alert volume before and after tuning a rule |
| Incidents and history | `Timeline` | A published breach or vulnerability from first flaw to disclosure and patch, using the public post-mortem |
| Static structure | `Mermaid` | Certificate chain, role and permission model, defence-in-depth layers |

**Activities.**

- `PredictReveal`: "This lab query is built with string concatenation and the username field receives a quote character: what does the database see?" "The cookie is set without SameSite and a hidden form posts from another site: does the request carry the cookie?"
- `OrderSteps`: order the TLS handshake, the OAuth code flow, the incident-response phases, the steps of a threat-modeling session
- `MatchPairs`: vulnerability to its primary fix; STRIDE category to an example; security header to what it prevents; control to the layer it protects
- `Quiz`: spot the flaw in a short code sample; choose the right primitive (hash, MAC, encryption, signature) for a need

**3D versus 2D.** Use `Graph3D` for attack graphs, network segmentation, permission and role graphs, and dependency (supply-chain) graphs, where the question is "what can reach what". Use `SequenceDiagram` for every protocol and `CodeWalkthrough` for vulnerable-versus-fixed code; those two carry most of the teaching. Trust boundaries are clearest in a flat `SystemDiagram`.

**Custom simulation ideas.** All simulations run entirely inside the lesson page against simulated data, never against a network target. A toy login with a visible query string that shows injection and the fix; a cookie-flag sandbox with a simulated cross-site request; a CSP builder that shows which simulated scripts are blocked; a JWT inspector that decodes a sample token and flags weak settings; a password-hash work-factor demo; a permission matrix where the learner finds the broken access-control rule; a log viewer where the learner spots the attack lines.

## Mini project patterns

Every project starts its own target with `docker compose up` bound to `127.0.0.1`, and every project ends with the fix and a regression test. `starter/` is the vulnerable or unprotected version; `solution/` is the hardened version plus the test that proves the flaw is closed. Guided → independent.

1. **Find it, fix it, prove it** (guided, 2 h): a small lab web app with one injection flaw; reproduce it locally, replace it with a parameterised query, add a test that fails on the old code. Proves: root-cause fixes. Real use: handling a security bug report.
2. **Password storage done right** (guided, 1–2 h): migrate a lab user table from a fast hash to a modern password hash with per-user salt and upgrade-on-login. Proves: password hashing. Real use: every login system.
3. **Access control review** (semi-guided, 2 h): an API where users can read each other's records by changing an id; add ownership checks and a permission test matrix. Proves: authorization. Real use: the most common serious web flaw.
4. **Harden the browser boundary** (semi-guided, 2 h): add output encoding, a Content Security Policy, secure cookie flags, and security headers to a lab app; verify each with a test. Proves: defence in depth against XSS and CSRF. Real use: any web product.
5. **Threat model a small system** (semi-guided, 2 h): a worksheet (`starter/` blank, `solution/` completed) with a data-flow diagram, trust boundaries, STRIDE threats, and ranked mitigations for a described app. Proves: design-time security. Real use: architecture reviews.
6. **Security checks in CI** (independent, 2 h): add secret scanning, dependency scanning, and static analysis to a repository pipeline with a seeded finding for each; tune out a false positive with a justification. Proves: secure development lifecycle. Real use: every team repository.
7. **Detect the attack** (independent, 2–3 h): generate lab traffic including a simulated attack against the local app, write a log-based detection rule, and measure false positives. Proves: logging and detection. Real use: security operations.
8. **Harden a container** (independent, 2 h): take an image running as root with a full OS and known vulnerable packages; produce a minimal, non-root, scanned image and document the difference. Proves: container security. Real use: production deployments.

READMEs include a "Lab rules" section copied from `## Safety and ethics` and a teardown command.

## Repository analysis focus

| What to find | Where it usually lives |
|---|---|
| Security policy and disclosure process | `SECURITY.md`, security advisories, `docs/security` |
| Threat model and security architecture | design docs, architecture pages, published audits (`audits/`, `docs/audits`) |
| Authentication | login, session, token, MFA, and password-hashing modules; identity-provider integration |
| Authorization | policy or permission modules, middleware and guards, role definitions, policy files (for example Rego) |
| Input handling | validation schemas, sanitisation, output encoding, query construction |
| Cryptography use | which library, which algorithms and modes, key management, randomness sources; no home-made primitives |
| Secrets handling | config loading, secret-store clients, absence of secrets in the repository, `.gitleaks.toml` |
| Security headers and transport | header middleware, TLS configuration, cookie settings, CORS configuration |
| Dependency and supply-chain controls | lockfiles, update bots, pinned actions, SBOM generation, signing, provenance, Scorecard results |
| Static and dynamic analysis in CI | CodeQL, Semgrep, fuzzing harnesses (`fuzz/`), scanners in `.github/workflows/*` |
| Logging and audit trail | audit-log modules, what is logged and what is redacted |
| Rate limiting and abuse controls | throttling, lockout, CAPTCHA or proof-of-work hooks |
| Isolation and least privilege | sandboxing, container user, capabilities, seccomp, network policies |
| Security tests | tests named for past vulnerabilities, regression tests, negative tests |
| Past vulnerabilities | published advisories and the commits that fixed them (study the fix, not just the bug) |

**External services to record as `_tech` notes.** Identity providers, key-management and secret stores, certificate authorities, WAF and CDN, scanning services, logging and SIEM backends, vulnerability databases.

**Findings worth ranking high.** How authorization is centralised instead of scattered, how past advisories were fixed at the root, which defaults are secure out of the box, how the project keeps its supply chain verifiable. For lab-target repositories, record which flaws are intentional so the learner does not copy them.

## Capstone shape

The capstone is a **lab and hardening report**: a small application the learner owns, attacked in a local lab, then hardened, with evidence for each step.

**Production ready means.**

- A local lab that starts with one command, bound to `127.0.0.1`, with a teardown command
- A threat model (`docs/threat-model.md`): assets, data-flow diagram, trust boundaries, ranked threats
- Findings written like a professional report: description, affected component, reproduction in the lab, impact, CWE reference, severity, fix
- Every finding fixed at the root cause in `src/`, with a regression test in `tests/` that fails before the fix
- Hardening baseline: parameterised queries, output encoding, modern password hashing, session and cookie flags, access-control checks, security headers, rate limiting, input validation
- Secrets from the environment; least-privilege database user; non-root container
- CI with secret scanning, dependency scanning, and static analysis, all passing
- Security logging of authentication and authorization events, and one detection rule
- `ARCHITECTURE.md` showing trust boundaries; ADRs for the main security decisions (session versus token, hashing algorithm, authorization model)
- `REPORT.md`: before-and-after summary and remaining risks stated honestly

**Recommended structure.**

```
src/
  domain/         entities
  application/    services; AuthService, AccessPolicy
  infrastructure/ repositories with parameterised queries, PasswordHasher, AuditLogger
  http/           routes, validation, security middleware (headers, rate limit, CSRF)
  config/
lab/              compose file, seed data, the vulnerable baseline for comparison
docs/             threat-model.md, adr/
tests/            unit/, security/ (one regression test per finding)
REPORT.md
```

**Where OOP and SOLID fit.** Security benefits from clear seams: one `AccessPolicy` class that every handler must call (single responsibility, no scattered checks), a `PasswordHasher` interface so the algorithm can be upgraded, an `AuditLogger` injected everywhere. Secure defaults in constructors, validation at the boundary, and small trusted classes that are easy to review are the SOLID ideas that matter here.

**Example capstones.**

- Harden a deliberately weak notes application: threat model, six findings, fixes, tests, report
- Build a secure authentication service: registration, password hashing, sessions, MFA with TOTP, lockout, audit log
- Secure a small API against the OWASP API Security Top 10 with a test for each category
- Container and pipeline hardening for a sample service: minimal image, scanning, signing, policy checks
- Detection lab: instrument an application, simulate three attacks locally, write and tune detection rules

## Recall focus

Worth remembering a year later:

- For each vulnerability class: the wrong assumption, the primary fix, and the defence-in-depth layer
- Decision rules: hash, MAC, encrypt, or sign; session or token and where to store it; which OAuth flow; where a check must live (always the server)
- Principles: least privilege, defence in depth, fail closed, secure defaults, complete mediation, do not trust the client
- The steps of a threat-modeling session and of incident response
- What each common header and cookie flag prevents
- Failure modes: fixing the symptom with a blocklist, checking authentication but not authorization, secrets in repositories, missing logs when an incident happens

Question styles: Explain ("why does a parameterised query stop injection when escaping often fails?"), Compare ("authentication versus authorization", "encryption versus hashing"), Debug ("users report seeing other users' invoices after a release; what class of flaw and where do you look first?"), Decide ("a single-page app needs login: where does the token live and why?"). Phrase every card from the defender's side.

## Safety and ethics

These rules bind every stage. A stage that cannot follow them stops and reports instead of proceeding.

**Authorized targets only.**

- Allowed: the learner's own machines; local containers and virtual machines; intentionally vulnerable applications run locally (OWASP Juice Shop, DVWA, WebGoat, crAPI, vulhub images); training platforms that grant permission by design (PortSwigger Web Security Academy, Hack The Box, TryHackMe, OverTheWire, picoCTF, pwn.college).
- Never: any real third-party website, API, network, device, account, or person, including "just scanning", "just checking", an employer's or school's systems, and shared or public Wi-Fi networks.
- Every command and code sample uses `localhost`, `127.0.0.1`, or a named lab container. No real domain or public IP address appears as a target anywhere in lessons, projects, or notes.

**Lab hygiene.**

- Vulnerable applications bind to `127.0.0.1` on an isolated Docker network, are never exposed to the internet or a shared network, and are removed after the lab. Every README has the teardown command.
- Use generated test data only: no real leaked credentials, breach dumps, or personal data.

**Defensive framing.**

- Each attack is taught with the flaw's root cause, how to detect it, and how to fix it, in the same page or project.
- Exploit steps are the minimum needed to understand and verify the fix, shown against the lab target only.
- Do not produce malware, ransomware, credential stealers, phishing kits, persistence or detection-evasion tooling, or ready-to-use exploit chains for real products. Malware topics are covered through published analyses and defensive detection.
- Social engineering is taught as recognition and defence; no real pretexting or phishing of real people.

**Law and disclosure.**

- Accessing or testing systems without authorization is illegal in most countries regardless of intent. Written permission and a defined scope come first.
- Bug bounty work happens only inside a program's published scope and rules.
- A vulnerability found by accident in a real product is reported privately to the vendor (coordinated disclosure) and is not exploited, shared, or published first.

**Honest limits.** A lab exercise does not make a system "secure"; reports state remaining risks. Security advice changes; check the current OWASP and NIST guidance when notes are reused later.
