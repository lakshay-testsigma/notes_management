import { useState, type FormEvent } from 'react';
import { toSlug } from '../../domain/model';
import type { TrackerController } from '../TrackerController';
import { useTracker } from '../hooks/useTracker';
import { Dashboard } from './Dashboard';

export interface AppProps {
  controller: TrackerController;
}

/** The shell of the app: the form, the dashboard, and the export. */
export function App({ controller }: AppProps) {
  const tracker = useTracker(controller);
  const [title, setTitle] = useState('');
  const [exported, setExported] = useState<string | null>(null);

  function addItem(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const name = title.trim();
    if (name.length === 0) {
      return;
    }
    tracker.saveNote({ id: toSlug(name), title: name });
    setTitle('');
  }

  return (
    <main>
      <h1>Learning tracker</h1>
      <p className="lead">
        One note per roadmap item, with the four steps of the learning loop: read, build, measure, explain.
      </p>

      <form className="add-form" onSubmit={addItem}>
        <label htmlFor="roadmap-item">Roadmap item</label>
        <input
          id="roadmap-item"
          name="roadmap-item"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Browser support literacy"
          autoComplete="off"
        />
        <button type="submit">Add item</button>
      </form>

      {tracker.status === 'loading' ? <p role="status">Loading your log...</p> : null}
      {tracker.error ? (
        <p role="alert" className="error">
          {tracker.error}
        </p>
      ) : null}
      {tracker.dashboard ? <Dashboard dashboard={tracker.dashboard} onToggle={tracker.setStep} /> : null}

      <section className="export" aria-labelledby="export-heading">
        <h2 id="export-heading">Export</h2>
        <button
          type="button"
          onClick={() => {
            void tracker.exportLog().then((markdown) => {
              if (markdown !== null) {
                setExported(markdown);
              }
            });
          }}
        >
          Export log as Markdown
        </button>
        {exported ? (
          <pre aria-live="polite" className="export-output">
            {exported}
          </pre>
        ) : null}
      </section>
    </main>
  );
}
