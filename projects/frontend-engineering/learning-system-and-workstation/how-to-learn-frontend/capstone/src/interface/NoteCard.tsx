import type { Note } from "../domain/note.js";
import type { Services } from "./services.js";
import { FeatureBadges } from "./FeatureBadges.js";

interface Props {
  note: Note;
  services: Services;
  onReview?: (id: string) => void; // present only in the "due" list
}

export function NoteCard({ note, services, onReview }: Props) {
  return (
    <li className="note">
      <h3>{note.title}</h3>
      <p className="meta">
        Roadmap item: {note.roadmapItem}. Logged {note.createdOn}. Next review {note.nextReviewOn}.
      </p>
      <p className="body">{note.body}</p>
      <FeatureBadges features={services.featureStatuses.execute(note.body)} />
      <ul className="sources" aria-label="Primary sources">
        {note.sources.map((source) => (
          <li key={source.url}>
            <a href={source.url} rel="noopener noreferrer">{source.label}</a>
          </li>
        ))}
      </ul>
      {onReview && (
        <button type="button" onClick={() => onReview(note.id)}>
          Mark &quot;{note.title}&quot; as reviewed
        </button>
      )}
    </li>
  );
}
