// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { CompleteStepUseCase } from '../../src/application/CompleteStepUseCase';
import { LoadDashboardUseCase } from '../../src/application/LoadDashboardUseCase';
import { SaveNoteUseCase } from '../../src/application/SaveNoteUseCase';
import { TrackerStore } from '../../src/application/TrackerStore';
import { BrowserStorageAdapter } from '../../src/infrastructure/BrowserStorageAdapter';
import { LocalStorageTrackerRepository } from '../../src/infrastructure/LocalStorageTrackerRepository';
import { fixedClock } from '../fakes/fixedClock';
import { RecordingLogger } from '../fakes/RecordingLogger';

const KEY = 'learning-tracker';

function makeApp() {
  const logger = new RecordingLogger();
  const storage = new BrowserStorageAdapter();
  const repository = new LocalStorageTrackerRepository(storage, KEY, 2, logger);
  const store = new TrackerStore(repository, logger);
  return {
    logger,
    store,
    saveNote: new SaveNoteUseCase(store, fixedClock),
    completeStep: new CompleteStepUseCase(store, fixedClock),
    loadDashboard: new LoadDashboardUseCase(store),
  };
}

describe('the learning log in the browser', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('keeps the log in the browser and reads it back in a new session', async () => {
    const app = makeApp();

    await app.saveNote.execute({ id: 'loop', title: 'The learning loop' });
    await app.completeStep.execute('loop', 'read');

    const saved = JSON.parse(window.localStorage.getItem(KEY) ?? '{}');
    expect(saved.version).toBe(2);
    expect(saved.notes).toHaveLength(1);

    const secondSession = makeApp();
    const dashboard = await secondSession.loadDashboard.execute();

    expect(dashboard.notes).toHaveLength(1);
    expect(dashboard.progress.doneSteps).toBe(1);
    expect(dashboard.gaps.map((gap) => gap.step)).toEqual(['build', 'measure', 'explain']);
  });

  it('migrates a log that an older version wrote', async () => {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({
        version: 1,
        notes: [
          {
            id: 'loop',
            title: 'The learning loop',
            steps: ['read', 'build'],
            createdAt: '2026-11-19',
            updatedAt: '2026-11-19',
          },
        ],
      }),
    );

    const app = makeApp();
    const dashboard = await app.loadDashboard.execute();

    expect(dashboard.progress.doneSteps).toBe(2);
    expect(dashboard.notes[0]?.missing).toEqual(['measure', 'explain']);
    expect(JSON.parse(window.localStorage.getItem(KEY) ?? '{}').version).toBe(2);
  });

  it('puts a log that a newer build wrote aside instead of guessing', async () => {
    window.localStorage.setItem(KEY, JSON.stringify({ version: 99, notes: [{ id: 'loop' }] }));

    const app = makeApp();
    const dashboard = await app.loadDashboard.execute();

    expect(dashboard.notes).toEqual([]);
    expect(window.localStorage.getItem(KEY)).toBeNull();
    expect(app.logger.entries.some((entry) => entry.level === 'error')).toBe(true);
  });

  it('starts with an empty log when nothing was saved yet', async () => {
    const app = makeApp();

    const dashboard = await app.loadDashboard.execute();

    expect(dashboard.notes).toEqual([]);
    expect(dashboard.progress.percent).toBe(0);
  });
});
