import { Policy } from "../../src/domain/Policy.ts";
import type { PageContext } from "../../src/domain/PageContext.ts";
import { ResponseHeaders } from "../../src/domain/ResponseHeaders.ts";
import type { FileSource, Logger } from "../../src/domain/ports.ts";
import { InputError } from "../../src/domain/errors.ts";

export const POLICY_JSON = {
  phases: ["build", "accessibility"],
  broadHostPatterns: ["<all_urls>", "https://*/*"],
  broadHostPoints: 40,
  contentScriptAllSitesPoints: 30,
  scriptingWithBroadHostPoints: 25,
  apiPoints: { debugger: 50, tabs: 10 },
  reviewAt: 30,
  rejectAt: 70,
};

export const makePolicy = () => Policy.fromJson(POLICY_JSON);

// An in-memory FileSource: a Map of path to text.
export class FakeFiles implements FileSource {
  private readonly map: Map<string, string>;
  constructor(entries: Record<string, string>) {
    this.map = new Map(Object.entries(entries));
  }
  async readText(path: string): Promise<string> {
    const text = this.map.get(path);
    if (text === undefined) throw new InputError(`cannot read ${path}`);
    return text;
  }
}

export const silentLogger: Logger = { debug() {}, info() {}, warn() {}, error() {} };

export function context(overrides: Omit<Partial<PageContext>, "page"> & { page?: Partial<PageContext["page"]> } = {}): PageContext {
  const { page, ...rest } = overrides;
  return {
    url: "https://shop.example.com/",
    html: "<html></html>",
    headers: null,
    page: { title: "A title", metaDescription: "d".repeat(80), canonical: "https://shop.example.com/", jsonLdBlocks: [], ...page },
    ...rest,
  };
}

export const headersFrom = (text: string) => ResponseHeaders.fromText(text);
