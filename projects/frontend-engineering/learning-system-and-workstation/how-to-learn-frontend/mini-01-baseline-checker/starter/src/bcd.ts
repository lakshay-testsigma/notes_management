import bcdJson from "@mdn/browser-compat-data";
import type { BcdData, BcdNode, Compat } from "./types.js";

// The package ships one prebuilt data.json, already resolved (no "mirror" values).
export const bcd = bcdJson as unknown as BcdData;

// TODO(1): Walk the tree by a dotted path such as "css.properties.gap" and return its __compat.
//   1. Split `path` on "." and step into `data` one part at a time.
//   2. If a part is missing, throw: Unknown feature "<path>": no part named "<part>".
//   3. At the end, if the node has no `__compat`, throw an error that contains the word "group".
//   4. Otherwise return the `__compat` object.
export function getFeature(data: BcdData, path: string): Compat {
  throw new Error("TODO(1): getFeature is not implemented yet");
}
