from pathlib import Path

from answering import INSTRUCTIONS, REFUSAL, answer_question, build_prompt, cited_sections
from chunking import Chunk, chunk_handbook
from models import OfflineModel

CHUNKS = [
    Chunk("Annual leave", "Employees get 25 days of paid annual leave per year."),
    Chunk("Sick leave", "If you are ill, message your manager on the first day of absence."),
    Chunk("Expenses", "Submit expense claims in the finance portal with a receipt."),
]

LEAVE_QUESTION = "How many days of annual leave per year?"

HANDBOOK_PATH = Path(__file__).resolve().parent.parent / "data" / "handbook.md"


class FakeModel:
    """A scripted model: it always gives the same reply and records every prompt."""

    def __init__(self, reply: str) -> None:
        self.reply = reply
        self.prompts: list[str] = []

    def complete(self, prompt: str) -> str:
        self.prompts.append(prompt)
        return self.reply


# --- build_prompt: TODO(4) ---


def test_prompt_wraps_each_chunk_in_a_named_section_tag():
    prompt = build_prompt("Any question?", CHUNKS[:2])
    assert (
        '<section name="Annual leave">\n'
        "Employees get 25 days of paid annual leave per year.\n"
        "</section>"
    ) in prompt
    assert '<section name="Sick leave">' in prompt
    assert '<section name="Expenses">' not in prompt


def test_prompt_starts_with_the_rules_and_ends_with_the_question():
    prompt = build_prompt("How do I claim expenses?", CHUNKS)
    assert prompt.startswith(INSTRUCTIONS)
    assert prompt.endswith("Question: How do I claim expenses?\nAnswer:")


def test_prompt_puts_the_sections_between_the_rules_and_the_question():
    prompt = build_prompt("How do I claim expenses?", CHUNKS)
    rules_end = len(INSTRUCTIONS)
    assert rules_end < prompt.index("<section") < prompt.index("</section>") < prompt.index("Question:")


def test_prompt_separates_its_parts_with_one_blank_line():
    prompt = build_prompt("Q?", CHUNKS[:1])
    assert prompt == (
        f"{INSTRUCTIONS}\n\n"
        '<section name="Annual leave">\n'
        "Employees get 25 days of paid annual leave per year.\n"
        "</section>\n\n"
        "Question: Q?\nAnswer:"
    )


# --- cited_sections: complete in the starter ---


def test_cited_sections_finds_every_name_in_square_brackets():
    answer = "You get 25 days [Annual leave]. Tell your manager [Sick leave]."
    assert cited_sections(answer) == ["Annual leave", "Sick leave"]


def test_cited_sections_of_an_answer_without_citations_is_empty():
    assert cited_sections("You get 25 days.") == []


# --- answer_question: TODO(5) ---


def test_answer_with_a_valid_citation_is_returned():
    model = FakeModel("You get 25 days of paid leave per year [Annual leave].")
    answer = answer_question(LEAVE_QUESTION, CHUNKS, model)
    assert answer.text == "You get 25 days of paid leave per year [Annual leave]."
    assert answer.sources == ["Annual leave"]
    assert answer.refused is False


def test_the_model_receives_a_prompt_built_from_the_retrieved_chunks():
    model = FakeModel("You get 25 days [Annual leave].")
    answer_question(LEAVE_QUESTION, CHUNKS, model)
    assert len(model.prompts) == 1
    assert '<section name="Annual leave">' in model.prompts[0]
    assert '<section name="Expenses">' not in model.prompts[0]
    assert f"Question: {LEAVE_QUESTION}" in model.prompts[0]


def test_refuses_without_calling_the_model_when_nothing_is_retrieved():
    model = FakeModel("Bicycles go in the garage [Parking].")
    answer = answer_question("Where can I park my bicycle?", CHUNKS, model)
    assert answer.text == REFUSAL
    assert answer.sources == []
    assert answer.refused is True
    assert model.prompts == []


def test_a_refusal_from_the_model_is_passed_on():
    model = FakeModel(f"  {REFUSAL}\n")
    answer = answer_question(LEAVE_QUESTION, CHUNKS, model)
    assert answer.text == REFUSAL
    assert answer.refused is True


def test_an_answer_without_a_citation_is_replaced_by_the_refusal():
    model = FakeModel("You get 30 days of leave per year.")
    answer = answer_question(LEAVE_QUESTION, CHUNKS, model)
    assert answer.text == REFUSAL
    assert answer.refused is True


def test_an_answer_citing_a_section_that_was_not_retrieved_is_replaced_by_the_refusal():
    model = FakeModel("You get 30 days of leave per year [Holiday policy].")
    answer = answer_question(LEAVE_QUESTION, CHUNKS, model)
    assert answer.text == REFUSAL
    assert answer.sources == []
    assert answer.refused is True


def test_a_section_cited_twice_is_listed_once():
    model = FakeModel("You get 25 days [Annual leave]. They are paid [Annual leave].")
    answer = answer_question(LEAVE_QUESTION, CHUNKS, model)
    assert answer.sources == ["Annual leave"]


# --- the whole pipeline on the real handbook, with the offline model ---


def test_full_pipeline_answers_from_the_handbook_with_a_citation():
    chunks = chunk_handbook(HANDBOOK_PATH.read_text(encoding="utf-8"))
    answer = answer_question("How many days of annual leave do I get?", chunks, OfflineModel())
    assert "25 days" in answer.text
    assert answer.sources == ["Annual leave"]
    assert answer.refused is False


def test_full_pipeline_refuses_a_question_the_handbook_does_not_cover():
    chunks = chunk_handbook(HANDBOOK_PATH.read_text(encoding="utf-8"))
    answer = answer_question("Where can I park my bicycle?", chunks, OfflineModel())
    assert answer.text == REFUSAL
    assert answer.refused is True
