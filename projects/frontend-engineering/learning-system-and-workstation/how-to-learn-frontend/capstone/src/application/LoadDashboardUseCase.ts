/**
 * Loads the log and builds the dashboard from it.
 */

import { buildDashboard, type Dashboard } from '../domain/Progress';
import { TrackerStore } from './TrackerStore';

export class LoadDashboardUseCase {
  constructor(private readonly store: TrackerStore) {}

  /** The dashboard of the log as it is saved in the browser. */
  async execute(): Promise<Dashboard> {
    const state = await this.store.load();
    return buildDashboard(state);
  }
}
