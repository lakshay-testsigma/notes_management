from collections import Counter

import pytest

from chunking import Chunk
from retrieval import cosine_similarity, embed, retrieve

CHUNKS = [
    Chunk("Annual leave", "Employees get 25 days of paid annual leave per year."),
    Chunk("Sick leave", "If you are ill, message your manager on the first day of absence."),
    Chunk("Expenses", "Submit expense claims in the finance portal with a receipt."),
    Chunk("Equipment", "Every employee receives a laptop on the first day."),
]


# --- cosine_similarity: TODO(2) ---


def test_cosine_of_identical_vectors_is_one():
    vector = Counter({"leave": 2, "days": 1})
    assert cosine_similarity(vector, vector) == pytest.approx(1.0)


def test_cosine_of_vectors_without_shared_words_is_zero():
    assert cosine_similarity(Counter({"leave": 1}), Counter({"laptop": 1})) == 0.0


def test_cosine_of_partly_shared_vectors():
    a = Counter({"leave": 1, "days": 1})
    b = Counter({"leave": 1})
    # dot = 1, lengths = sqrt(2) and 1, so the result is 1 / sqrt(2).
    assert cosine_similarity(a, b) == pytest.approx(0.7071, abs=0.0001)


def test_cosine_ignores_how_long_the_text_is():
    short = Counter({"leave": 1, "days": 1})
    long = Counter({"leave": 10, "days": 10})
    assert cosine_similarity(short, long) == pytest.approx(1.0)


def test_cosine_with_an_empty_vector_is_zero_and_does_not_crash():
    assert cosine_similarity(Counter(), Counter({"leave": 1})) == 0.0
    assert cosine_similarity(Counter(), Counter()) == 0.0


# --- retrieve: TODO(3) ---


def test_retrieve_puts_the_best_chunk_first():
    hits = retrieve("How many days of annual leave per year?", CHUNKS)
    assert hits[0].chunk.section == "Annual leave"


def test_retrieve_scores_are_sorted_from_high_to_low():
    hits = retrieve("leave on the first day", CHUNKS, k=4, min_score=0.0)
    scores = [hit.score for hit in hits]
    assert len(hits) == 4
    assert scores == sorted(scores, reverse=True)


def test_retrieve_returns_at_most_k_chunks():
    hits = retrieve("leave on the first day", CHUNKS, k=2, min_score=0.0)
    assert len(hits) == 2


def test_retrieve_leaves_out_chunks_below_min_score():
    # "Sick leave" shares only the word "leave" and scores about 0.32.
    hits = retrieve("How many days of annual leave per year?", CHUNKS, k=4, min_score=0.5)
    assert [hit.chunk.section for hit in hits] == ["Annual leave"]


def test_retrieve_returns_nothing_for_a_question_the_handbook_does_not_cover():
    assert retrieve("Where can I park my bicycle?", CHUNKS) == []


def test_retrieve_matches_words_in_the_section_heading():
    chunks = [Chunk("Dress code", "Wear business clothes when you visit a client.")]
    hits = retrieve("What is the dress code?", chunks)
    assert [hit.chunk.section for hit in hits] == ["Dress code"]


def test_embed_counts_words_and_drops_stop_words():
    # embed is complete in the starter; this test shows what it returns.
    assert embed("The leave, the LEAVE and the days") == Counter({"leave": 2, "day": 1})
