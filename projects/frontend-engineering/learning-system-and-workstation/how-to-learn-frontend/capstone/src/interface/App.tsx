import { useState } from "react";
import type { Services } from "./services.js";
import { NoteCard } from "./NoteCard.js";
import { NoteForm } from "./NoteForm.js";
import { describeError } from "./describe-error.js";

interface Props {
  services: Services;
  onUnexpected?: (error: unknown) => void; // the composition root passes the logger here
}

export function App({ services, onUnexpected = () => {} }: Props) {
  const [version, setVersion] = useState(0); // bump to re-read the repository
  const [message, setMessage] = useState("");

  const notes = services.listNotes.execute();
  const due = services.listDueNotes.execute();
  void version;

  function review(id: string) {
    try {
      const note = services.markReviewed.execute(id);
      setMessage(`Reviewed "${note.title}". Next review ${note.nextReviewOn}.`);
    } catch (error) {
      setMessage(describeError(error).join(" "));
      onUnexpected(error);
    }
    setVersion((v) => v + 1);
  }

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header><h1>TIL learning journal</h1></header>
      <main id="main">
        <p role="status" className="status">{message}</p>
        <NoteForm
          services={services}
          onUnexpected={onUnexpected}
          onSaved={(text) => { setMessage(text); setVersion((v) => v + 1); }}
        />
        <section aria-labelledby="due-heading">
          <h2 id="due-heading">Due for review ({due.length})</h2>
          {due.length === 0
            ? <p>Nothing is due. Come back tomorrow, or log a new note.</p>
            : <ul>{due.map((n) => <NoteCard key={n.id} note={n} services={services} onReview={review} />)}</ul>}
        </section>
        <section aria-labelledby="all-heading">
          <h2 id="all-heading">All notes ({notes.length})</h2>
          {notes.length === 0
            ? <p>No notes yet. Log the first thing you learned.</p>
            : <ul>{notes.map((n) => <NoteCard key={n.id} note={n} services={services} />)}</ul>}
        </section>
      </main>
    </>
  );
}
