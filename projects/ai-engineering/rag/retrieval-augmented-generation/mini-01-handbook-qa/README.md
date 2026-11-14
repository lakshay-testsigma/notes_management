# Mini project 01 — Handbook questions answered with a cited section, or refused

Time: about 2 hours · Guidance: guided

## The real use case

A new employee asks the people team the same questions every week: how many days
of leave they get, how to claim expenses, when they can work from home. The
people team wants an assistant to answer from the company handbook, but a
language model on its own has never read that handbook, so it answers from
general knowledge and sounds sure while being wrong. One invented leave rule is
enough to cause a real dispute. You will build a small question-answering
pipeline in which every answer names the handbook section it came from, and in
which the reply is "The handbook does not cover this." whenever no section
supports an answer.

## What this proves

Grounding: the answer is built only from retrieved text, it cites that text, and
the program refuses when retrieval finds nothing or when the citation does not
match a retrieved section. This serves the plan outcome "build a small RAG
pipeline in Python that chunks documents, retrieves the best chunks for a
question, and builds a prompt that makes the answer cite its sources".

## Prerequisites

- uv, the Python project manager (`uv --version`; this project was tested with
  uv 0.11.27)
- Python 3.11 or newer (`python3 --version`). If you have none, run
  `uv python install 3.12`.
- You have read lesson pages 1 to 3: why a model needs to look things up,
  retrieval by meaning, and chunking.

There is no service to start, no account, and no API key. The project has two
stand-ins so that it runs offline, and you should know what they are:

- `embed` in `src/retrieval.py` counts words. A real embedding model captures
  meaning; this one only sees shared words.
- `OfflineModel` in `src/models.py` is not a language model. It copies the
  handbook sentence that shares the most words with the question.

The handbook in `data/handbook.md` is synthetic. The company does not exist.

## How to run

```bash
cd starter
uv sync                 # creates .venv and installs pytest 9.2.0
uv run pytest           # 29 tests fail at the start; that is expected
uv run python src/main.py "How many days of annual leave do I get?"
```

Until task 1 is done, the last command stops with
`NotImplementedError: TODO(1): chunk_handbook is not implemented yet`.

## Your tasks

Do the tasks in order. Each one makes more tests pass.

1. **Chunk the handbook.** In `src/chunking.py`, implement `chunk_handbook` at
   `TODO(1)`. Split the text at every `## ` heading and return one
   `Chunk(section, text)` per section. Ignore the text before the first heading
   and skip sections with an empty body. Done when
   `uv run pytest tests/test_chunking.py` prints `5 passed`.
2. **Compare two vectors.** In `src/retrieval.py`, implement
   `cosine_similarity` at `TODO(2)`. The vectors are word counts made by
   `embed`, which is already written. Compute the dot product, divide it by the
   two lengths, and return `0.0` when a vector is empty. Done when
   `uv run pytest tests/test_retrieval.py -k cosine` prints `5 passed`.
3. **Retrieve the top k.** In `src/retrieval.py`, implement `retrieve` at
   `TODO(3)`. Score every chunk against the question, drop the chunks below
   `min_score`, sort from high to low, and return the first `k` as `Hit`
   objects. Done when `uv run pytest tests/test_retrieval.py` prints
   `12 passed`.
4. **Build the grounded prompt.** In `src/answering.py`, read the four rules in
   `INSTRUCTIONS` first, then implement `build_prompt` at `TODO(4)`. The prompt
   is the rules, then each chunk inside a `<section name="...">` tag, then the
   question, joined with blank lines. Done when
   `uv run pytest tests/test_answering.py -k test_prompt` prints `4 passed`.
5. **Answer or refuse.** In `src/answering.py`, implement `answer_question` at
   `TODO(5)`. Retrieve first. Refuse without calling the model when nothing was
   retrieved. Otherwise call the model, and refuse when its reply has no
   citation or cites a section that was not retrieved. Done when
   `uv run pytest` prints `32 passed`.

## How to check your work

```bash
uv run pytest
```

Expected: `32 passed`. Then check it by hand with three questions.

```bash
uv run python src/main.py "How many days of annual leave do I get?" --show-prompt
```

You should see `Annual leave` first in the retrieved sections, your prompt with
three `<section>` blocks, and an answer that ends with `[Annual leave]`.

```bash
uv run python src/main.py "Where can I park my bicycle?"
uv run python src/main.py "Where can I park my bicycle?" --min-score 0
```

The first run retrieves nothing and prints `Model calls: 0` with the refusal.
The second run switches the threshold off: three sections with score 0.00 are
sent to the model, and you pay for about 360 prompt tokens to get the same
refusal.

```bash
uv run python src/main.py "How do I book a meeting room?"
```

This one shows the limits. The handbook says nothing about meeting rooms, but
the word "book" appears in the Training budget section, so that section scores
0.18 and passes the threshold. The offline model then copies a sentence about
the training budget and cites `[Training budget]`. The citation is valid and
the answer is wrong. A citation tells you where an answer came from. It does
not tell you that the answer is right. This is a retrieval failure: the wrong
section was retrieved. The 32 tests do not measure answer quality either. They
prove that the pipeline refuses and checks citations as designed, using a
scripted fake model, and nothing more.

## Stretch goals

- Write ten questions with the section you expect for each, and print how many
  of them retrieve the expected section first. Change `MIN_SCORE` and `k` and
  watch the number move.
- Write a class with a `complete(prompt)` method that calls a real language
  model you have access to, and pass it to `answer_question`. Read any key from
  an environment variable, set a maximum answer length, and send only this
  synthetic handbook.
- Make the model quote the handbook in double quotes, and refuse when a quoted
  text does not appear word for word in the cited section.

## Hints

Read a hint only after you have tried the task for ten minutes.

### Hint for task 1

`"a\n## b\ntext".split("\n## ")` gives `["a", "b\ntext"]`. Then
`"b\ntext".partition("\n")` gives `("b", "\n", "text")`: the heading, the
separator, and the body.

### Hint for task 2

`a.items()` gives pairs of word and count. A `Counter` returns 0 for a word it
does not hold, so `b[word]` never raises an error. For the test with
`{"leave": 1, "days": 1}` and `{"leave": 1}`, the dot product is 1 and the
lengths are 1.414 and 1.

### Hint for task 3

Collect the hits in a list, then use
`hits.sort(key=lambda hit: hit.score, reverse=True)` and return `hits[:k]`.
Check `score >= min_score` before you append, not after you cut the list to
`k`.

### Hint for task 4

Build each block with an f-string:
`f'<section name="{chunk.section}">\n{chunk.text}\n</section>'`. Put all parts
in one list and call `"\n\n".join(parts)`. The test
`test_prompt_separates_its_parts_with_one_blank_line` shows the exact text.

### Hint for task 5

Create the refusal once at the top of the function and return it from every
refusing branch. For the citation check, build a set of the retrieved section
names: `allowed = {chunk.section for chunk in retrieved}`. The test
`test_refuses_without_calling_the_model_when_nothing_is_retrieved` fails when
you call the model before you look at the hits.

## Compare with the solution

The finished project is in `../solution/`. When you compare, look at the line in
`src/answering.py` where the function returns before the model is called, at
how the citation check treats "no citation" and "invented citation" as the same
refusal, and at how `tests/test_answering.py` uses `FakeModel` to play a model
that invents a section, without any real model.
