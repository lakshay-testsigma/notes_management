import { useRef, useState } from "react";
import type { Services } from "./services.js";
import { describeError } from "./describe-error.js";
import { parseSourceLines } from "./source-lines.js";

interface Props {
  services: Services;
  onSaved: (message: string) => void;
  onUnexpected: (error: unknown) => void;
}

export function NoteForm({ services, onSaved, onUnexpected }: Props) {
  const [roadmapItem, setRoadmapItem] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sources, setSources] = useState("");
  const [problems, setProblems] = useState<string[]>([]);
  const errorBox = useRef<HTMLDivElement>(null);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    try {
      const note = services.addNote.execute({ roadmapItem, title, body, sources: parseSourceLines(sources) });
      setProblems([]);
      setRoadmapItem(""); setTitle(""); setBody(""); setSources("");
      onSaved(`Saved "${note.title}". First review is due ${note.nextReviewOn}.`);
    } catch (error) {
      const messages = describeError(error);
      setProblems(messages);
      // Move focus to the summary so a keyboard or screen reader user hears the problems.
      queueMicrotask(() => errorBox.current?.focus());
      if (messages.length === 1 && messages[0].startsWith("Something unexpected")) onUnexpected(error);
    }
  }

  return (
    <form onSubmit={submit} noValidate aria-labelledby="form-heading">
      <h2 id="form-heading">Log what you learned today</h2>
      {problems.length > 0 && (
        <div ref={errorBox} tabIndex={-1} role="alert" className="errors">
          <p>Fix these before saving:</p>
          <ul>{problems.map((p) => <li key={p}>{p}</li>)}</ul>
        </div>
      )}
      <label htmlFor="roadmap-item">Roadmap item</label>
      <input id="roadmap-item" value={roadmapItem} onChange={(e) => setRoadmapItem(e.target.value)} />
      <label htmlFor="title">Title</label>
      <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <label htmlFor="body">What did you learn?</label>
      <p id="body-hint" className="hint">Write a feature key in backticks, such as `css.properties.gap`, to see its Baseline status.</p>
      <textarea id="body" rows={5} aria-describedby="body-hint" value={body} onChange={(e) => setBody(e.target.value)} />
      <label htmlFor="sources">Primary sources</label>
      <p id="sources-hint" className="hint">One per line: a link, or Label | link.</p>
      <textarea id="sources" rows={3} aria-describedby="sources-hint" value={sources} onChange={(e) => setSources(e.target.value)} />
      <button type="submit">Save note</button>
    </form>
  );
}
