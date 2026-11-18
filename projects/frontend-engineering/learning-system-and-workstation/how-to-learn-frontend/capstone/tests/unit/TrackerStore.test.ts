import { describe, expect, it } from 'vitest';
import { TrackerStore } from '../../src/application/TrackerStore';
import type { TrackerState } from '../../src/domain/TrackerState';
import { InMemoryTrackerRepository } from '../fakes/InMemoryTrackerRepository';
import { RecordingLogger } from '../fakes/RecordingLogger';

function makeStore() {
  const repository = new InMemoryTrackerRepository();
  const logger = new RecordingLogger();
  return { store: new TrackerStore(repository, logger), repository, logger };
}

describe('TrackerStore', () => {
  it('starts with an empty log', () => {
    const { store } = makeStore();

    expect(store.getState().notes).toEqual({});
  });

  it('saves the log after every change and tells its subscribers', async () => {
    const { store, repository } = makeStore();
    const seen: TrackerState[] = [];
    store.subscribe((state) => seen.push(state));

    await store.applyPatch({
      notes: { loop: { title: 'The learning loop', createdAt: '2026-11-19', steps: {} } },
    });

    expect(repository.saveCount).toBe(1);
    expect(seen).toHaveLength(1);
    expect(seen[0]?.notes.loop?.title).toBe('The learning loop');
  });

  it('removes the listener when the returned function is called', async () => {
    const { store } = makeStore();
    let calls = 0;
    const unsubscribe = store.subscribe(() => {
      calls += 1;
    });

    unsubscribe();
    await store.applyPatch({ notes: { loop: { title: 'Loop', createdAt: '2026-11-19', steps: {} } } });

    expect(calls).toBe(0);
  });

  it('ignores a late load, so a slow answer cannot undo a newer change', async () => {
    const { store, repository, logger } = makeStore();
    let resolveLoad: (state: TrackerState) => void = () => undefined;
    repository.load = () => new Promise<TrackerState>((resolve) => {
      resolveLoad = resolve;
    });

    const slowLoad = store.load();
    await store.applyPatch({ notes: { loop: { title: 'Loop', createdAt: '2026-11-19', steps: {} } } });
    resolveLoad({ notes: {} });
    await slowLoad;

    expect(store.getState().notes.loop?.title).toBe('Loop');
    expect(logger.entries.some((entry) => entry.message === 'a late load was ignored')).toBe(true);
  });

  it('keeps the newest load when two loads run at the same time', async () => {
    const { store, repository } = makeStore();
    const answers: ((state: TrackerState) => void)[] = [];
    repository.load = () =>
      new Promise<TrackerState>((resolve) => {
        answers.push(resolve);
      });

    const first = store.load();
    const second = store.load();
    const empty = { notes: {} };
    answers[1]?.(empty);
    answers[0]?.({ notes: {} });

    await Promise.all([first, second]);

    expect(store.getState().notes).toEqual({});
  });
});
