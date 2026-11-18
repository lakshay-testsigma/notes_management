import type { Entry, Kind } from "./types.ts";

// TODO(2): Say whether an entry is html, a hashed-asset (a build tool put a content hash in the file name) or other.
export function classify(entry: Entry): Kind {
  throw new Error("TODO(2): classify is not implemented yet");
}
