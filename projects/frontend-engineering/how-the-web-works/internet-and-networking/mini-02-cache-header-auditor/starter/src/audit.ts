import { classify } from "./classify.ts";
import { gradeHashedAsset, gradeHtml, gradeVaryAndEncoding } from "./rules.ts";
import type { Entry, Finding } from "./types.ts";

export function auditEntry(entry: Entry): Finding[] {
  const kind = classify(entry);
  const cache = kind === "hashed-asset" ? gradeHashedAsset(entry) : kind === "html" ? gradeHtml(entry) : [];
  return [...cache, ...gradeVaryAndEncoding(entry)];
}

export function auditAll(entries: Entry[]): Finding[] {
  return entries.flatMap(auditEntry);
}
