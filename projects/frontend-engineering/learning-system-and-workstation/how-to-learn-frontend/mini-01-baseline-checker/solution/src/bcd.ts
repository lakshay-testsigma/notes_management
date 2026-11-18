import bcdJson from "@mdn/browser-compat-data";
import type { BcdData, BcdNode, Compat } from "./types.js";

// The package ships one prebuilt data.json, already resolved (no "mirror" values).
export const bcd = bcdJson as unknown as BcdData;

// Walk the tree by a dotted path such as "css.properties.gap" and return its __compat.
export function getFeature(data: BcdData, path: string): Compat {
  let node: unknown = data;
  const parts = path.split(".");
  for (const part of parts) {
    const next: unknown = (node as BcdNode)?.[part];
    if (next === undefined || typeof next !== "object" || next === null) {
      throw new Error(`Unknown feature "${path}": no part named "${part}".`);
    }
    node = next;
  }
  const compat = (node as BcdNode).__compat;
  if (!compat) {
    throw new Error(`"${path}" is a group, not a feature. Try a longer path.`);
  }
  return compat;
}
