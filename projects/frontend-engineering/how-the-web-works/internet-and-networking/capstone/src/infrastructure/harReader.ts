import { InputError } from "../domain/errors.ts";
import type { HttpEntry } from "../domain/types.ts";
import { asArray, asNumber, asObject, asString } from "./fields.ts";

const fail = (message: string) => new InputError(message);

export interface HarContent {
  client: string;
  entries: HttpEntry[];
}

// Turns a HAR 1.2 document into the entries the checks read.
export class HarReader {
  read(document: unknown): HarContent {
    const log = asObject(asObject(document, "HAR file", fail).log, "log", fail);
    const creator = asObject(log.creator ?? {}, "log.creator", fail);
    const client = [creator.name, creator.version].filter((p) => typeof p === "string").join(" ") || "an unnamed client";
    const entries = asArray(log.entries, "log.entries", fail).map((raw, i) => this.readEntry(raw, `log.entries[${i}]`));
    return { client, entries };
  }

  private readEntry(raw: unknown, path: string): HttpEntry {
    const entry = asObject(raw, path, fail);
    const request = asObject(entry.request, `${path}.request`, fail);
    const response = asObject(entry.response, `${path}.response`, fail);
    const content = asObject(response.content ?? {}, `${path}.response.content`, fail);
    const headers = asArray(response.headers ?? [], `${path}.response.headers`, fail).map((h, i) => {
      const header = asObject(h, `${path}.response.headers[${i}]`, fail);
      return { name: asString(header.name, "header name", fail).toLowerCase(), value: asString(header.value, "header value", fail) };
    });
    return {
      method: asString(request.method, `${path}.request.method`, fail).toUpperCase(),
      url: asString(request.url, `${path}.request.url`, fail),
      status: asNumber(response.status, `${path}.response.status`, fail),
      httpVersion: asString(response.httpVersion ?? "", `${path}.response.httpVersion`, fail),
      mimeType: typeof content.mimeType === "string" ? content.mimeType : "",
      decodedSize: typeof content.size === "number" ? content.size : 0,
      headers,
    };
  }
}
