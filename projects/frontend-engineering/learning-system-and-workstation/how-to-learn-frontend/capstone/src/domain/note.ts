export interface SourceLink {
  label: string;
  url: string; // always http or https, checked by NoteValidator
}

// What the learner types in the form.
export interface NoteDraft {
  roadmapItem: string;
  title: string;
  body: string;
  sources: SourceLink[];
}

// A saved note. Feature keys are NOT stored: they are derived from `body`.
export interface Note extends NoteDraft {
  id: string;
  createdOn: string; // ISO date, YYYY-MM-DD
  reviewStep: number; // 0 = never reviewed
  nextReviewOn: string; // ISO date
}
