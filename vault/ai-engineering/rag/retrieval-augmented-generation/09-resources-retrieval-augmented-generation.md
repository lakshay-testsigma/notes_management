---
title: "Retrieval-Augmented Generation (RAG) — resources"
topic: ai-engineering/rag/retrieval-augmented-generation
stage: resources
tags: [ai-engineering, rag]
created: 2026-11-14
---

# Retrieval-Augmented Generation (RAG) — resources

Every source below was checked against a live page before it was recommended.

<!-- tutor:generated:start -->
**6 vetted sources.** Tier A is canonical (official docs, the defining paper, the standard book, the reference implementation). Tier B is strong and widely used.

## Official documentation

- **[Introduction to RAG](https://developers.llamaindex.ai/python/framework/understanding/rag/)** — LlamaIndex, 2026 · tier B
  - Why it is trusted: The official developer documentation of LlamaIndex, a major open-source RAG framework, on the project's own domain (the homepage listed by its GitHub repository); it explains the general concept of RAG and its five stages, which LlamaIndex did not create.
  - Used for: brief, lesson
  - Verified: 2026-11-14
- **[Optimizing LLM Accuracy](https://developers.openai.com/api/docs/guides/optimizing-llm-accuracy)** — OpenAI, 2026 · tier B
  - Why it is trusted: The official OpenAI developer guide on choosing between prompting, RAG, and fine-tuning, on OpenAI's own documentation domain; a major model provider explaining a general decision it did not invent.
  - Used for: lesson
  - Verified: 2026-11-14

## Papers

- **[Dense Passage Retrieval for Open-Domain Question Answering](https://aclanthology.org/2020.emnlp-main.550/)** — Vladimir Karpukhin, Barlas Oguz, Sewon Min, Patrick Lewis, Ledell Wu, Sergey Edunov, Danqi Chen, Wen-tau Yih, 2020 · tier A
  - Why it is trusted: The EMNLP 2020 paper that showed retrieval with learned dense embeddings beats keyword search for question answering; it is the retriever used inside the original RAG model and is cited more than 5,000 times.
  - Used for: lesson
  - Verified: 2026-11-14
- **[Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401)** — Patrick Lewis, Ethan Perez, Aleksandra Piktus, Fabio Petroni, Vladimir Karpukhin, Naman Goyal, Heinrich Küttler, Mike Lewis, Wen-tau Yih, Tim Rocktäschel, Sebastian Riedel, Douwe Kiela, 2020 · tier A
  - Why it is trusted: The paper that introduced and named retrieval-augmented generation, from Facebook AI Research, published in the NeurIPS 2020 proceedings and cited more than 6,000 times.
  - Used for: brief, digest, lesson
  - Verified: 2026-11-14
  - Digest: [[lewis-2020-rag-retrieval-augmented-generation|read the digest]]

## Books

- **[AI Engineering](https://github.com/chiphuyen/aie-book)** — Chip Huyen, 2025 · tier A
  - Why it is trusted: The O'Reilly Media book (2025) that the AI engineering playbook names as the primary text of the field; it has a chapter on RAG and agents. The book is paid, so the link goes to the author's free companion repository.
  - Used for: lesson
  - Verified: 2026-11-14

## Engineering blogs

- **[Introducing Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval)** — Anthropic engineering team (research and writing by Daniel Ford), 2024 · tier A
  - Why it is trusted: Written by the Anthropic team that created Contextual Retrieval, on Anthropic's own site; it is the primary description of the technique and reports measured retrieval failure rates for embeddings, BM25, and reranking.
  - Used for: digest, lesson
  - Verified: 2026-11-14
  - Digest: [[anthropic-contextual-retrieval-blog-retrieval-augmented-generation|read the digest]]
<!-- tutor:generated:end -->

## My insights
