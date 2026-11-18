import { describe, expect, it } from 'vitest';
import { CompleteStepUseCase } from '../../src/application/CompleteStepUseCase';
import { SaveNoteUseCase } from '../../src/application/SaveNoteUseCase';
import { TrackerStore } from '../../src/application/TrackerStore';
import { NoteNotFoundError } from '../../src/domain/errors';
import { InMemoryTrackerRepository } from '../fakes/InMemoryTrackerRepository';
import { RecordingLogger } from '../fakes/RecordingLogger';
import { fixedClock } from '../fakes/fixedClock';

async function makeStore() {
  const repository = new InMemoryTrackerRepository();
  const store = new TrackerStore(repository, new RecordingLogger());
  const saveNote = new SaveNoteUseCase(store, fixedClock);
  await saveNote.execute({ id: 'loop', title: 'The learning loop' });
  return { store, repository, saveNote };
}

describe('CompleteStepUseCase', () => {
  it('marks one step as done and saves the log', async () => {
    const { store, repository } = await makeStore();
    const useCase = new CompleteStepUseCase(store, fixedClock);

    await useCase.execute('loop', 'build');

    expect(store.getState().notes.loop?.steps.build.done).toBe(true);
    expect(repository.saveCount).toBe(2);
  });

  it('writes the note text of the step when it is given', async () => {
    const { store } = await makeStore();
    const useCase = new CompleteStepUseCase(store, fixedClock);

    await useCase.execute('loop', 'read', { note: 'Read the MDN page' });

    expect(store.getState().notes.loop?.steps.read.note).toBe('Read the MDN page');
  });

  it('keeps the note text of the step when no text is given', async () => {
    const { store } = await makeStore();
    const useCase = new CompleteStepUseCase(store, fixedClock);
    await useCase.execute('loop', 'read', { note: 'Read the MDN page' });

    await useCase.execute('loop', 'read');

    expect(store.getState().notes.loop?.steps.read.note).toBe('Read the MDN page');
  });

  it('opens a step again when the developer asks for it', async () => {
    const { store } = await makeStore();
    const useCase = new CompleteStepUseCase(store, fixedClock);
    await useCase.execute('loop', 'read');

    await useCase.execute('loop', 'read', { done: false });

    expect(store.getState().notes.loop?.steps.read.done).toBe(false);
  });

  it('refuses a roadmap item that is not in the log', async () => {
    const { store } = await makeStore();
    const useCase = new CompleteStepUseCase(store, fixedClock);

    await expect(useCase.execute('missing', 'read')).rejects.toThrow(NoteNotFoundError);
  });

  it('leaves the other notes alone', async () => {
    const { store, saveNote } = await makeStore();
    await saveNote.execute({ id: 'baseline', title: 'Baseline' });
    const useCase = new CompleteStepUseCase(store, fixedClock);

    await useCase.execute('loop', 'measure');

    expect(store.getState().notes.baseline?.doneCount()).toBe(0);
  });
});

describe('SaveNoteUseCase', () => {
  it('adds a roadmap item with the four steps', async () => {
    const { store } = await makeStore();

    expect(store.getState().notes.baseline).toBeUndefined();
  });

  it('renames a roadmap item that is already in the log', async () => {
    const { store, saveNote } = await makeStore();

    await saveNote.execute({ id: 'loop', title: 'Read, build, measure, explain' });

    expect(store.getState().notes.loop?.title).toBe('Read, build, measure, explain');
  });

  it('refuses an id that is not safe to use as a key', async () => {
    const { saveNote } = await makeStore();

    await expect(saveNote.execute({ id: 'Not Safe', title: 'Loop' })).rejects.toThrow();
  });
});
