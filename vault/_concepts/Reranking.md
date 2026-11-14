---
title: "Reranking"
topic: shared
stage: concept
tags: [concept]
created: 2026-11-14
---

# Reranking

Reranking is a second scoring step after retrieval: a model reads the question together with each retrieved chunk and gives each chunk a relevance score. Only the best-scored chunks go into the prompt, which costs a little extra time for each question.

## Where it shows up

- [[anthropic-contextual-retrieval-blog-retrieval-augmented-generation|Contextual Retrieval digest]] — the last filter before the prompt
- [[07-final-notes-retrieval-augmented-generation|RAG final notes]] — cutting 150 candidates to 20

## My insights
