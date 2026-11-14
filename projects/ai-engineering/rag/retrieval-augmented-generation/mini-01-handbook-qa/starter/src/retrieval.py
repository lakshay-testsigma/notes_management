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


# TODO(2): Measure how closely two word-count vectors point the same way.
#   1. dot: for every word in `a`, multiply its count by the count of the same
#      word in `b`, and add the results. (`b[word]` is 0 for a missing word.)
#   2. length of a vector: the square root of the sum of its squared counts.
#      Compute it for `a` and for `b` with math.sqrt.
#   3. If either length is 0 (an empty text), return 0.0. Do not divide by zero.
#   4. Return dot / (length_a * length_b).
def cosine_similarity(a: Counter[str], b: Counter[str]) -> float:
    """Return how closely two vectors point the same way: 0.0 to 1.0."""
    raise NotImplementedError("TODO(2): cosine_similarity is not implemented yet")


# TODO(3): Find the `k` chunks that fit the question best.
#   1. Embed the question once with embed(question).
#   2. For every chunk, embed f"{chunk.section}\n{chunk.text}" (the heading
#      often holds the key words) and score it with cosine_similarity.
#   3. Keep a Hit(chunk=..., score=...) only when score >= min_score.
#   4. Sort the hits by score, highest first.
#   5. Return the first `k` hits. Return [] when no chunk reached min_score.
def retrieve(
    question: str, chunks: list[Chunk], k: int = 3, min_score: float = MIN_SCORE
) -> list[Hit]:
    """Return the `k` best chunks for the question, best first.

    Chunks that score below `min_score` are left out, so the list is empty
    when the handbook has nothing on the subject.
    """
    raise NotImplementedError("TODO(3): retrieve is not implemented yet")
