// The test script for `git bisect run`. Git runs it inside the repo at
// every commit it checks out and reads the exit code:
//   0 = good, 1 = bad, 125 = skip (cannot test this commit).
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export const GOOD = 0;
export const BAD = 1;
export const SKIP = 125;

let loadCount = 0;

export async function classify(repoDir) {
  let module;
  try {
    const url = pathToFileURL(join(repoDir, "price.js")).href;
    module = await import(`${url}?load=${loadCount++}`);
  } catch {
    return SKIP; // the module does not load: we cannot judge this commit
  }
  if (typeof module.formatPrice !== "function") return SKIP;

  try {
    const ok = module.formatPrice(1905) === "$19.05" && module.formatPrice(5) === "$0.05";
    return ok ? GOOD : BAD;
  } catch {
    return BAD;
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  process.exit(await classify(process.cwd()));
}
