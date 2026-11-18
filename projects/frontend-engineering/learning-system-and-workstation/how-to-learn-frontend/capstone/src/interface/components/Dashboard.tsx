import type { Dashboard } from '../../domain/Progress';
import type { StepId } from '../../domain/model';
import { NoteCard } from './NoteCard';

export interface DashboardProps {
  dashboard: Dashboard;
  onToggle: (noteId: string, step: StepId, done: boolean) => void;
}

/** The progress of the roadmap, the notes, and the steps that are missing. */
export function Dashboard({ dashboard, onToggle }: DashboardProps) {
  const { progress, notes, gaps } = dashboard;

  return (
    <section className="dashboard" aria-labelledby="progress-heading">
      <h2 id="progress-heading">Progress</h2>
      <p className="progress-line">
        {progress.doneSteps} of {progress.totalSteps} steps done ({progress.percent}%).{' '}
        {progress.completeNotes} of {progress.totalNotes} roadmap items finished.
      </p>

      <h3>Roadmap items</h3>
      {notes.length === 0 ? (
        <p className="empty">No roadmap items yet. Add one above to start the loop.</p>
      ) : (
        <ul className="notes">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onToggle={onToggle} />
          ))}
        </ul>
      )}

      <h3>Gaps</h3>
      {gaps.length === 0 ? (
        <p className="empty">No gaps. Every step of every item is done.</p>
      ) : (
        <ul className="gaps">
          {gaps.map((gap) => (
            <li key={`${gap.noteId}-${gap.step}`}>
              {gap.noteTitle}: {gap.step}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
