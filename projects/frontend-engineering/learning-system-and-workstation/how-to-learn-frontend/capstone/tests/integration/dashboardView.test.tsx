// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CompleteStepUseCase } from '../../src/application/CompleteStepUseCase';
import { ExportLogUseCase } from '../../src/application/ExportLogUseCase';
import { LoadDashboardUseCase } from '../../src/application/LoadDashboardUseCase';
import { SaveNoteUseCase } from '../../src/application/SaveNoteUseCase';
import { TrackerStore } from '../../src/application/TrackerStore';
import { App } from '../../src/interface/components/App';
import { TrackerController } from '../../src/interface/TrackerController';
import { fixedClock } from '../fakes/fixedClock';
import { InMemoryTrackerRepository } from '../fakes/InMemoryTrackerRepository';
import { RecordingLogger } from '../fakes/RecordingLogger';

function makeController(): TrackerController {
  const store = new TrackerStore(new InMemoryTrackerRepository(), new RecordingLogger());
  return new TrackerController(
    store,
    new LoadDashboardUseCase(store),
    new CompleteStepUseCase(store, fixedClock),
    new SaveNoteUseCase(store, fixedClock),
    new ExportLogUseCase(store),
  );
}

describe('the dashboard in the browser', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows an empty log and then the progress of the item the developer added', async () => {
    render(<App controller={makeController()} />);

    expect(await screen.findByText('No roadmap items yet. Add one above to start the loop.')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Roadmap item'), { target: { value: 'The learning loop' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add item' }));

    expect(await screen.findByRole('heading', { name: 'The learning loop' })).toBeTruthy();
    expect(screen.getByText('0 of 4 steps done (0%). 0 of 1 roadmap items finished.')).toBeTruthy();
  });

  it('moves the progress forward when a step is checked, and names the gaps', async () => {
    render(<App controller={makeController()} />);

    fireEvent.change(screen.getByLabelText('Roadmap item'), { target: { value: 'The learning loop' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add item' }));
    await screen.findByRole('heading', { name: 'The learning loop' });

    fireEvent.click(screen.getByLabelText('read'));

    await waitFor(() => {
      expect(screen.getByText('1 of 4 steps done (25%). 0 of 1 roadmap items finished.')).toBeTruthy();
    });
    expect(screen.getByText('The learning loop: build')).toBeTruthy();
  });

  it('exports the log as Markdown', async () => {
    render(<App controller={makeController()} />);

    fireEvent.change(screen.getByLabelText('Roadmap item'), { target: { value: 'The learning loop' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add item' }));
    await screen.findByRole('heading', { name: 'The learning loop' });

    fireEvent.click(screen.getByRole('button', { name: 'Export log as Markdown' }));

    const output = await screen.findByText(/# Learning log/);
    expect(output.textContent).toContain('## The learning loop');
  });
});
