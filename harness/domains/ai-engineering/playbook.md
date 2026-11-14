# AI Engineering playbook

Guidance for the stage skills. Each `##` heading is read by one skill; keep the eight headings and their order.

## How this domain is learned

AI engineering is building products on top of existing foundation models. How the models are trained belongs to the `core-ai` domain; link there instead of re-teaching it.

**Prerequisite chain.** A topic may assume everything above it.

1. Python, HTTP APIs, JSON, environment variables
2. What an LLM does at the interface: tokens, context window, sampling, cost and latency per token
3. Prompting: instructions, examples, structured output
4. Embeddings and vector search
5. Retrieval-augmented generation: chunking, retrieval, reranking, grounding
6. Tool use (function calling) and the Model Context Protocol
7. Agents: the loop, the harness, context management, memory
8. Evaluation: datasets, graders, regression tests
9. Production: tracing, cost, latency, guardrails, security
10. Adaptation: fine-tuning and distillation, and when they beat retrieval

**Beginner misconceptions to correct early.**

- "The model remembers the conversation." It is stateless; the application resends context every call. Memory is something the harness builds.
- "RAG means a vector database." Retrieval quality depends on chunking, hybrid search, and reranking; the store is the easy part.
- "An agent is a special kind of model." An agent is a loop: model call, tool call, result appended, repeat, with a stop condition.
- "A better prompt fixes everything." Most failures are missing context, missing tools, or no evaluation.
- "It worked on my three examples." Without an evaluation set, a change cannot be called an improvement.
- "Temperature 0 is deterministic and factual." It reduces variance; it does not make the model correct.
- "Fine-tuning teaches the model facts." It changes behaviour and format; fresh or private facts belong in retrieval.
- "More context is better." Long contexts cost money, add latency, and dilute attention; select and compress.
- "Tool output is trustworthy." Retrieved text and tool results can carry instructions (prompt injection).

**Choosing depth.**

- `quick`: one technique (few-shot prompting, structured outputs, prompt caching, reciprocal rank fusion).
- `standard`: one building block (embeddings and vector search, function calling, an MCP server, LLM-as-judge evals).
- `deep`: a pillar (RAG end to end, agents and harness design, agent memory, evaluation).

**Cutting a topic into lesson pages.**

1. The task that plain prompting cannot do
2. The mental model in one picture (the loop, the pipeline, the graph)
3. The smallest working version, in about 30 lines
4. What actually goes into the context window at each step
5. Failure modes and how to see them in a trace
6. How to measure it (the evaluation)
7. Cost, latency, and safety in production; how a real system does it

## Trusted sources

Model and API details change monthly. For anything about a specific model, price, limit, or SDK call, the official provider documentation fetched today is the only acceptable source.

**Official documentation (tier A candidates).**

- Anthropic developer documentation for Claude and the Anthropic engineering blog
- OpenAI platform documentation (platform.openai.com/docs) and the OpenAI Cookbook (cookbook.openai.com)
- Google Gemini API documentation (ai.google.dev)
- Model Context Protocol specification and docs (modelcontextprotocol.io)
- Hugging Face documentation and courses (huggingface.co/docs, huggingface.co/learn)
- Framework docs: LangChain and LangGraph, LlamaIndex, DSPy (dspy.ai), Pydantic AI (pydantic.dev/pydantic-ai), Vercel AI SDK (ai-sdk.dev)
- Retrieval and serving docs: pgvector, Qdrant, Weaviate, Chroma, Milvus, FAISS wiki, vLLM (docs.vllm.ai), Ollama, llama.cpp
- Evaluation and tracing docs: Inspect (UK AI Security Institute), OpenAI Evals, Ragas, promptfoo, Langfuse, Arize Phoenix

**Standards and frameworks.** OWASP Top 10 for LLM Applications (genai.owasp.org); NIST AI Risk Management Framework (nist.gov); MTEB embedding benchmark leaderboard on Hugging Face.

**Standard books.**

- *AI Engineering*, Chip Huyen (O'Reilly, 2025): the primary text for this domain
- *Designing Machine Learning Systems*, Chip Huyen (O'Reilly, 2022)
- *Hands-On Large Language Models*, Jay Alammar and Maarten Grootendorst (O'Reilly, 2024)
- *Build a Large Language Model (From Scratch)*, Sebastian Raschka (Manning, 2024)
- *Prompt Engineering for LLMs*, John Berryman and Albert Ziegler (O'Reilly, 2024)
- *Natural Language Processing with Transformers*, Tunstall, von Werra, Wolf (O'Reilly, 2022)

**Defining papers.**

- "Attention Is All You Need", Vaswani et al., NeurIPS 2017
- "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks", Lewis et al., NeurIPS 2020
- "Dense Passage Retrieval for Open-Domain Question Answering", Karpukhin et al., EMNLP 2020
- "Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks", Reimers and Gurevych, EMNLP 2019
- "Efficient and Robust Approximate Nearest Neighbor Search Using Hierarchical Navigable Small World Graphs" (HNSW), Malkov and Yashunin, IEEE TPAMI
- "The Probabilistic Relevance Framework: BM25 and Beyond", Robertson and Zaragoza, Foundations and Trends in Information Retrieval, 2009
- "Reciprocal Rank Fusion Outperforms Condorcet and Individual Rank Learning Methods", Cormack, Clarke, Büttcher, SIGIR 2009
- "ColBERT: Efficient and Effective Passage Search via Contextualized Late Interaction over BERT", Khattab and Zaharia, SIGIR 2020
- "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models", Wei et al., NeurIPS 2022
- "ReAct: Synergizing Reasoning and Acting in Language Models", Yao et al., ICLR 2023
- "Reflexion: Language Agents with Verbal Reinforcement Learning", Shinn et al., NeurIPS 2023
- "Generative Agents: Interactive Simulacra of Human Behavior", Park et al., UIST 2023 (memory stream, reflection)
- "MemGPT: Towards LLMs as Operating Systems", Packer et al., arXiv 2023
- "Lost in the Middle: How Language Models Use Long Contexts", Liu et al., TACL 2024
- "LoRA: Low-Rank Adaptation of Large Language Models", Hu et al., ICLR 2022; "QLoRA", Dettmers et al., NeurIPS 2023
- "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena", Zheng et al., NeurIPS 2023
- "SWE-bench: Can Language Models Resolve Real-World GitHub Issues?", Jimenez et al., ICLR 2024
- "DSPy: Compiling Declarative Language Model Calls into Self-Improving Pipelines", Khattab et al., ICLR 2024
- "From Local to Global: A Graph RAG Approach to Query-Focused Summarization", Edge et al., Microsoft Research, arXiv 2024
- "Not What You've Signed Up For: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection", Greshake et al., AISec 2023

**Engineering blogs and essays.**

- Anthropic engineering: "Building effective agents" (2024), "Effective context engineering for AI agents" (2025), "Introducing Contextual Retrieval" (2024)
- "What We Learned from a Year of Building with LLMs", Yan, Bischof, Frye, Husain, Liu, Shankar (O'Reilly, 2024)
- Eugene Yan (eugeneyan.com): "Patterns for Building LLM-based Systems & Products"
- Hamel Husain (hamel.dev): "Your AI Product Needs Evals"
- Lilian Weng (lilianweng.github.io): "LLM Powered Autonomous Agents"
- Simon Willison (simonwillison.net): prompt injection and practical tooling
- Chip Huyen (huyenchip.com); Jay Alammar, "The Illustrated Transformer"; Sebastian Raschka, "Ahead of AI"
- OpenAI, Google DeepMind, Hugging Face, LangChain, and Pinecone engineering blogs

**Courses and talks.** DeepLearning.AI short courses (built with the tool vendors); Hugging Face LLM and Agents courses; Andrej Karpathy, "Intro to Large Language Models" and "Let's build GPT: from scratch, in code, spelled out"; Stanford CS224N.

**Organizations whose repositories count as production grade.** Model providers (Anthropic, OpenAI, Google, Meta, Microsoft), Hugging Face, LangChain, LlamaIndex, the vector-database vendors, Stanford NLP, the UK AI Security Institute.

**Flagship repositories for repo-intel.**

- Agent harnesses: `langchain-ai/langgraph`, `openai/openai-agents-python`, `pydantic/pydantic-ai`, `OpenHands/OpenHands`, `Aider-AI/aider`, `cline/cline`, `continuedev/continue`
- RAG and applications: `run-llama/llama_index`, `deepset-ai/haystack`, `langgenius/dify`, `infiniflow/ragflow`, `microsoft/graphrag`
- Memory: `letta-ai/letta` (MemGPT), `mem0ai/mem0`, `getzep/graphiti`
- Retrieval engines: `pgvector/pgvector`, `qdrant/qdrant`, `chroma-core/chroma`, `facebookresearch/faiss`
- Protocols and SDKs: `modelcontextprotocol/servers`, `modelcontextprotocol/python-sdk`, `vercel/ai`
- Evaluation and tracing: `UKGovernmentBEIS/inspect_ai`, `openai/evals`, `promptfoo/promptfoo`, `langfuse/langfuse`, `Arize-ai/phoenix`
- Serving: `vllm-project/vllm`, `ollama/ollama`, `ggml-org/llama.cpp`
- Cookbooks (tier B, for mini-project ideas): `openai/openai-cookbook`, `anthropics/claude-cookbooks`

**Where adopters are listed (checked 2026-11-14).** None of `run-llama/llama_index`, `langchain-ai/langgraph`, `deepset-ai/haystack`, `langgenius/dify`, `qdrant/qdrant`, `chroma-core/chroma`, `langfuse/langfuse`, and `vllm-project/vllm` has an `ADOPTERS.md` or `USERS.md` at its repository root. The "Used by" number on a GitHub repository page counts dependent repositories; it names no adopter. The source rubric needs a named adopter read on a live page, so look for one on the project's own site (a customers or case-studies page) or in a company's engineering post. If none is found, the repository cannot be listed as a source, however many stars it has; do not guess one.

**Avoid.** "10 prompts that will change your life" content; prompt marketplaces; Medium and LinkedIn tutorials; YouTube walkthroughs of deprecated SDK versions; any tutorial older than about 18 months for framework APIs (check the framework's current docs instead); arXiv papers with no adoption (no citations, no implementation in a major library); benchmark claims from a vendor about its own model without an independent source; agent "frameworks" with stars but no tests, no releases, or no commits in the last year.

## Lesson recipes

| Kind of concept | Component | Concrete example |
|---|---|---|
| Embeddings and vector search | `VectorSpace3D` | Sentences as points; a query point appears and its nearest neighbours light up; learner types a query or drags it and watches the neighbours change |
| Agent memory graph | `Graph3D` (`editable`) | Entities and facts as nodes, relations as edges; learner adds a memory, connects it, and sees which nodes a question retrieves |
| Multi-agent and tool topology | `Graph3D` | Orchestrator, sub-agents, tools, and MCP servers; an edge lights when a call is made |
| RAG pipeline | `FlowAnimation` | Document → chunks → embeddings → index; then query → retrieve → rerank → prompt → answer; learner removes the reranker and sees a wrong chunk reach the prompt |
| Agent loop | `FlowAnimation` | Think → tool call → result → context grows → answer; a token meter fills; learner triggers a tool error |
| Tool calling and MCP | `SequenceDiagram` | User, application, model, tool: the model returns a tool request, the application runs it and sends the result back |
| Harness and conversation states | `StateMachine` | Agent run: planning → acting → waiting for approval → observing → done or failed; a guardrail trip |
| Sampling and chunking parameters | `ParamPlayground` | Temperature and top-p reshape a next-token distribution; chunk size and overlap against retrieved text; top-k against context tokens |
| Application architecture | `SystemDiagram` | Client, API, orchestrator, model provider, vector store, cache, tracing backend |
| Code | `CodeWalkthrough` | A 30-line ReAct loop; a function-calling request and the handler; an LLM-as-judge grader |
| Evaluation and cost | `Chart` | Accuracy by prompt version; recall@k as k grows; cost and latency per request across models |
| History | `Timeline` | Transformer → GPT-3 → RAG → function calling → MCP → agent harnesses |
| Static structure | `Mermaid` | The anatomy of a context window; the layers of a prompt |

**Activities.**

- `PredictReveal`: "Which of these three chunks will be ranked first for this query?" "The context holds 200k tokens and the answer is in the middle: what happens to recall?"
- `OrderSteps`: order the RAG pipeline, the steps of one tool call, the evaluation loop
- `MatchPairs`: failure (hallucination, wrong retrieval, tool misuse) to its fix; memory type to what it stores
- `Quiz`: prompt, RAG, fine-tune, or agent for a described product

**3D versus 2D.** 3D genuinely helps for embedding spaces (`VectorSpace3D`; say clearly that real embeddings have hundreds of dimensions and this is a projection) and for memory or knowledge graphs and agent topologies (`Graph3D`). Use 2D for the agent loop, the RAG pipeline, and tool-call sequences, which are about order, and for context-window composition, which is a stacked bar.

**Custom simulation ideas.** A context-window packer where the learner chooses what to keep under a token budget; a tokenizer view that splits typed text into tokens; an HNSW layer-by-layer search animation; a chunking visualiser over a real paragraph; a prompt-injection sandbox where a retrieved document tries to hijack a toy agent and a guardrail blocks it; an eval table where the learner grades outputs and compares with an LLM judge.

## Mini project patterns

Use small public or synthetic datasets and cheap or local models; every script prints token use. Guided → independent.

1. **Structured extraction** (guided, 1 h): turn messy text (invoices, support emails) into validated JSON with a schema and retries on invalid output. Proves: structured outputs and validation. Real use: data entry automation.
2. **Semantic search over your own notes** (guided, 1–2 h): embed markdown files, store vectors, query by meaning. Proves: embeddings and nearest-neighbour search. Real use: internal search.
3. **RAG question answering with citations** (semi-guided, 2–3 h): chunk, retrieve, answer with source references, refuse when nothing relevant is found. Proves: grounding. Real use: documentation assistants.
4. **Evaluation harness** (semi-guided, 2 h): 20 question-answer pairs, an exact-match grader and an LLM judge, a results table, and a comparison of two prompt versions. Proves: measuring change. Real use: every AI product.
5. **Tool-using agent** (semi-guided, 2–3 h): an agent loop with three tools (search, calculator, file read), a step limit, and error handling. Proves: the loop and tool contracts. Real use: support and operations assistants.
6. **MCP server** (independent, 2 h): expose one real capability (a SQLite database, a notes folder) as MCP tools and use it from a client. Proves: the protocol boundary. Real use: connecting models to company systems.
7. **Memory layer** (independent, 3 h): store facts from a conversation, retrieve the relevant ones later, and summarise old turns under a token budget. Proves: short- and long-term memory. Real use: assistants that persist across sessions.
8. **Guardrailed endpoint** (independent, 2 h): input and output checks, a prompt-injection test set, tracing, and a cost cap around an existing project. Proves: production safety. Real use: shipping to real users.

Tests must not need a paid API: put the model behind an interface and test with a fake model that returns scripted responses.

## Repository analysis focus

| What to find | Where it usually lives |
|---|---|
| The agent loop or pipeline entry point | `agent*`, `runner*`, `graph*`, `loop*`, `pipeline*`, `engine*` modules |
| Prompt management | `prompts/`, template files, system-prompt builders, how prompts are versioned |
| Context management | truncation, summarisation, compaction, token counting, caching code |
| Tool definition and execution | `tools/`, schemas, the dispatcher, sandboxing, permission and approval checks |
| Model abstraction | provider adapters, `llm/` or `models/`, retry and fallback, streaming handling |
| Retrieval | loaders, chunkers, embedding calls, index and store adapters, rerankers, query rewriting |
| Memory | memory stores, schemas, write and read policies, consolidation jobs |
| State and persistence | checkpointing, session stores, database schema |
| Evaluation | `evals/`, `benchmarks/`, golden datasets, graders, CI jobs that run them |
| Observability | tracing hooks, OpenTelemetry, token and cost accounting, logging of prompts |
| Safety | input and output filters, injection defences, secret redaction, sandbox configuration |
| Error handling | rate-limit handling, timeouts, malformed-output repair, loop and budget limits |
| Configuration | model names and parameters, `.env.example`, config schema |
| Tests | how non-deterministic behaviour is tested: mocks, recorded responses, snapshot fixtures |
| Packaging and CI | `pyproject.toml`, workflows, release process |

**External services to record as `_tech` notes.** Model providers and specific model families, embedding models, vector stores, rerankers, search APIs, tracing and evaluation platforms, sandboxes and code-execution services, document parsers, queues and databases used for state.

**Findings worth ranking high.** How the harness keeps context small, how tools are described so the model uses them correctly, how failures and loops are bounded, how prompts are tested, what they do about injection. These are the parts the textbook version leaves out.

## Capstone shape

**Production ready means.**

- A written evaluation set (30 or more cases) and a script that scores it; results recorded in the README; CI runs a small subset with a fake model
- The model behind an interface with timeouts, retries with backoff, and a fallback
- Prompts in versioned files, not inline strings scattered through code
- Structured outputs validated with a schema; malformed output handled
- Tracing of every model and tool call with tokens, latency, and cost; a per-request budget
- Guardrails: input limits, untrusted-content handling, an injection test set, human approval for risky tools
- Configuration through validated environment variables; keys never in code
- A simple API or CLI, `Dockerfile`, README, `ARCHITECTURE.md`, and ADRs (model choice, retrieval design, memory design)

**Recommended structure.**

```
src/
  domain/        dataclasses: Document, Chunk, Message, ToolCall
  llm/           LLMClient (interface), provider clients, FakeLLM for tests
  retrieval/     Chunker, Embedder, VectorStore (interface), Retriever, Reranker
  agent/         Agent, ToolRegistry, Tool (base class), MemoryStore, ContextBuilder
  guardrails/    InputGuard, OutputGuard
  api/           HTTP routes or CLI
  config.py      Settings class
prompts/         versioned prompt files
evals/           dataset.jsonl, graders.py, run_evals.py
tests/           unit tests with FakeLLM, integration tests
```

**Where OOP and SOLID fit.** Well: every external thing (model, vector store, tool) sits behind an interface, so providers can be swapped and tests run offline (dependency inversion). Each tool is a class with one job and a schema. New tools and retrievers are added without editing the agent (open/closed). Keep prompt assembly and scoring as pure functions; do not hide prompts inside class hierarchies.

**Example capstones.**

- Documentation assistant for a real open-source project: hybrid retrieval, citations, refusal when unsupported, evaluated
- Support-ticket triage agent: classifies, drafts a reply, calls tools to look up orders, asks for approval before acting
- Research assistant with long-term memory: remembers user facts and past findings in a memory graph
- Coding helper for one repository: an agent with file, search, and test tools inside a sandbox
- Meeting-notes pipeline: transcripts to structured action items with an evaluation set and cost report

## Recall focus

Worth remembering a year later (APIs will have changed; ideas will not):

- Decision rules: prompt, RAG, fine-tune, or agent; workflow versus autonomous agent; when to add memory; when to rerank
- Trade-offs: chunk size versus precision, top-k versus context cost, bigger model versus latency and cost, autonomy versus control
- Failure modes: hallucination from missing context, retrieval miss, lost-in-the-middle, tool-call loops, prompt injection, silent regressions without evals
- The anatomy of an agent loop and of a RAG pipeline, in order
- What each defining paper contributed, in one sentence

Question styles: Explain ("why is the model called stateless and what follows from that?"), Compare ("fine-tuning versus retrieval for company policies"), Debug ("answers cite the right document but the wrong section; what do you inspect?"), Decide ("a task needs five fixed steps: workflow or agent, and why?"). Never write cards about model names, prices, or SDK method names.

## Safety and ethics

- API keys in environment variables only; never in code, notebooks, prompts, or traces.
- Cost control: token limits on every call, small default datasets, and an estimated-cost print before any batch run.
- No personal, confidential, or customer data sent to a model API; use public or synthetic data.
- Treat all retrieved text, web pages, files, and tool results as untrusted. Teach prompt injection defensively, with a toy target the project itself runs.
- Agents with tools get least privilege: a sandboxed directory, an allow-list of commands, and a confirmation step before deleting, sending, paying, or publishing.
- State model limits honestly in every project README: it can be wrong, and how the evaluation measured that.
- Do not build projects that impersonate people, generate deceptive content at scale, or scrape sites against their terms.
