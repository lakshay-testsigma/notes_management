# DevOps playbook

Guidance for the stage skills. Each `##` heading is read by one skill; keep the eight headings and their order.

## How this domain is learned

**Prerequisite chain.** A topic may assume everything above it.

1. Linux command line: files, permissions, processes, signals, environment variables, package managers
2. Networking: IP addresses, ports, DNS, TCP, HTTP, TLS, SSH
3. Git and a branching workflow
4. Containers: images, layers, registries, Dockerfile, Compose
5. Continuous integration and delivery: pipelines, artifacts, environments, release strategies
6. Infrastructure as code: declarative state, plan and apply, modules
7. Orchestration: Kubernetes objects, scheduling, services, configuration, rollout
8. Observability: metrics, logs, traces, alerting
9. Reliability practice: SLOs, incident response, postmortems
10. Supply-chain and secrets management

**Beginner misconceptions to correct early.**

- "DevOps is a set of tools." It is a way of working that shortens the path from commit to production and makes it safe; tools serve that.
- "A container is a small virtual machine." It is a normal Linux process with isolated namespaces and limited resources, sharing the host kernel.
- "Kubernetes runs containers." It reconciles declared desired state with actual state; everything is a control loop.
- "CI is the build server." CI is the practice of integrating small changes often with automated checks.
- "Infrastructure as code is scripting." Declarative tools compute a diff between desired and real state; state files and drift are the hard part.
- "Monitoring means dashboards." Alerts on user-facing symptoms (SLOs) matter more than graphs of causes.
- "`latest` is fine." Unpinned versions make builds unrepeatable.
- "Rollback is the safety net." Database migrations and state make rollback hard; plan forward-compatible changes.

**Choosing depth.**

- `quick`: one mechanism or command family (Docker layer caching, `kubectl rollout`, a cron expression, a systemd unit).
- `standard`: one tool or practice (GitHub Actions, Terraform basics, Helm, Prometheus alerting, blue-green deployment).
- `deep`: a pillar (Kubernetes, Docker and container internals, Terraform at team scale, observability, SRE practice).

**Cutting a topic into lesson pages.**

1. The manual pain it removes (the before picture)
2. The core model: desired state, pipeline, or control loop in one picture
3. The smallest working example (one file, one command)
4. What happens step by step when it runs
5. Failure and recovery: a bad deploy, a crashed node, drift
6. Configuration and secrets, and what to monitor
7. How a production project does it (from repo-intel)

## Trusted sources

**Official documentation (tier A candidates).**

- Kubernetes (kubernetes.io/docs), Docker (docs.docker.com), Helm (helm.sh), Argo CD (argo-cd.readthedocs.io), Flux (fluxcd.io)
- Terraform (developer.hashicorp.com/terraform), OpenTofu (opentofu.org), Ansible (docs.ansible.com)
- GitHub Actions (docs.github.com/actions), GitLab CI (docs.gitlab.com)
- Prometheus (prometheus.io/docs), Grafana (grafana.com/docs), OpenTelemetry (opentelemetry.io)
- Cloud provider docs and the AWS Well-Architected Framework
- Linux man pages (man7.org), the GNU Bash manual, systemd documentation, NGINX docs (nginx.org)
- Git documentation and *Pro Git*, Scott Chacon and Ben Straub (free at git-scm.com/book)

**Standards and frameworks.** Open Container Initiative specifications (opencontainers.org); The Twelve-Factor App (12factor.net); SLSA supply-chain levels (slsa.dev); DORA research and the four key metrics (dora.dev); the CNCF project maturity levels (cncf.io); Kubernetes Gateway API (gateway-api.sigs.k8s.io); Principles of Chaos Engineering (principlesofchaos.org).

**Standard books.**

- *Site Reliability Engineering* (O'Reilly, 2016) and *The Site Reliability Workbook* (O'Reilly, 2018), Google; both free at sre.google/books
- *The Phoenix Project*, Gene Kim, Kevin Behr, George Spafford (IT Revolution, 2013)
- *The DevOps Handbook*, Kim, Humble, Debois, Willis (IT Revolution; 2nd edition 2021)
- *Accelerate*, Nicole Forsgren, Jez Humble, Gene Kim (IT Revolution, 2018)
- *Continuous Delivery*, Jez Humble and David Farley (Addison-Wesley, 2010)
- *Kubernetes: Up and Running*, Burns, Beda, Hightower, Evenson (O'Reilly)
- *Kubernetes in Action*, Marko Lukša (Manning)
- *Terraform: Up & Running*, Yevgeniy Brikman (O'Reilly, 3rd edition 2022)
- *Infrastructure as Code*, Kief Morris (O'Reilly, 3rd edition 2025)
- *The Linux Command Line*, William Shotts (No Starch Press; free at linuxcommand.org)
- *How Linux Works*, Brian Ward (No Starch Press)
- *Systems Performance*, Brendan Gregg (Addison-Wesley, 2nd edition 2020)
- *Observability Engineering*, Charity Majors, Liz Fong-Jones, George Miranda (O'Reilly, 2022)
- *Docker Deep Dive*, Nigel Poulton (self-published, updated regularly)

**Defining papers and essays.**

- "Large-scale Cluster Management at Google with Borg", Verma et al., EuroSys 2015
- "Borg, Omega, and Kubernetes", Burns, Grant, Oppenheimer, Brewer, Wilkes, ACM Queue, 2016
- "Dapper, a Large-Scale Distributed Systems Tracing Infrastructure", Sigelman et al., Google technical report, 2010
- "On Designing and Deploying Internet-Scale Services", James Hamilton, LISA 2007
- "Simple Testing Can Prevent Most Critical Failures", Yuan et al., OSDI 2014
- "Monitoring Distributed Systems" (the four golden signals), chapter 6 of *Site Reliability Engineering*
- The USE Method, Brendan Gregg (brendangregg.com); the RED Method, Tom Wilkie
- Martin Fowler's articles on Continuous Integration, Blue-Green Deployment, Canary Release, and Feature Toggles (martinfowler.com)
- `kelseyhightower/kubernetes-the-hard-way` (tier B tutorial by a recognised practitioner; updated rarely, so confirm it matches the current Kubernetes release)

**Engineering blogs.** Google SRE (sre.google); Kubernetes blog; CNCF blog; Netflix Tech Blog; Cloudflare blog and its incident write-ups; GitHub Engineering and GitHub availability reports; GitLab handbook and blog; AWS Builders' Library; Grafana Labs blog; Honeycomb blog; HashiCorp blog; Brendan Gregg's site; Julia Evans (jvns.ca) for Linux and networking; `danluu/post-mortems` as an index of public postmortems.

**Organizations whose repositories count as production grade.** The Kubernetes project and SIGs, CNCF graduated and incubating projects, the Linux Foundation (including OpenTofu), HashiCorp, Docker and Moby, Grafana Labs, Prometheus, Red Hat (Ansible), Google Cloud Platform sample teams.

**Flagship repositories for repo-intel.**

- `GoogleCloudPlatform/microservices-demo`: Online Boutique, the standard multi-service demo with manifests and CI
- `open-telemetry/opentelemetry-demo`: a full system instrumented with traces, metrics, logs
- `argoproj/argo-cd`: GitOps controller, also a model of release engineering
- `prometheus/prometheus` and `grafana/loki`: how observability backends are built and shipped
- `kubernetes/kubernetes`: slice one controller (for example the deployment controller), never the whole tree
- `helm/helm`, `opentofu/opentofu`, `hashicorp/terraform`: CLIs with plugin and state models
- `terraform-aws-modules/terraform-aws-vpc`: a widely used, well-structured Terraform module
- `aquasecurity/trivy`, `hadolint/hadolint`: scanners used inside pipelines
- `kubernetes-sigs/kind`, `k3s-io/k3s`: local and lightweight clusters

**Where adopters are listed (checked 2026-11-14).** `argoproj/argo-cd` names its users in `USERS.md`; `grafana/loki`, `helm/helm`, and `k3s-io/k3s` in `ADOPTERS.md`, all at the repository root. Fetch `https://raw.githubusercontent.com/<org>/<repo>/HEAD/<file>` and record that URL as the evidence for `used_by`. For the other repositories an adopters file at the root was not found or not checked: look on the project's own site or its foundation's project page. Verify again on the day you use it.

For this domain the most valuable files are not source code: read `.github/workflows/`, `Dockerfile`, `Makefile`, Helm charts, and release scripts of any mature project.

**Avoid.** Kubernetes tutorials written for versions several releases old (removed APIs such as `extensions/v1beta1`, Docker-shim, PodSecurityPolicy); guides that recommend `ingress-nginx` for new work (the project was retired in March 2026; teach Gateway API or a maintained controller); "curl this script and pipe to bash" setups; tutorials that hard-code cloud keys or use the root account; certification brain dumps; vendor blogs comparing tools where the vendor wins; abandoned Helm charts and unpinned GitHub Actions from unknown authors. Note licenses: Terraform is under the Business Source License since 2023; OpenTofu is the open-source fork.

## Lesson recipes

| Kind of concept | Component | Concrete example |
|---|---|---|
| Pipelines | `FlowAnimation` | A commit moves through lint → test → build image → scan → push → deploy; learner breaks a test and sees the pipeline stop |
| Rollout strategies | `FlowAnimation` | Rolling, blue-green, and canary: traffic packets shift between old and new pods; learner injects a bad version and triggers rollback |
| Control loops | `FlowAnimation` | Kubernetes reconciliation: desired 3 replicas, learner deletes a pod, the controller recreates it |
| Cluster topology | `Graph3D` | Control plane, nodes, pods, services; `editable` so the learner adds a node, schedules pods, and connects a service |
| Dependency graphs | `Graph3D` | Terraform resource graph for a VPC: change one resource and see what must be replaced |
| Object and process lifecycles | `StateMachine` | Pod: Pending → Running → Succeeded or Failed → CrashLoopBackOff; incident: detected → mitigated → resolved → reviewed |
| Ordered interactions | `SequenceDiagram` | `kubectl apply`: client → API server → etcd → scheduler → kubelet → container runtime; a TLS certificate issuance |
| Infrastructure layout | `SystemDiagram` | VPC with public and private subnets, load balancer, cluster, database, and registry |
| Tunables and budgets | `ParamPlayground` | SLO target and request volume give the error budget in minutes; autoscaler target utilisation against replica count |
| Config files line by line | `CodeWalkthrough` | A multi-stage Dockerfile; a GitHub Actions workflow; a Deployment manifest; a Terraform module |
| Metrics | `Chart` | Image size before and after multi-stage build; error rate and latency during a canary; burn-rate graph |
| History and incidents | `Timeline` | The timeline of a public postmortem: trigger, detection, mitigation, fix |
| Static structure | `Mermaid` | Layers of an image, namespaces, a GitOps repository layout |

**Activities.**

- `PredictReveal`: "This Dockerfile copies source before `npm ci`. What happens to the cache when one line of code changes?" "The readiness probe fails on 1 of 3 pods: does the Service still send it traffic?"
- `OrderSteps`: order a deployment pipeline, an incident response, a `terraform` workflow
- `MatchPairs`: Kubernetes object to job, signal to its meaning, golden signal to an example metric
- `Quiz`: choose a release strategy for a risk level; choose where a secret should live

**3D versus 2D.** Use `Graph3D` for cluster topology, network layout, and resource dependency graphs, where grouping by layer or zone matters and the learner benefits from building. Use `FlowAnimation` for pipelines and rollouts, and `CodeWalkthrough` for configuration, which is most of the daily work. Do not use 3D for a linear pipeline.

**Custom simulation ideas.** A scheduler game where the learner places pods on nodes under resource limits; a layer-cache simulator for Dockerfile edits; an error-budget burn simulator; a DNS resolution walk; a "terraform plan" diff viewer for small edits; a namespace and cgroup explorer showing what a container can see.

**Visual recipes** (visual-first plans; standard in `harness/rubrics/visuals.md`):

- A registered deployment `Diagram` (build, registry, cluster, ingress, monitoring) as the end-to-end workflow of CI/CD topics.
- `ClusterSim` in `load-balance` mode for health checks, rolling updates and failing instances.
- `Video` for a deployment rollout or a request through ingress, service and pod; `StateMachine` for a pod lifecycle.
- `CodePlayground` or `CodeWalkthrough` for configuration; `CompareView` for blue-green versus canary.

## Mini project patterns

All run locally (Docker, kind, LocalStack) unless the learner asks for a real cloud. Guided → independent.

1. **Containerise a real service well** (guided, 1–2 h): multi-stage Dockerfile, non-root user, health check, small image, Compose with a database. Proves: image layers and runtime configuration. Real use: every deployable service.
2. **CI pipeline from zero** (guided, 2 h): GitHub Actions workflow with lint, test, build, cache, and image scan on pull requests. Proves: fast feedback and gating. Real use: every team repository.
3. **Deploy to local Kubernetes** (semi-guided, 2–3 h): Deployment, Service, ConfigMap, Secret, probes on kind; then a rolling update and a rollback. Proves: desired state and rollout. Real use: shipping a service.
4. **Infrastructure as code for one environment** (semi-guided, 2–3 h): Terraform or OpenTofu module that creates a network, a bucket, and a queue on LocalStack, with variables and outputs. Proves: plan, apply, state, drift. Real use: reproducible environments.
5. **Observe a service** (semi-guided, 2–3 h): Prometheus scraping, a Grafana dashboard of the four golden signals, one alert rule. Proves: symptom-based alerting. Real use: on-call readiness.
6. **GitOps loop** (independent, 3 h): Argo CD or Flux on kind syncing manifests from a git repository; a change is deployed by a commit. Proves: pull-based delivery and audit trail. Real use: multi-environment delivery.
7. **Break and recover** (independent, 2 h): inject a failing release, a full disk, or a killed node; detect it from metrics; write a blameless postmortem. Proves: incident handling. Real use: reliability practice.
8. **Harden the pipeline** (independent, 2 h): pin action versions by SHA, add secret scanning and an SBOM, sign the image. Proves: supply-chain basics. Real use: compliance and security reviews.

Every README ends with a teardown section (`docker compose down -v`, `kind delete cluster`, `terraform destroy` against LocalStack).

## Repository analysis focus

| What to find | Where it usually lives |
|---|---|
| Build system | `Makefile`, `Taskfile.yml`, `hack/`, `scripts/`, `build/` |
| CI pipelines and gates | `.github/workflows/*`, `.gitlab-ci.yml`, required checks, caching, matrix builds |
| Container build | `Dockerfile*`, `.dockerignore`, base image choice, multi-stage use, non-root user |
| Release process | release workflows, `CHANGELOG`, version tagging, `goreleaser` config, release docs |
| Deployment manifests | `deploy/`, `charts/`, `manifests/`, `kustomize/`, Helm `values.yaml` |
| Infrastructure code | `terraform/`, `infra/`, modules, backends, variable files |
| Configuration and secrets | config schema, env docs, secret references, sealed or external secrets |
| Rollout safety | probes, PodDisruptionBudgets, resource requests and limits, autoscaling, canary analysis |
| Observability | metrics endpoints, dashboards in `dashboards/`, alert rules, tracing setup |
| Testing strategy | unit, integration, end-to-end test clusters (`test/e2e`), conformance tests, flaky-test handling |
| Supply-chain security | dependency update bots, image scanning, signing, SBOM, pinned action SHAs, `SECURITY.md` |
| Operational docs | runbooks, upgrade guides, `docs/operations`, incident docs |
| Governance | `CODEOWNERS`, contribution guide, branch protection hints |

**External services and infrastructure to record as `_tech` notes.** Container registry, CI provider, cloud provider services, DNS and certificate providers, artifact stores, secret managers, monitoring backends, chat and paging integrations.

**Findings worth ranking high.** How the pipeline stays fast (caching, test splitting), how releases are made repeatable, how they prevent a bad deploy from reaching all users, how secrets never touch the repository.

## Capstone shape

The capstone is a delivery pipeline and platform for one small service: the value is in the automation around the code, not the code itself.

**Production ready means.**

- One command brings the whole environment up locally and one command tears it down
- A CI workflow: lint (hadolint, actionlint, `terraform validate`), unit tests, image build, vulnerability scan, and a deploy job
- Immutable, versioned images tagged with the git SHA; no `latest`
- Declarative deployment (Kubernetes manifests or Helm chart) with probes, resource limits, and a rollback path
- Configuration separated from code; secrets from a secret store or the CI secret store, never in git
- Metrics, logs, a dashboard, and at least one SLO with an alert
- A runbook (`docs/runbook.md`) and one postmortem from a rehearsed failure
- `ARCHITECTURE.md` with the pipeline and environment diagram; ADRs for the main tool choices
- `tests/`: smoke tests against the deployed service (bats or a small script) and policy checks

**Recommended structure.**

```
src/            the small service being shipped (keep it simple)
tests/          unit tests for the service, smoke tests for the deployment
deploy/
  docker/       Dockerfile, compose.yaml
  k8s/          base/ and overlays/ or a Helm chart
infra/          Terraform or OpenTofu modules and environments
.github/workflows/   ci.yml, release.yml
observability/  prometheus rules, grafana dashboards
docs/           runbook.md, adr/
```

**Where OOP and SOLID fit.** Mostly they do not: this domain is declarative configuration. Apply the equivalent ideas instead: single responsibility per module, chart, and workflow job; small reusable modules with explicit inputs and outputs; no duplication between environments (use overlays or variables); everything idempotent. Use classes only inside the sample service.

**Example capstones.**

- Zero-downtime delivery platform for a URL-shortener service: CI, kind cluster, canary rollout, dashboard, alert
- Self-hosted preview environments: every pull request gets its own namespace and URL, removed on merge
- "Golden path" service template: a repository template with Dockerfile, CI, chart, and observability wired in
- Backup and restore drill for a PostgreSQL service with a measured recovery time
- Cost- and security-checked infrastructure module set with policy checks in CI

## Recall focus

Worth remembering a year later:

- Mental models: container equals isolated process; Kubernetes equals reconciliation loops; IaC equals desired state plus diff
- Decision rules: rolling, blue-green, or canary; when to use Kubernetes at all; push versus pull deployment
- Failure modes: CrashLoopBackOff causes, image pull errors, state drift, cache-busting Dockerfile order, alert fatigue
- Definitions with numbers: SLI, SLO, error budget; the four golden signals; the four DORA metrics
- Commands that pay rent: `docker build/run/logs/exec`, `kubectl get/describe/logs/rollout`, `terraform init/plan/apply`, `git` recovery commands

Question styles: Explain ("why does order of lines in a Dockerfile change build time?"), Compare ("readiness versus liveness probe"), Debug ("pod is in CrashLoopBackOff; which three commands, in order?"), Decide ("a risky schema change must ship: which rollout strategy and why?"). Command cards ask for the command given the goal.

## Safety and ethics

- Local first. Real cloud resources only when the learner asks, inside free-tier limits, with a budget alert and the teardown command in the README.
- Never put credentials in repositories, images, Terraform state committed to git, or CI logs. Use the CI secret store and least-privilege, short-lived credentials.
- Destructive commands (`rm -rf`, `kubectl delete`, `terraform destroy`, `docker system prune`) appear only with an explicit scope and a warning sentence, and only against disposable local environments.
- Never disable TLS verification or run containers as root "to make it work" without stating the risk and the proper fix.
- **Experience recipes** (adaptive plans; `harness/rubrics/experiences.md`, the selector decides): explainer for a deploy pipeline; interactive for rollout percentages and health checks (ClusterSim load-balance); branching for blue-green vs canary vs rolling; hybrid for incident response with failures and rollbacks.
