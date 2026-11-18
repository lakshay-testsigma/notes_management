import { describe, expect, it } from "vitest";
import { Artifacts } from "../../src/application/Artifacts.ts";
import { Ranker } from "../../src/application/Ranker.ts";
import { TriageUseCase } from "../../src/application/TriageUseCase.ts";
import { Budgets } from "../../src/domain/Budgets.ts";
import { InputError, UsageError } from "../../src/domain/errors.ts";
import type { Audit, FileSource, Gatherer, Logger } from "../../src/domain/ports.ts";
import { Config } from "../../src/infrastructure/Config.ts";
import { JsonLogger } from "../../src/infrastructure/JsonLogger.ts";

const silent: Logger = { debug() {}, info() {}, error() {} };

class MapFiles implements FileSource {
  reads = 0;
  files: Record<string, string>;
  constructor(files: Record<string, string>) {
    this.files = files;
  }
  async readText(path: string): Promise<string> {
    this.reads += 1;
    const text = this.files[path];
    if (text === undefined) throw Object.assign(new Error("missing"), { code: "ENOENT" });
    return text;
  }
}

const numberGatherer: Gatherer<number> = {
  source: "har",
  parse(text) {
    const value = Number(text);
    if (Number.isNaN(value)) throw new InputError("not a number");
    return value;
  },
};

describe("Artifacts", () => {
  it("reads and parses a file once", async () => {
    const files = new MapFiles({ a: "5" });
    const artifacts = new Artifacts(files, silent);
    await artifacts.get(numberGatherer, "a");
    const second = await artifacts.get(numberGatherer, "a");
    expect(second).toEqual({ ok: true, data: 5 });
    expect(files.reads).toBe(1);
  });

  it("turns parse errors and missing files into values", async () => {
    const artifacts = new Artifacts(new MapFiles({ bad: "x" }), silent);
    expect(await artifacts.get(numberGatherer, "bad")).toEqual({ ok: false, reason: "not a number" });
    expect(await artifacts.get(numberGatherer, "nope")).toEqual({ ok: false, reason: "File not found." });
  });
});

describe("TriageUseCase", () => {
  const audit: Audit<number> = {
    source: "har",
    run: (value) => [{ source: "har", id: "x", title: "x", detail: "", mode: "fail", savingsMs: value, bytes: 0, dataKind: "recorded" }],
  };
  const traceGatherer: Gatherer<number> = { source: "trace", parse: () => { throw new InputError("broken trace"); } };
  const traceAudit: Audit<number> = { source: "trace", run: () => [] };

  it("keeps working when one input is unreadable", async () => {
    const files = new MapFiles({ h: "7", t: "?" });
    const useCase = new TriageUseCase(
      [{ gatherer: numberGatherer, audit }, { gatherer: traceGatherer, audit: traceAudit }],
      new Artifacts(files, silent), new Ranker(), silent,
    );
    const report = await useCase.run({ har: "h", trace: "t" }, Budgets.defaults());
    expect(report.checked).toEqual(["har"]);
    expect(report.skipped).toEqual([{ source: "trace", reason: "broken trace" }]);
    expect(report.findings[0].savingsMs).toBe(7);
  });
});

describe("Budgets and Config", () => {
  it("merges overrides and rejects unknown or bad values", () => {
    expect(Budgets.fromJson('{"maxCls":0.25}').values.maxCls).toBe(0.25);
    expect(() => Budgets.fromJson('{"nope":1}')).toThrow(UsageError);
    expect(() => Budgets.fromJson('{"maxCls":-1}')).toThrow(UsageError);
    expect(() => Budgets.fromJson("[]")).toThrow(UsageError);
  });

  it("fails at startup on a bad log level", () => {
    expect(() => Config.fromEnv({ PERF_TRIAGE_LOG_LEVEL: "loud" })).toThrow(UsageError);
    expect(Config.fromEnv({}).logLevel).toBe("info");
  });
});

describe("JsonLogger", () => {
  it("writes JSON lines with the run id and honours the level", () => {
    const lines: string[] = [];
    const logger = new JsonLogger("info", "run1", (line) => lines.push(line));
    logger.debug("hidden");
    logger.info("shown", { source: "har" });
    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0])).toEqual({ level: "info", runId: "run1", message: "shown", source: "har" });
  });
});
