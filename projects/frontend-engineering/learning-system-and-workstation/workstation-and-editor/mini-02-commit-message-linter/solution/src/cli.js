import { readFileSync } from "node:fs";
import { lint } from "./lint.js";
import { defaultConfig } from "./config.js";
import { stripComments, exitCodeFor } from "./hook.js";
import { bumpFor } from "./bump.js";

// Runs the linter and returns what to print and which code to exit with.
export function runCli(args, readStdin = () => readFileSync(0, "utf8")) {
  const editAt = args.indexOf("--edit");
  if (editAt !== -1 && !args[editAt + 1]) {
    return { code: 2, out: "", err: "usage: cli.js [--edit <file>] (or pipe a message on stdin)\n" };
  }
  const raw = editAt !== -1 ? readFileSync(args[editAt + 1], "utf8") : readStdin();
  const result = lint(stripComments(raw), defaultConfig);

  const lines = [
    ...result.errors.map((p) => `error   [${p.name}] ${p.message}`),
    ...result.warnings.map((p) => `warning [${p.name}] ${p.message}`),
  ];
  lines.push(result.valid ? `ok (version bump: ${bumpFor(result.parsed)})` : "commit message rejected");
  return { code: exitCodeFor(result), out: lines.join("\n") + "\n", err: "" };
}

// Exit 2 means "the tool itself failed", so it never looks like a rejected message.
try {
  const { code, out, err } = runCli(process.argv.slice(2));
  process.stdout.write(out);
  process.stderr.write(err);
  process.exitCode = code;
} catch (error) {
  process.stderr.write(`error: ${error.message}\n`);
  process.exitCode = 2;
}
