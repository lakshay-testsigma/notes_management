// Builds a throwaway Git repo with 30 commits of a price formatter.
// One commit (the "planted" commit) introduces a bug. One earlier commit
// is broken on purpose (a syntax error) so bisect has to skip it.
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const GOOD_BODY = `export function formatPrice(cents) {
  const dollars = Math.floor(cents / 100);
  const rest = String(cents % 100).padStart(2, "0");
  return "$" + dollars + "." + rest;
}
`;

// The planted bug: the cents are no longer padded, so 1905 prints "$19.5".
const BAD_BODY = `export function formatPrice(cents) {
  const dollars = Math.floor(cents / 100);
  const rest = String(cents % 100);
  return "$" + dollars + "." + rest;
}
`;

// Not valid JavaScript: importing this file throws, so the check must skip it.
const BROKEN_BODY = `export function formatPrice(cents) {
  return "$" + ;
}
`;

function git(dir, args) {
  const result = spawnSync("git", args, { cwd: dir, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed: ${result.stderr}`);
  }
  return result.stdout.trim();
}

function bodyFor(n, badCommit, skipCommit) {
  if (n === skipCommit) return BROKEN_BODY;
  return n >= badCommit ? BAD_BODY : GOOD_BODY;
}

export function createDemoRepo({ commitCount = 30, badCommit = 20, skipCommit = 16 } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "bisect-demo-"));
  git(dir, ["init", "-q"]);
  // Local config only: nothing here touches your global Git settings.
  git(dir, ["config", "user.name", "Demo Author"]);
  git(dir, ["config", "user.email", "demo@example.com"]);
  git(dir, ["config", "commit.gpgsign", "false"]);

  writeFileSync(join(dir, "package.json"), '{ "type": "module" }\n');

  const shas = [];
  for (let n = 1; n <= commitCount; n++) {
    const body = bodyFor(n, badCommit, skipCommit);
    writeFileSync(join(dir, "price.js"), `// revision ${n}\n${body}`);
    git(dir, ["add", "."]);
    const subject = n === badCommit ? "Simplify cents formatting" : `Tidy price module (${n})`;
    git(dir, ["commit", "-q", "-m", subject]);
    shas.push(git(dir, ["rev-parse", "HEAD"]));
  }

  return {
    dir,
    shas,
    goodSha: shas[0],
    badSha: shas[badCommit - 1],
    skipSha: shas[skipCommit - 1],
    headSha: shas[commitCount - 1],
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  };
}
