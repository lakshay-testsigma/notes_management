from chunking import Chunk, chunk_handbook

HANDBOOK = """# Example handbook

This intro line belongs to no section.

## Annual leave

You get 25 days of paid leave.
Request it two weeks ahead.

## Empty section

## Sick leave

Message your manager before 10:00.
"""


def test_returns_one_chunk_per_section_in_order():
    chunks = chunk_handbook(HANDBOOK)
    assert [chunk.section for chunk in chunks] == ["Annual leave", "Sick leave"]


def test_chunk_text_is_the_section_body_without_the_heading():
    chunks = chunk_handbook(HANDBOOK)
    assert chunks[0] == Chunk(
        section="Annual leave",
        text="You get 25 days of paid leave.\nRequest it two weeks ahead.",
    )


def test_text_before_the_first_heading_is_ignored():
    chunks = chunk_handbook(HANDBOOK)
    assert all("intro line" not in chunk.text for chunk in chunks)


def test_last_section_is_not_lost():
    chunks = chunk_handbook(HANDBOOK)
    assert chunks[-1].text == "Message your manager before 10:00."


def test_handbook_without_sections_gives_no_chunks():
    assert chunk_handbook("# Only a title\n\nSome text.") == []
