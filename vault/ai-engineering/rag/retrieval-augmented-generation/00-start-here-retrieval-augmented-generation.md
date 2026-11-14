---
title: "Retrieval-Augmented Generation (RAG) — start here"
topic: ai-engineering/rag/retrieval-augmented-generation
stage: map
tags: [ai-engineering, rag]
created: 2026-11-14
---

# Retrieval-Augmented Generation (RAG) — start here

This is the map of the topic. Read the steps from top to bottom. Each step links to the next thing to open, so you never have to search.

<!-- tutor:generated:start -->
**Depth:** quick · **Progress:** 8 of 8 steps ready

Retrieval-augmented generation (RAG) is a way to make a language model answer from documents it was never trained on: the application first finds the few most relevant passages, then puts them into the prompt so the model writes its answer from them.

## Read in this order

1. [[01-brief-retrieval-augmented-generation|Brief]] — what it is, why it exists, where it is used · *ready*
2. [[02-lesson-retrieval-augmented-generation|Interactive lesson]] — the animated lesson pages on the local site · *ready*
3. [[03-mini-projects-retrieval-augmented-generation|Mini projects]] — small builds with a real use case · *ready*
4. [[00-digests-retrieval-augmented-generation|Digests]] — short summaries of the key papers and docs · *ready*
5. Repository deep dive — not part of this topic at its depth (quick). To add it: `/learn retrieval-augmented-generation --depth standard`.
6. Capstone — not part of this topic at its depth (quick). To add it: `/learn retrieval-augmented-generation --depth standard`.
7. [[07-final-notes-retrieval-augmented-generation|Final notes]] — the one-page refresher · *ready*
8. [[08-recall-retrieval-augmented-generation|Recall cards]] — flashcards for spaced review · *ready*
9. [[09-resources-retrieval-augmented-generation|Resources]] — the vetted sources behind everything above · *ready*

Your own additions live in [[my-insights-retrieval-augmented-generation|My insights]].

## Open the lesson

Run `npm run site:dev` in the repository root, then open `/ai-engineering/rag/retrieval-augmented-generation/` on the local address it prints.

## Before you start

- **Large language model** (new for you) — A large language model is a program that continues text one small piece at a time; it only knows what was in its training data, which stopped at a fixed date and did not include your private files.
- **Context window** (new for you) — The context window is all the text a model can read in one call (your instructions plus anything you paste in); the model forgets everything outside it.
- **Embedding** (new for you) — An embedding is a list of numbers that stands for the meaning of a piece of text, so that texts with similar meaning get lists of numbers that are close together.
- **Python basics** (new for you) — The project uses plain Python: functions, lists, dictionaries, and reading a text file are enough.

## What you will be able to do

- Explain why a language model on its own cannot answer questions about private or recent documents, and how adding retrieved text to the prompt fixes that.
- Explain how embeddings and cosine similarity choose the top-k chunks for a question.
- Build a small RAG pipeline in Python that chunks documents, retrieves the best chunks for a question, and builds a prompt that makes the answer cite its sources.
- Decide when to use RAG instead of fine-tuning or simply pasting the whole document into the prompt.
- Diagnose a wrong answer as a retrieval failure or a generation failure, and name the usual fix for each.

## Lesson pages

1. Why a model needs to look things up — `/ai-engineering/rag/retrieval-augmented-generation/lesson/01-why-rag-exists/`
2. Retrieval: finding text by meaning — `/ai-engineering/rag/retrieval-augmented-generation/lesson/02-retrieval-by-meaning/`
3. Chunking: cutting documents into pieces worth retrieving — `/ai-engineering/rag/retrieval-augmented-generation/lesson/03-chunking-documents/`
4. RAG in production: where it breaks and how teams fix it — `/ai-engineering/rag/retrieval-augmented-generation/lesson/04-rag-in-production/`

## Projects

- Mini project: `projects/ai-engineering/rag/retrieval-augmented-generation/mini-01-handbook-qa/`

## Build status

| Wave | Stage | Status |
|------|-------|--------|
| 0 | intake | ready |
| 1 | research | ready |
| 1 | brief | ready |
| 2 | digest | ready |
| 2 | repo-intel | skipped |
| 3 | lesson | ready |
| 3 | mini-projects | ready |
| 4 | capstone | skipped |
| 5 | notes | ready |
| 5 | finalize | ready |

Everything is generated. Review due cards with `node harness/bin/tutor.mjs recall due retrieval-augmented-generation`.
<!-- tutor:generated:end -->

## My insights
