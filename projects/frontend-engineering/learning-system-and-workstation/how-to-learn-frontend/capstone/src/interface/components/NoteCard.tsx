import type { NoteSummary } from '../../domain/Progress';
import { STEP_IDS, type StepId } from '../../domain/model';

export interface NoteCardProps {
  note: NoteSummary;
  onToggle: (noteId: string, step: StepId, done: boolean) => void;
}

/** One roadmap item with its four steps of the learning loop. */
export function NoteCard({ note, onToggle }: NoteCardProps) {
  return (
    <li className="note-card">
      <h3>{note.title}</h3>
      <p className="note-meta">
        {note.doneSteps} of {note.totalSteps} steps done
        {note.complete ? ' - finished' : ` - missing ${note.missing.join(', ')}`}
      </p>
      <ul className="steps">
        {STEP_IDS.map((step) => {
          const record = note.steps[step];
          const inputId = `${note.id}-${step}`;
          return (
            <li key={step}>
              <input
                id={inputId}
                type="checkbox"
                checked={record.done}
                onChange={() => onToggle(note.id, step, !record.done)}
              />
              <label htmlFor={inputId}>{step}</label>
              {record.note ? <span className="step-note">{record.note}</span> : null}
            </li>
          );
        })}
      </ul>
    </li>
  );
}
