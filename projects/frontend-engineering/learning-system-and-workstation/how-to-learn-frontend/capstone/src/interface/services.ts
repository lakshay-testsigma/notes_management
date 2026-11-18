import type { AddNote } from "../application/add-note.js";
import type { GetFeatureStatuses } from "../application/get-feature-statuses.js";
import type { ListDueNotes } from "../application/list-due-notes.js";
import type { ListNotes } from "../application/list-notes.js";
import type { MarkReviewed } from "../application/mark-reviewed.js";

// The use cases the screens may call. Components get this as a prop, never build it themselves.
export interface Services {
  addNote: AddNote;
  listNotes: ListNotes;
  listDueNotes: ListDueNotes;
  markReviewed: MarkReviewed;
  featureStatuses: GetFeatureStatuses;
}
