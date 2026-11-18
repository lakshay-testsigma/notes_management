import { InputError } from "../domain/errors.ts";
import type { FileSource, Gatherer, Logger } from "../domain/ports.ts";

export type Gathered<T> = { ok: true; data: T } | { ok: false; reason: string };

// Reads and parses each file once, even when many checks ask for it.
// A failure becomes a value, so one bad file never stops the others.
export class Artifacts {
  private readonly files: FileSource;
  private readonly logger: Logger;
  private readonly cache = new Map<string, Promise<Gathered<unknown>>>();

  constructor(files: FileSource, logger: Logger) {
    this.files = files;
    this.logger = logger;
  }

  get<T>(gatherer: Gatherer<T>, path: string): Promise<Gathered<T>> {
    const key = `${gatherer.source}:${path}`;
    let pending = this.cache.get(key);
    if (pending === undefined) {
      pending = this.load(gatherer, path);
      this.cache.set(key, pending);
    }
    return pending as Promise<Gathered<T>>;
  }

  private async load<T>(gatherer: Gatherer<T>, path: string): Promise<Gathered<T>> {
    try {
      const text = await this.files.readText(path);
      const data = gatherer.parse(text);
      this.logger.debug("input parsed", { source: gatherer.source });
      return { ok: true, data };
    } catch (error) {
      if (error instanceof InputError) {
        this.logger.error("input skipped", { source: gatherer.source, reason: error.message });
        return { ok: false, reason: error.message };
      }
      // Missing files and similar problems are expected; real bugs are logged and rethrown.
      if (error instanceof Error && "code" in error && error.code === "ENOENT") {
        this.logger.error("input skipped", { source: gatherer.source, reason: "file not found" });
        return { ok: false, reason: "File not found." };
      }
      this.logger.error("unexpected error", { source: gatherer.source, message: String(error) });
      throw error;
    }
  }
}
