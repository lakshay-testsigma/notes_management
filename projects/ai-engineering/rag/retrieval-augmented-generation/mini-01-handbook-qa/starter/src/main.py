"""Ask the handbook one question from the command line.

    uv run python src/main.py "How many days of annual leave do I get?"

This file is complete in the starter. It is wiring, not the lesson.
"""

import argparse
from pathlib import Path

from answering import answer_question
from chunking import chunk_handbook
from models import OfflineModel, TokenMeter
from retrieval import MIN_SCORE, retrieve

HANDBOOK_PATH = Path(__file__).resolve().parent.parent / "data" / "handbook.md"


def main() -> None:
    parser = argparse.ArgumentParser(description="Ask the employee handbook a question.")
    parser.add_argument("question")
    parser.add_argument("--k", type=int, default=3, help="how many sections to retrieve")
    parser.add_argument("--min-score", type=float, default=MIN_SCORE)
    parser.add_argument("--show-prompt", action="store_true", help="print the prompt sent to the model")
    args = parser.parse_args()

    chunks = chunk_handbook(HANDBOOK_PATH.read_text(encoding="utf-8"))
    model = TokenMeter(OfflineModel())

    print(f"Question: {args.question}\n")

    # Retrieval runs once more here only to show its scores on screen.
    hits = retrieve(args.question, chunks, k=args.k, min_score=args.min_score)
    print(f"Retrieved sections (score at least {args.min_score}):")
    for hit in hits:
        print(f"  {hit.score:.2f}  {hit.chunk.section}")
    if not hits:
        print("  none")

    answer = answer_question(args.question, chunks, model, k=args.k, min_score=args.min_score)

    if args.show_prompt and model.last_prompt:
        print(f"\n--- prompt ---\n{model.last_prompt}\n--- end of prompt ---")

    print(f"\nAnswer: {answer.text}")
    print(f"Sources: {', '.join(answer.sources) if answer.sources else 'none'}")
    print(
        f"Model calls: {model.calls} (about {model.prompt_tokens} prompt tokens and "
        f"{model.answer_tokens} answer tokens, estimated as characters / 4)"
    )


if __name__ == "__main__":
    main()
