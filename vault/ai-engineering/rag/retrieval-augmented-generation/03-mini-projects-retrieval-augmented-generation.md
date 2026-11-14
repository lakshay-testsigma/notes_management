---
title: "Retrieval-Augmented Generation (RAG) — mini projects"
topic: ai-engineering/rag/retrieval-augmented-generation
stage: mini-projects
tags: [ai-engineering, rag]
created: 2026-11-14
---

# Retrieval-Augmented Generation (RAG) — mini projects

## How to use these projects

This topic has one project. Start in the `starter/` folder, run the tests, and
make them pass one task at a time. Open `solution/` only after your tests pass
or after you have used the hints. It runs offline: there is no API key and no
paid model. Read the [[02-lesson-retrieval-augmented-generation|lesson]] first.

## Projects

| # | Project | Real use case | Time | Guidance | Open |
|---|---------|---------------|------|----------|------|
| 1 | Handbook questions answered with a cited section, or refused | A new employee asks the company handbook, and the people team needs every answer to name the section it came from or to say the handbook does not cover it | 2 h | guided | `projects/ai-engineering/rag/retrieval-augmented-generation/mini-01-handbook-qa/README.md` |

## What each project proves

- **Project 1** proves grounding: the answer is built only from retrieved text,
  it cites that text, and the program refuses when retrieval finds nothing or
  the citation does not match a retrieved section. Related: [[Chunking]],
  [[Embedding]], [[Hallucination]].

**Note.** To run offline, the project uses two stand-ins: an `embed` function
that counts words instead of a real embedding model, and an `OfflineModel` that
copies the best handbook sentence instead of a language model. The pipeline
around them (chunk, retrieve, build the prompt, check the citation, refuse) is
the real one.

## My insights
