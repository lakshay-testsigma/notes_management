import { UnknownFeatureError } from "../domain/errors.js";
import type { Compat } from "../domain/feature.js";

// Walks the browser-compat-data tree by a dotted path; `__compat` marks a feature.
// Used by scripts/build-snapshot.ts, not at runtime in the browser.
export class CompatTreeReader {
  constructor(private readonly tree: Record<string, unknown>) {}

  read(key: string): Compat {
    let node: unknown = this.tree;
    for (const part of key.split(".")) {
      const next = (node as Record<string, unknown> | undefined)?.[part];
      if (typeof next !== "object" || next === null) throw new UnknownFeatureError(key, part);
      node = next;
    }
    const compat = (node as { __compat?: Compat }).__compat;
    if (!compat) throw new UnknownFeatureError(key, "__compat");
    return compat;
  }
}
