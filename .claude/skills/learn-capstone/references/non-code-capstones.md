# Capstones that are not a service

Read this when `stages.capstone.kind` in the domain's `pack.json` is not a
plain code project, or when the playbook's `## Capstone shape` redefines the
deliverable. The playbook wins over this file: it says what "production ready"
means in its domain.

## 1. Which kind is it?

| `kind` in `pack.json` | What the capstone is | Class-based structure applies to |
|-----------------------|----------------------|----------------------------------|
| `service`, `web-app`, `mobile-app`, `game` | A program. Follow the main steps of `SKILL.md`. | the whole project, with the layer names of the playbook |
| `pipeline` | Data or deployment steps that run in order | the Python or TypeScript code around the steps; not SQL, YAML, or shell |
| `model` | A trained and evaluated model | the training and evaluation code (dataset, model, trainer, evaluator classes) |
| `analysis-report` | An analysis with a written conclusion | the reusable calculation code, if there is any |
| `lab-and-hardening-report` | A local lab, the findings, and the fixes | the lab tooling and the regression tests |
| `case-study` | A written study built on public evidence | nothing, unless a calculation or simulation is included |

If the kind is not in this table, follow the playbook and use the nearest row.

## 2. Mapping the deliverable onto the gate files

The gate checks for the same names in every domain. Put the work where the
gate expects it, and say in `README.md` how the folders are used.

| Gate file | Code project | Report, case study, lab, or analysis |
|-----------|--------------|--------------------------------------|
| `README.md` | the problem, how to run, how to test | the question, the answer in three sentences, how to read or rerun the work |
| `ARCHITECTURE.md` | layers and classes | the structure of the work: its parts, how evidence flows into conclusions, one mermaid diagram |
| `docs/adr/0001-*.md` | the main design decision | the main decision of method (which data, which model, which framework of analysis) and its alternatives |
| `src/` | source code | the working material: data files, notebooks, queries, lab setup, scripts, and the report itself as `src/report.md` |
| `tests/` | unit and integration tests | the checks: tests of every calculation, a script that verifies the lab is fixed, or `tests/acceptance-checklist.md` with each item answered and its evidence |
| `06-capstone-<slug>.md` | architecture summary | summary of the question, the method, the result, and how to extend the work |

## 3. Rules that still hold

- **It solves a real problem.** The plan's `capstone.problem` is the question
  the deliverable answers.
- **It applies at least three things from the research.** When the `repo-intel`
  stage exists, they come from the takeaways and findings. When it does not
  (the `general` domain switches it off), they come from the digests, and
  `## Borrowed from production` is renamed in spirit only: keep the heading,
  and list three practices from the digests with the digest note each comes
  from.
- **It can be checked.** Something in `tests/` can be run or ticked off by the
  learner to confirm the work is right. Run every runnable check before
  finishing.
- **Every number has a source.** In reports and case studies, each figure
  names the source id it comes from, and public information only is used.
- **It is honest about structure.** Apply classes only to code that has state
  and behavior. Do not wrap a report or a SQL file in classes. Write one short
  paragraph in `ARCHITECTURE.md`, under "Object-oriented ideas and where they
  are used", that begins "Where classes do not fit" and gives the reason.
- **It follows the safety list.** Read `safety` in `pack.json` and
  `## Safety and ethics` in the playbook. A security lab runs only against
  targets the project starts on the local machine, and every attack exercise
  ends with the fix and a regression test.

## 4. `ARCHITECTURE.md` for a report-style capstone

Keep the same headings as for a code project, with this content:

| Heading | Content for a report, study, or lab |
|---------|-------------------------------------|
| `## Overview` | The question, the answer, and who would use it. |
| `## Layers` | A mermaid diagram of the stages of the work: sources → cleaning or setup → analysis → findings → recommendation. |
| `## Classes and their responsibilities` | A table of the parts of the work (each file or notebook) with its single responsibility. Name classes only where code has them. |
| `## Request flow` | How one piece of evidence travels from its source to a conclusion. |
| `## Object-oriented ideas and where they are used` | Where classes are used, and the paragraph "Where classes do not fit". |
| `## Borrowed from production` | At least three practices, each with the note it comes from and the file where it is applied. |
| `## Error handling, configuration, logging` | How wrong or missing data is detected, what is configurable, and what is recorded when the work is rerun. |
| `## How to extend it` | Three concrete next questions or improvements. |
