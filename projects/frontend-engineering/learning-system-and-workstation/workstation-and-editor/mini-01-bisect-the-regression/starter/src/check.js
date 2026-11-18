// The test script for `git bisect run`. Git runs it inside the repo at
// every commit it checks out and reads the exit code:
//   0 = good, 1 = bad, 125 = skip (cannot test this commit).
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export const GOOD = 0;
export const BAD = 1;
export const SKIP = 125;

let loadCount = 0;

// TODO(1): Return GOOD, BAD or SKIP for the repo in `repoDir`.
//   - Import `price.js` from `repoDir`. If the import throws, return SKIP.
//   - GOOD only when formatPrice(1905) is "$19.05" and formatPrice(5) is "$0.05".
//   - Any other result, or a throw from formatPrice, is BAD.
// Tip: import(`${url}?load=${loadCount++}`) stops Node reusing an old copy.
export async function classify(repoDir) {
  void join; void loadCount; void pathToFileURL;
  throw new Error("TODO(1): classify is not implemented yet");
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  process.exit(await classify(process.cwd()));
}
