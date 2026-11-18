import { readFile } from "node:fs/promises";
import type { FileSource } from "../domain/ports.ts";

export class NodeFileSource implements FileSource {
  readText(path: string): Promise<string> {
    return readFile(path, "utf8");
  }
}
