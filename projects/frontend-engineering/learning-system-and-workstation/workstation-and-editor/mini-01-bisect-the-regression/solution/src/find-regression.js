// Finds the first bad commit with `git bisect run` and prints it.
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createDemoRepo } from "./make-demo-repo.js";

const CHECK_SCRIPT = fileURLToPath(new URL("./check.js", import.meta.url));

function git(repoDir, args) {
  return spawnSync("git", args, { cwd: repoDir, encoding: "utf8" });
}

export function startBisect(repoDir, badRef, goodRef) {
  const result = git(repoDir, ["bisect", "start", badRef, goodRef]);
  if (result.status !== 0) throw new Error(`bisect start failed: ${result.stderr}`);
}

export function runBisect(repoDir, checkScript) {
  const result = git(repoDir, ["bisect", "run", process.execPath, checkScript]);
  if (result.status !== 0) throw new Error(`bisect run failed: ${result.stderr}`);
  return result.stdout;
}

export function parseFirstBadCommit(output) {
  const match = output.match(/^([0-9a-f]{7,40}) is the first '?bad'? commit$/m);
  if (!match) throw new Error("No 'is the first bad commit' line in the bisect output");
  return match[1];
}

export function resetBisect(repoDir) {
  git(repoDir, ["bisect", "reset"]);
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
