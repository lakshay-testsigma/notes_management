import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { buildNote, validateNote, type StepId } from "./note";
import { noteFileName } from "./paths";

type Options = {
  command: "create" | "check";
  topic: string;
  date: string;
  out: string;
  file: string;
};

function parseArgs(argv: string[]): Options {
  const options: Options = {
    command: "create",
    topic: "learning-loop",
    date: new Date().toISOString().slice(0, 10),
    out: "notes",
    file: "",
  };

  const flags = argv[0] === "check" ? argv.slice(1) : argv;
  if (argv[0] === "check") options.command = "check";

  for (let index = 0; index < flags.length; index += 1) {
    const value = flags[index + 1] ?? "";
    if (flags[index] === "--topic") {
      options.topic = value;
      index += 1;
    } else if (flags[index] === "--date") {
      options.date = value;
      index += 1;
    } else if (flags[index] === "--out") {
      options.out = value;
      index += 1;
    } else if (flags[index] === "--file") {
      options.file = value;
      index += 1;
    }
  }

  return options;
}

/**
 * Tell the learner which steps of the loop are still empty.
 */
export function printMissing(missing: StepId[]): void {
  if (missing.length === 0) {
    console.log("All four steps have content.");
    return;
  }
  console.log(`Still empty: ${missing.join(", ")}`);
}

/**
 * Write the empty note for one roadmap item and report its empty steps.
 */
export async function createNote(options: Options): Promise<string> {
  const note = buildNote({ topic: options.topic, date: options.date });
  await mkdir(options.out, { recursive: true });
  const file = path.join(options.out, noteFileName(options.date, options.topic));
  await writeFile(file, note, "utf8");
  console.log(`Created ${file}`);
  printMissing(validateNote(note));
  return file;
}

/**
 * Check a note the learner already filled in.
 */
export async function checkNote(options: Options): Promise<void> {
  const markdown = await readFile(options.file, "utf8");
  const missing = validateNote(markdown);
  printMissing(missing);
  if (missing.length > 0) process.exitCode = 1;
}

export async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  if (options.command === "check") {
    await checkNote(options);
    return;
  }
  await createNote(options);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
