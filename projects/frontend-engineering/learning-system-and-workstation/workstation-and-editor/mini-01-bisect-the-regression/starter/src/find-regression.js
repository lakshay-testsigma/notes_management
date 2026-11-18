// Finds the first bad commit with `git bisect run` and prints it.
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createDemoRepo } from "./make-demo-repo.js";

const CHECK_SCRIPT = fileURLToPath(new URL("./check.js", import.meta.url));

function git(repoDir, args) {
  return spawnSync("git", args, { cwd: repoDir, encoding: "utf8" });
}

// TODO(2): Run `git bisect start <badRef> <goodRef>` in `repoDir`.
// Throw an Error that holds stderr when the exit status is not 0.
export function startBisect(repoDir, badRef, goodRef) {
  void git;
  throw new Error("TODO(2): startBisect is not implemented yet");
}

// TODO(3): Run `git bisect run <node> <checkScript>` in `repoDir` and return stdout.
// Use process.execPath for node. Throw when the exit status is not 0.
export function runBisect(repoDir, checkScript) {
  throw new Error("TODO(3): runBisect is not implemented yet");
}

// TODO(4): Find the line "<sha> is the first bad commit" in `output` and return the sha.
// Git may print 'bad' in quotes, so allow both. Throw when no line matches.
export function parseFirstBadCommit(output) {
  throw new Error("TODO(4): parseFirstBadCommit is not implemented yet");
}

// TODO(5): Run `git bisect reset` so the work tree returns to where it was.
export function resetBisect(repoDir) {
  throw new Error("TODO(5): resetBisect is not implemented yet");
}

export function findRegression({ repoDir, badRef = "HEAD", goodRef, checkScript = CHECK_SCRIPT }) {
  startBisect(repoDir, badRef, goodRef);
  let output;
  try {
    output = runBisect(repoDir, checkScript);
  } finally {
    resetBisect(repoDir); // always put the work tree back
  }
  return { sha: parseFirstBadCommit(output), output };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const demo = createDemoRepo();
  try {
    const { sha } = findRegression({ repoDir: demo.dir, goodRef: demo.goodSha });
    console.log(`First bad commit: ${sha}`);
    console.log(`Planted commit:   ${demo.badSha}`);
    console.log(sha === demo.badSha ? "Match." : "No match.");
  } catch (error) {
    console.log(`find-regression failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    demo.cleanup();
  }
}
