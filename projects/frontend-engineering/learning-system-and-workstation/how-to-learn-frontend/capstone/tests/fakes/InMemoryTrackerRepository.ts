import type { TrackerRepository } from '../../src/domain/ports';
import { initialState, type TrackerState } from '../../src/domain/TrackerState';

/** A repository that keeps the log in memory. Used by the unit tests. */
export class InMemoryTrackerRepository implements TrackerRepository {
  state: TrackerState = initialState();
  saveCount = 0;

  async load(): Promise<TrackerState> {
    return this.state;
  }

  async save(state: TrackerState): Promise<void> {
    this.state = state;
    this.saveCount += 1;
  }
}
