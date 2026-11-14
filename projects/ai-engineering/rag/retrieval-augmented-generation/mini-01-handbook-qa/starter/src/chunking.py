"""Chunking: cut the handbook into pieces that are worth retrieving."""

from dataclasses import dataclass


@dataclass(frozen=True)
class Chunk:
    """One handbook section: its heading and the text below it."""

    section: str
    text: str


# TODO(1): Cut the handbook into one Chunk per `## ` section.
#   1. Split the text on "\n## ". Put "\n" in front of the text first, so that a
#      heading on the very first line is found too.
#   2. Skip the first part: it is the title and intro before the first heading.
#   3. For every other part, the first line is the section name and the rest is
#      the body. `part.partition("\n")` gives you both.
#   4. Strip the name and the body. Skip the section when the body is empty.
#   5. Return the list of Chunk(section=..., text=...) in file order.
def chunk_handbook(markdown: str) -> list[Chunk]:
    """Return one Chunk per `## ` section of the handbook, in file order."""
    raise NotImplementedError("TODO(1): chunk_handbook is not implemented yet")
