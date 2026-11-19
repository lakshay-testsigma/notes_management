import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { CAPTURE_SCHEMA } from "../domain/ports.js";
import { CaptureFormatError } from "../domain/errors.js";
import { Result } from "../domain/Result.js";

const SAFE_NAME = /^[A-Za-z0-9._-]+\.json$/;

// Saves and loads the raw capture as a JSON file, so a report can be rebuilt without Chrome.
export class CaptureStore {
  constructor(directory) {
    this.directory = directory;
  }

  async save(capture) {
    await mkdir(this.directory, { recursive: true });
    const host = new URL(capture.url).hostname.replace(/[^A-Za-z0-9.-]/g, "_");
    const name = `${capture.capturedAt.replace(/[:.]/g, "-")}-${host}.json`;
    const target = path.join(this.directory, name);
    // Write to a temp file and rename, so a crash never leaves half a file.
    await writeFile(`${target}.tmp`, JSON.stringify(capture));
    await rename(`${target}.tmp`, target);
    return name;
  }

  async load(name) {
    if (!SAFE_NAME.test(name)) return Result.err(new CaptureFormatError("Capture names use letters, digits, dot, dash and underscore"));
    let parsed;
    try {
      parsed = JSON.parse(await readFile(path.join(this.directory, name), "utf8"));
    } catch (error) {
      return Result.err(new CaptureFormatError(`Cannot read capture ${name}: ${error.message}`));
    }
    if (parsed?.schema !== CAPTURE_SCHEMA || !Array.isArray(parsed.events)) {
      return Result.err(new CaptureFormatError("The file is not a capture of schema 1"));
    }
    return Result.ok(parsed);
  }
}
