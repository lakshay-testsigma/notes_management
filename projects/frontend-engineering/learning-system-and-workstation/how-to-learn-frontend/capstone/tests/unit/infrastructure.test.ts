import { describe, expect, it } from "vitest";
import { Config } from "../../src/infrastructure/config.js";
import { JsonLogger } from "../../src/infrastructure/json-logger.js";
import { LocalStorageNoteRepository } from "../../src/infrastructure/local-storage-note-repository.js";
import { parseSourceLines } from "../../src/interface/source-lines.js";
import { RecordingLogger } from "../helpers.js";

describe("Config", () => {
  it("uses defaults", () => {
    expect(Config.fromEnv({})).toMatchObject({ storageKey: "til-journal.notes.v1", logLevel: "info" });
  });
  it("fails at startup on a bad log level", () => {
    expect(() => Config.fromEnv({ VITE_LOG_LEVEL: "loud" })).toThrow(/Use "info" or "error"/);
  });
});

describe("JsonLogger", () => {
  it("writes one JSON line with the session id", () => {
    const lines: string[] = [];
    new JsonLogger("info", "s1", (l) => lines.push(l)).info("hello", { a: 1 });
    expect(JSON.parse(lines[0])).toMatchObject({ level: "info", event: "hello", sessionId: "s1", a: 1 });
  });
  it("skips info at level error but still writes errors", () => {
    const lines: string[] = [];
    const logger = new JsonLogger("error", "s1", (l) => lines.push(l));
    logger.info("quiet");
    logger.error("loud");
    expect(lines).toHaveLength(1);
  });
});

describe("LocalStorageNoteRepository corrupt data", () => {
  it("logs and returns an empty list", () => {
    const logger = new RecordingLogger();
    const repo = new LocalStorageNoteRepository({ getItem: () => "{oops", setItem: () => {} }, "k", logger);
    expect(repo.all()).toEqual([]);
    expect(logger.events[0]).toMatchObject({ level: "error", event: "storage.corrupt" });
  });
});

describe("parseSourceLines", () => {
  it("parses plain links, labelled links, and skips blank lines", () => {
    expect(parseSourceLines("https://a.dev\n\nMDN | https://b.dev")).toEqual([
      { label: "", url: "https://a.dev" },
      { label: "MDN", url: "https://b.dev" },
    ]);
  });
});
