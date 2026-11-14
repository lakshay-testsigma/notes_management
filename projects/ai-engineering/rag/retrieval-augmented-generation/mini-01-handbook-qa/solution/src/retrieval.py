"""Retrieval: find the handbook sections that fit a question best."""

import math
import re
from collections import Counter
from dataclasses import dataclass

from chunking import Chunk

# Words that appear in almost every sentence say nothing about the topic.
STOP_WORDS = frozenset(
    "a about an and any are as at be but by can did do does for from get had has have "
    "how i if in into is it its long many may me much must my need no not of on or our "
    "should so than that the their them then there these they this to up was we were "
    "what when where whether which who why will with would you your".split()
)

# A chunk scoring below this is treated as "not about the question".
MIN_SCORE = 0.15


@dataclass(frozen=True)
class Hit:
    """A retrieved chunk and how well it matched the question (0.0 to 1.0)."""

    chunk: Chunk
    score: float


def normalize(word: str) -> str:
    """Crude plural handling, so that "claims" and "claim" count as one word."""
    return word.removesuffix("s") if len(word) > 3 else word


def embed(text: str) -> Counter[str]:
    """Turn text into a vector: each word and how often it appears.

    This stands in for an embedding model so that the project runs offline.
    A real embedding captures meaning; this one only captures shared words.
    """
    # Dropping apostrophes keeps "doctor's" as one word instead of "doctor" + "s".
    words = re.findall(r"[a-z0-9]+", text.lower().replace("'", ""))
    return Counter(normalize(word) for word in words if word not in STOP_WORDS)


def cosine_similarity(a: Counter[str], b: Counter[str]) -> float:
    """Return how closely two vectors point the same way: 0.0 to 1.0."""
    dot = sum(count * b[word] for word, count in a.items())
    length_a = math.sqrt(sum(count * count for count in a.values()))
    length_b = math.sqrt(sum(count * count for count in b.values()))
    # An empty text has length 0, and dividing by it would crash.
    if length_a == 0 or length_b == 0:
        return 0.0
    return dot / (length_a * length_b)


def retrieve(
    question: str, chunks: list[Chunk], k: int = 3, min_score: float = MIN_SCORE
) -> list[Hit]:
    """Return the `k` best chunks for the question, best first.

    Chunks that score below `min_score` are left out, so the list is empty
    when the handbook has nothing on the subject.
    """
    question_vector = embed(question)
    hits = []
    for chunk in chunks:
        # The heading is embedded with the body: it often holds the key words.
        chunk_vector = embed(f"{chunk.section}\n{chunk.text}")
        score = cosine_similarity(question_vector, chunk_vector)
        if score >= min_score:
            hits.append(Hit(chunk=chunk, score=score))

    hits.sort(key=lambda hit: hit.score, reverse=True)
    return hits[:k]
