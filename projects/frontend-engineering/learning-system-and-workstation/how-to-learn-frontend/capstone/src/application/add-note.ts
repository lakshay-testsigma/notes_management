import type { Clock, IdGenerator, Logger, NoteRepository } from "../domain/ports.js";
import type { Note, NoteDraft } from "../domain/note.js";
import type { NoteValidator } from "../domain/note-validator.js";
import type { ReviewScheduler } from "../domain/review-scheduler.js";

export class AddNote {
  constructor(
    private readonly notes: NoteRepository,
    private readonly validator: NoteValidator,
    private readonly scheduler: ReviewScheduler,
    private readonly clock: Clock,
    private readonly ids: IdGenerator,
    private readonly logger: Logger,
  ) {}

  // Throws ValidationError with fix-it messages when the draft is not valid.
  execute(draft: NoteDraft): Note {
    const valid = this.validator.validate(draft);
    const today = this.clock.today();
    const note: Note = { ...valid, id: this.ids.next(), createdOn: today, ...this.scheduler.first(today) };
    this.notes.save(note);
    this.logger.info("note.added", { noteId: note.id, sources: note.sources.length });
    return note;
  }
}
