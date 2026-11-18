/**
 * Renders the whole learning log as Markdown, so the developer can paste it
 * into a blog post or a note.
 */

import { renderLog } from '../domain/Progress';
import { TrackerStore } from './TrackerStore';

export class ExportLogUseCase {
  constructor(private readonly store: TrackerStore) {}

  /** The log as Markdown. */
  async execute(): Promise<string> {
    return renderLog(this.store.getState());
  }
}
