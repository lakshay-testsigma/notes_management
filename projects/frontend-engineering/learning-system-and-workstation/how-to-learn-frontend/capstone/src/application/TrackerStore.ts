/**
 * The one place that holds the current state of the tracker.
 * Every change goes through `applyPatch`, so the log is written the same way
 * from every part of the app.
 */

import type { Logger, TrackerRepository } from '../domain/ports';
import { applyPatch, initialState, type TrackerPatch, type TrackerState } from '../domain/TrackerState';

/** Told every time the state changed. */
export type StateListener = (state: TrackerState) => void;

export class TrackerStore {
  private state: TrackerState = initialState();
  private readonly listeners = new Set<StateListener>();
  private loadNumber = 0;
  private changeNumber = 0;

  constructor(
    private readonly repository: TrackerRepository,
    private readonly logger: Logger,
  ) {}

  /** The state as it is right now. */
  getState(): TrackerState {
    return this.state;
  }

  /** Registers a listener and returns the function that removes it again. */
  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Reads the log from the repository.
   * Every load gets a number. When a newer load starts, the older one sees
   * that its number is old and keeps its hands off the state. A change that
   * happened while the load was on its way also wins, so a slow answer
   * cannot undo work the developer just did.
   */
  async load(): Promise<TrackerState> {
    const number = ++this.loadNumber;
    const startedAt = this.changeNumber;
    const loaded = await this.repository.load();
    if (number !== this.loadNumber || this.changeNumber !== startedAt) {
      this.logger.warn('a late load was ignored', {
        loadNumber: number,
        latestLoad: this.loadNumber,
        changesSinceStart: this.changeNumber - startedAt,
      });
      return this.state;
    }
    this.state = loaded;
    this.notify();
    return this.state;
  }

  /** Merges a patch into the state, saves the log, and tells the listeners. */
  async applyPatch(patch: TrackerPatch): Promise<TrackerState> {
    const next = applyPatch(this.state, patch);
    this.state = next;
    this.changeNumber += 1;
    await this.repository.save(next);
    this.notify();
    return next;
  }

  private notify(): void {
    for (const listener of [...this.listeners]) {
      listener(this.state);
    }
  }
}
