"""Models: an offline stand-in for a language model, and a token counter.

This file is complete in the starter. It is wiring, not the lesson.
"""

import re

from answering import REFUSAL, Model
from retrieval import embed


class OfflineModel:
    """A stand-in so the project runs with no API key and no download.

    It is NOT a language model. It reads the prompt, finds the handbook
    sentence that shares the most words with the question, and copies it with
    its section name. It cannot rephrase, combine facts, or make things up.
    """

    def complete(self, prompt: str) -> str:
        question = re.search(r"Question: (.*)\nAnswer:\s*$", prompt, re.DOTALL)
        sections = re.findall(r'<section name="([^"]+)">\n(.*?)\n</section>', prompt, re.DOTALL)
        if question is None or not sections:
            return REFUSAL

        question_words = set(embed(question.group(1)))
        best_shared, best_reply = 0, REFUSAL
        for name, text in sections:
            # Handbook lines are wrapped, so join them before cutting sentences.
            for sentence in re.split(r"(?<=[.!?])\s+", " ".join(text.split())):
                shared = len(question_words & set(embed(sentence)))
                if shared > best_shared:
                    best_shared, best_reply = shared, f"{sentence} [{name}]"
        return best_reply


def estimate_tokens(text: str) -> int:
    """Rough size of a text in tokens: about 4 characters per token in English.

    A real model API reports the exact numbers; use those when you have them.
    """
    return max(1, len(text) // 4)


class TokenMeter:
    """Wraps a model and counts what every call costs in tokens."""

    def __init__(self, model: Model) -> None:
        self.model = model
        self.calls = 0
        self.prompt_tokens = 0
        self.answer_tokens = 0
        self.last_prompt = ""

    def complete(self, prompt: str) -> str:
        reply = self.model.complete(prompt)
        self.calls += 1
        self.prompt_tokens += estimate_tokens(prompt)
        self.answer_tokens += estimate_tokens(reply)
        self.last_prompt = prompt
        return reply
