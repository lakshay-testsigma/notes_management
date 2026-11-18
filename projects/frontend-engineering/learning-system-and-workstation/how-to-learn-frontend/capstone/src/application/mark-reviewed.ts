import { NoteNotFoundError } from "../domain/errors.js";
import type { Note } from "../domain/note.js";
import type { Clock, Logger, NoteRepository } from "../domain/ports.js";
import type { ReviewScheduler } from "../domain/review-scheduler.js";

export class MarkReviewed {
  constructor(
    private readonly notes: NoteRepository,
    private readonly scheduler: ReviewScheduler,
    private readonly clock: Clock,
    private readonly logger: Logger,
  ) {}

  execute(id: string): Note {
    const note = this.notes.all().find((n) => n.id === id);
    if (!note) throw new NoteNotFoundError(id);
    const updated = { ...note, ...this.scheduler.afterReview(note.reviewStep, this.clock.today()) };
    this.notes.save(updated);
    this.logger.info("note.reviewed", { noteId: id, step: updated.reviewStep, next: updated.nextReviewOn });
    return updated;
  }
}
