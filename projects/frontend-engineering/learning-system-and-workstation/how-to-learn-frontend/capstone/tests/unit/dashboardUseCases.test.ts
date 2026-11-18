import { describe, expect, it } from 'vitest';
import { ExportLogUseCase } from '../../src/application/ExportLogUseCase';
import { LoadDashboardUseCase } from '../../src/application/LoadDashboardUseCase';
import { SaveNoteUseCase } from '../../src/application/SaveNoteUseCase';
import { TrackerStore } from '../../src/application/TrackerStore';
import { InMemoryTrackerRepository } from '../fakes/InMemoryTrackerRepository';
import { RecordingLogger } from '../fakes/RecordingLogger';
import { fixedClock } from '../fakes/fixedClock';

async function makeApp() {
  const repository = new InMemoryTrackerRepository();
  const store = new TrackerStore(repository, new RecordingLogger());
  const saveNote = new SaveNoteUseCase(store, fixedClock);
  const loadDashboard = new LoadDashboardUseCase(store);
  const exportLog = new ExportLogUseCase(store);
  return { store, repository, saveNote, loadDashboard, exportLog };
}

describe('LoadDashboardUseCase', () => {
  it('shows an empty dashboard when the log is empty', async () => {
    const { loadDashboard } = await makeApp();

    const dashboard = await loadDashboard.execute();

    expect(dashboard.notes).toEqual([]);
    expect(dashboard.progress.percent).toBe(0);
    expect(dashboard.gaps).toEqual([]);
  });

  it('shows the progress and the gaps of the saved log', async () => {
    const { loadDashboard, saveNote } = await makeApp();
    await saveNote.execute({ id: 'loop', title: 'The learning loop' });

    const dashboard = await loadDashboard.execute();

    expect(dashboard.notes).toHaveLength(1);
    expect(dashboard.progress.doneSteps).toBe(0);
    expect(dashboard.gaps.map((gap) => gap.step)).toEqual(['read', 'build', 'measure', 'explain']);
  });

  it('reads the log from the repository', async () => {
    const { loadDashboard, repository } = await makeApp();
    repository.state = { notes: {} };

    await loadDashboard.execute();

    expect(repository.state.notes).toEqual({});
  });
});

describe('ExportLogUseCase', () => {
  it('renders the whole log as Markdown', async () => {
    const { exportLog, saveNote } = await makeApp();
    await saveNote.execute({ id: 'loop', title: 'The learning loop' });

    const markdown = await exportLog.execute();

    expect(markdown).toContain('## The learning loop');
    expect(markdown).toContain('### measure - missing');
  });

  it('renders an empty log without failing', async () => {
    const { exportLog } = await makeApp();

    expect(await exportLog.execute()).toContain('# Learning log');
  });
});
