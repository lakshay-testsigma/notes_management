/**
 * The one way in for the React parts of the app.
 * The components never talk to the store or to a use case directly.
 */

import { CompleteStepUseCase, type StepChange } from '../application/CompleteStepUseCase';
import { ExportLogUseCase } from '../application/ExportLogUseCase';
import { LoadDashboardUseCase } from '../application/LoadDashboardUseCase';
import { SaveNoteUseCase } from '../application/SaveNoteUseCase';
import type { StateListener, TrackerStore } from '../application/TrackerStore';
import type { NoteDraft, StepId } from '../domain/model';
import type { Dashboard } from '../domain/Progress';

export class TrackerController {
  constructor(
    private readonly store: TrackerStore,
    private readonly loadDashboardUseCase: LoadDashboardUseCase,
    private readonly completeStepUseCase: CompleteStepUseCase,
    private readonly saveNoteUseCase: SaveNoteUseCase,
    private readonly exportLogUseCase: ExportLogUseCase,
  ) {}

  /** Reads the log and builds the dashboard of it. */
  async loadDashboard(): Promise<Dashboard> {
    return this.loadDashboardUseCase.execute();
  }

  /** Marks one step as done, or opens it again. */
  async setStep(noteId: string, step: StepId, change: StepChange = {}): Promise<void> {
    await this.completeStepUseCase.execute(noteId, step, change);
  }

  /** Adds a roadmap item to the log, or renames one. */
  async saveNote(draft: NoteDraft): Promise<void> {
    await this.saveNoteUseCase.execute(draft);
  }

  /** The whole log as Markdown. */
  async exportLog(): Promise<string> {
    return this.exportLogUseCase.execute();
  }

  /** Told every time the log changed. */
  subscribe(listener: StateListener): () => void {
    return this.store.subscribe(listener);
  }
}
