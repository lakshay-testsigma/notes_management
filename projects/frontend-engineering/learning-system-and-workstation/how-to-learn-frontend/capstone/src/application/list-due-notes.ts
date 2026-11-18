import type { Note } from "../domain/note.js";
import type { Clock, NoteRepository } from "../domain/ports.js";
import type { ReviewScheduler } from "../domain/review-scheduler.js";

export class ListDueNotes {
  constructor(
    private readonly notes: NoteRepository,
    private readonly scheduler: ReviewScheduler,
    private readonly clock: Clock,
  ) {}

  // Most overdue first.
  execute(): Note[] {
    const today = this.clock.today();
    return this.notes
      .all()
      .filter((note) => this.scheduler.isDue(note.nextReviewOn, today))
      .sort((a, b) => a.nextReviewOn.localeCompare(b.nextReviewOn));
  }
}
