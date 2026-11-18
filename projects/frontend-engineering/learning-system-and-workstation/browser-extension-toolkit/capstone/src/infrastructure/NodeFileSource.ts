import { readFile } from "node:fs/promises";
import { InputError } from "../domain/errors.ts";
import type { FileSource } from "../domain/ports.ts";

export class NodeFileSource implements FileSource {
  async readText(path: string): Promise<string> {
    try {
      return await readFile(path, "utf8");
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code ?? "unknown";
      throw new InputError(`cannot read ${path} (${code})`);
    }
  }
}
