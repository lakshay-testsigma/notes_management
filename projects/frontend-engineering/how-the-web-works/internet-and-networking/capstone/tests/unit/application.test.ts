import { describe, expect, it } from "vitest";
import { RunReport } from "../../src/application/runReport.ts";
import { Report } from "../../src/domain/report.ts";
import type { Check, Logger, PolicyRepository, SiteDataSource } from "../../src/domain/ports.ts";
import { problem } from "../../src/domain/finding.ts";
import { loadConfig } from "../../src/infrastructure/config.ts";
import { JsonLogger } from "../../src/infrastructure/jsonLogger.ts";
import { FixedClock } from "../../src/infrastructure/clocks.ts";
import { Cli } from "../../src/interface/cli.ts";
import { JsonRenderer, TextRenderer } from "../../src/interface/renderers.ts";
import { InputError } from "../../src/domain/errors.ts";
import { POLICY, NOW, context } from "../helpers.ts";

// In-memory fakes for the ports.
const source: SiteDataSource = { load: () => context().site };
const policies: PolicyRepository = { load: () => POLICY };
const logged: string[] = [];
const logger: Logger = { info: () => {}, warn: () => {}, error: (m) => void logged.push(m) };
const failing: Check = { name: "failing", run: () => [problem("failing", "x.rule", "error", "s", "bad")] };
const crashing: Check = { name: "crashing", run: () => { throw new Error("boom"); } };
const output = () => {
  const lines: string[] = [];
  return { lines, io: { out: (t: string) => void lines.push(t), err: (t: string) => void lines.push(t) } };
};

describe("RunReport", () => {
  it("collects findings from every check", () => {
    const report = new RunReport(source, policies, [failing], new FixedClock(NOW.toISOString()), logger).execute();
    expect(report.count("error")).toBe(1);
  });
  it("turns a crashing check into an unknown finding and keeps going", () => {
    const report = new RunReport(source, policies, [crashing, failing], new FixedClock(NOW.toISOString()), logger).execute();
    expect(report.findings.map((f) => f.rule)).toEqual(["x.rule", "crashing.crashed"]);
    expect(report.countUnknown()).toBe(1);
    expect(logged).toContain("check crashed");
  });
});

describe("Report", () => {
  it("fails by FAIL_ON level", () => {
    const warn = new Report("h", "c", [], 0, [problem("c", "r", "warning", "s", "m")]);
    expect(warn.shouldFail("error")).toBe(false);
    expect(warn.shouldFail("warning")).toBe(true);
    expect(warn.shouldFail("never")).toBe(false);
  });
});

describe("loadConfig", () => {
  it("uses defaults", () => {
    expect(loadConfig({})).toEqual({ format: "text", failOn: "error", logLevel: "warn", now: null, policyFile: null });
  });
  it("rejects a bad value at startup", () => {
    expect(() => loadConfig({ FAIL_ON: "sometimes" })).toThrow("FAIL_ON");
    expect(() => loadConfig({ REPORT_NOW: "yesterday" })).toThrow("REPORT_NOW");
  });
});

describe("JsonLogger", () => {
  it("writes one JSON line with the run id and honours the level", () => {
    const lines: string[] = [];
    const log = new JsonLogger("run1", "warn", (l) => lines.push(l));
    log.info("hidden");
    log.error("shown", { check: "dns" });
    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0] ?? "")).toMatchObject({ level: "error", runId: "run1", check: "dns" });
  });
});

describe("Cli", () => {
  it("prints the report and returns 1 when findings fail the run", () => {
    const { lines, io } = output();
    const code = new Cli(new RunReport(source, policies, [failing], new FixedClock(NOW.toISOString()), logger), new TextRenderer(), "error", logger, io).run();
    expect(code).toBe(1);
    expect(lines[0]).toContain("x.rule");
  });
  it("returns 0 for a clean report and renders JSON", () => {
    const { lines, io } = output();
    const code = new Cli(new RunReport(source, policies, [], new FixedClock(NOW.toISOString()), logger), new JsonRenderer(), "error", logger, io).run();
    expect(code).toBe(0);
    expect(JSON.parse(lines[0] ?? "").errors).toBe(0);
  });
  it("maps an input error to exit code 2", () => {
    const { lines, io } = output();
    const broken: SiteDataSource = { load: () => { throw new InputError("cannot read file"); } };
    const code = new Cli(new RunReport(broken, policies, [], new FixedClock(NOW.toISOString()), logger), new TextRenderer(), "error", logger, io).run();
    expect(code).toBe(2);
    expect(lines[0]).toContain("InputError");
  });
});
