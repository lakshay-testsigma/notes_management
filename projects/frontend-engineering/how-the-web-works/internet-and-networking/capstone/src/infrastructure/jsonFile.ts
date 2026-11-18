import { readFileSync } from "node:fs";
import { InputError } from "../domain/errors.ts";

// Reads and parses one JSON file. Used once per input file (no file is loaded twice).
export function readJsonFile(path: string, fail: (message: string) => Error = (m) => new InputError(m)): unknown {
  let text: string;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    throw fail(`cannot read file ${path}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw fail(`${path} is not valid JSON`);
  }
}
