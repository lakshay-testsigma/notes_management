"""Chunking: cut the handbook into pieces that are worth retrieving."""

from dataclasses import dataclass


@dataclass(frozen=True)
class Chunk:
    """One handbook section: its heading and the text below it."""

    section: str
    text: str


def chunk_handbook(markdown: str) -> list[Chunk]:
    """Return one Chunk per `## ` section of the handbook, in file order."""
    # The leading "\n" lets a heading on the very first line match "\n## " too.
    parts = ("\n" + markdown).split("\n## ")

    chunks: list[Chunk] = []
    # parts[0] is the title and intro before the first heading: no section owns it.
    for part in parts[1:]:
        heading, _, body = part.partition("\n")
        text = body.strip()
        # A heading with nothing below it gives the retriever nothing to match.
        if text:
            chunks.append(Chunk(section=heading.strip(), text=text))
    return chunks
