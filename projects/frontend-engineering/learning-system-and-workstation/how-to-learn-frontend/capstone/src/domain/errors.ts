/**
 * Every error the app can raise on purpose.
 * The use cases throw them; the browser parts turn them into a message.
 */

export class LearningTrackerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** A note cannot be built, for example because its title is empty. */
export class InvalidNoteError extends LearningTrackerError {
  readonly noteId: string;

  constructor(noteId: string, reason: string) {
    super(`note "${noteId}" is not valid: ${reason}`);
    this.noteId = noteId;
  }
}

/** The developer asked for a roadmap item that the log does not hold. */
export class NoteNotFoundError extends LearningTrackerError {
  readonly noteId: string;

  constructor(noteId: string) {
    super(`note "${noteId}" is not in the log`);
    this.noteId = noteId;
  }
}

/** Somebody tried to use a step outside the four steps of the loop. */
export class InvalidStepError extends LearningTrackerError {
  readonly step: string;

  constructor(step: string) {
    super(`"${step}" is not one of the four learning steps`);
    this.step = step;
  }
}

/** The saved log has a shape this build does not know how to read. */
export class StorageVersionError extends LearningTrackerError {
  readonly savedVersion: number;
  readonly currentVersion: number;

  constructor(savedVersion: number, currentVersion: number) {
    super(`the saved log has version ${savedVersion}, this build expects version ${currentVersion}`);
    this.savedVersion = savedVersion;
    this.currentVersion = currentVersion;
  }
}

/** An environment variable is missing or holds a wrong value. */
export class ConfigError extends LearningTrackerError {
  readonly variable: string;

  constructor(variable: string, reason: string) {
    super(`the environment variable ${variable} is not usable: ${reason}`);
    this.variable = variable;
  }
}
