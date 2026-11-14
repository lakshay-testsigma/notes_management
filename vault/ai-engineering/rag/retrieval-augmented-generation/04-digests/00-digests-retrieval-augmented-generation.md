---
title: "Retrieval-Augmented Generation (RAG) — digests"
topic: ai-engineering/rag/retrieval-augmented-generation
stage: digest
tags: [ai-engineering, rag]
created: 2026-11-14
sources: [lewis-2020-rag, anthropic-contextual-retrieval-blog]
---

# Retrieval-Augmented Generation (RAG) — digests

These are the sources worth reading in full one day, each reduced to a ten-minute note. Read
them in this order.

1. [[lewis-2020-rag-retrieval-augmented-generation|Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks]] — it comes first because it introduced and named RAG: a generator that retrieves Wikipedia passages through a dense retriever answers knowledge questions better than a model working from memory alone.
2. [[anthropic-contextual-retrieval-blog-retrieval-augmented-generation|Introducing Contextual Retrieval]] — it extends the first: it repairs the retrieval step, where chunking loses context, and measures that a short context note per chunk plus BM25 cuts failed retrievals by 49%, and by 67% with reranking.

Back to the map: [[00-start-here-retrieval-augmented-generation|Start here]].

## My insights
