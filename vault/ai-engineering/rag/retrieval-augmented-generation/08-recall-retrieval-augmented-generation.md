---
title: "Retrieval-Augmented Generation (RAG) — recall cards"
topic: ai-engineering/rag/retrieval-augmented-generation
stage: recall
tags: [ai-engineering, rag, flashcards]
created: 2026-11-14
---

# Retrieval-Augmented Generation (RAG) — recall cards

## Cards

<!-- card: rag-01 -->
A shop changed its return window last week. Why can a language model on its own not answer a question about the new rule, and what does RAG change so that it can?
?
The model knows only its training data and what is in the prompt; the new rule is in neither. RAG retrieves the passage with the rule and puts it into the prompt, so the model answers from it and can cite it.

<!-- card: rag-02 -->
The question "Can I send my sneakers back?" shares no important word with the chunk "Items can be returned within 14 days". How does the retriever still rank that chunk first?
?
Both texts are turned into embeddings. Similar meaning gives vectors that point in a similar direction, so their cosine similarity is high and the chunk lands in the top k.

<!-- card: rag-03 -->
You build a small RAG pipeline over a handbook. Which steps run once per document change, and which run on every question?
?
Per document change: cut into chunks, embed each chunk, store embedding with text and section name. Per question: embed the question, take the top-k chunks, build the prompt (instruction, chunks, question), generate, then check the citation or refuse.

<!-- card: rag-04 -->
A product manual is 60,000 tokens long and changes every month. RAG, fine-tuning, or pasting the whole manual into the prompt, and why?
?
Paste it whole. It fits in one prompt (far below about 200,000 tokens), so retrieval could only lose information. Fine-tuning changes behaviour and would not keep the facts fresh.

<!-- card: rag-05 -->
The assistant gives a wrong number. The logged prompt contains the chunk with the right number. Is this a retrieval failure or a generation failure, and where is the fix?
?
A generation failure: the right chunk arrived. Fix the prompt (answer only from the sources, cite the section, refuse when not covered). Changing the chunking or the index does not help.

<!-- card: rag-06 -->
The handbook says nothing about warranty, yet an answer about warranty cites three handbook sections. What happened in retrieval, and what guards against it?
?
Top-k ranks chunks and always returns k of them, even weak matches. Guard with a minimum score and a prompt or check that refuses when the chunks do not cover the question.

<!-- card: rag-07 -->
An 8,000-token handbook, top k = 5. Compare chunks of 1,600 tokens with chunks of 200 tokens: what goes wrong at each end?
?
At 1,600 the top 5 chunks are the whole handbook, so nothing was selected. At 200 the prompt is focused, but a small chunk can lose the context that says what it is about and never be retrieved.

<!-- card: rag-08 -->
Users ask about "error code TS-999" and get chunks about error codes in general. What do production systems add next to the embedding index, and why does it work?
?
BM25 keyword search, with the two result lists merged. Embeddings match meaning, so they blur an exact identifier; BM25 matches the exact token.

## Reopen map

| Card | Outcome it covers | Reopen when missed |
|------|-------------------|--------------------|
| rag-01 | Explain why a language model on its own cannot answer questions about private or recent documents, and how adding retrieved text to the prompt fixes that | lesson page `01-why-rag-exists`, listed in [[02-lesson-retrieval-augmented-generation]] |
| rag-02 | Explain how embeddings and cosine similarity choose the top-k chunks for a question | lesson page `02-retrieval-by-meaning`, listed in [[02-lesson-retrieval-augmented-generation]] |
| rag-03 | Build a small RAG pipeline in Python that chunks documents, retrieves the best chunks for a question, and builds a prompt that makes the answer cite its sources | [[03-mini-projects-retrieval-augmented-generation]], project 1 |
| rag-04 | Decide when to use RAG instead of fine-tuning or simply pasting the whole document into the prompt | [[07-final-notes-retrieval-augmented-generation]], section "When to use it / when not to" |
| rag-05 | Diagnose a wrong answer as a retrieval failure or a generation failure, and name the usual fix for each | lesson page `04-rag-in-production`, listed in [[02-lesson-retrieval-augmented-generation]] |
| rag-06 | extra: top-k returns k chunks even when none is relevant | lesson page `02-retrieval-by-meaning`, listed in [[02-lesson-retrieval-augmented-generation]] |
| rag-07 | extra: the chunk size trade-off | lesson page `03-chunking-documents`, listed in [[02-lesson-retrieval-augmented-generation]] |
| rag-08 | extra: the most important production difference, keyword search next to embeddings | [[anthropic-contextual-retrieval-blog-retrieval-augmented-generation]] |

## My insights
