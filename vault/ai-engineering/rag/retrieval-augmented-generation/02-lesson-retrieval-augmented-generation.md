---
title: "Retrieval-Augmented Generation (RAG) — lesson"
topic: ai-engineering/rag/retrieval-augmented-generation
stage: lesson
tags: [ai-engineering, rag]
created: 2026-11-14
---

# Retrieval-Augmented Generation (RAG) — interactive lesson

## Open the lesson

The lesson pages live on the local site at
`/ai-engineering/rag/retrieval-augmented-generation/`. Start the site with
`npm run site:dev`, then open that path. Read the pages in order; each one
takes about five minutes. Read the [[01-brief-retrieval-augmented-generation|brief]] first.

## Pages

1. `01-why-rag-exists` — Why a model needs to look things up. A language model
   answers only from its training data and its prompt, so the application must
   fetch the right text and put it in the prompt. Visual: animated flow of one
   question that you can step through, with a retriever you can switch off.
2. `02-retrieval-by-meaning` — Retrieval: finding text by meaning. The retriever
   turns the question and every chunk into points and keeps the k chunks closest
   to the question. Visual: 3D vector space with twelve chunks and a question you
   can drag.
3. `03-chunking-documents` — Chunking: cutting documents into pieces worth
   retrieving. Chunk size is a trade-off between a focused prompt and pieces that
   still make sense alone. Visual: playground with top k and overlap sliders.
4. `04-rag-in-production` — RAG in production: where it breaks and how teams fix
   it. A wrong answer is either a retrieval failure or a generation failure, and
   each has its own fix. Visual: clickable system diagram with the measured
   failure rate of each fix.

## What you can do after it

- Explain why a language model on its own cannot answer questions about private
  or recent documents, and how adding retrieved text to the prompt fixes that.
- Explain how embeddings and cosine similarity choose the top-k chunks for a
  question.
- Decide when to use RAG instead of fine-tuning or pasting the whole document
  into the prompt.
- Diagnose a wrong answer as a retrieval failure or a generation failure, and
  name the usual fix for each.
- Continue with the [[03-mini-projects-retrieval-augmented-generation|mini project]].

## My insights
