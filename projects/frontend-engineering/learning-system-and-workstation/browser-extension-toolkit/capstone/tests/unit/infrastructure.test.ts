import { describe, expect, it } from "vitest";
import { UsageError } from "../../src/domain/errors.ts";
import { Config } from "../../src/infrastructure/Config.ts";
import { JsonLogger } from "../../src/infrastructure/JsonLogger.ts";

describe("Config", () => {
  it("defaults are used when no variable is set", () => {
    const c = Config.fromEnv({});
    expect([c.policyPath, c.logLevel, c.strict]).toEqual(["policy/permission-policy.json", "info", false]);
  });
  it("a bad log level stops the program at startup", () => {
    expect(() => Config.fromEnv({ TOOLKIT_LOG_LEVEL: "loud" })).toThrow(UsageError);
  });
  it("TOOLKIT_STRICT accepts only true or false", () => {
    expect(() => Config.fromEnv({ TOOLKIT_STRICT: "yes" })).toThrow(/true or false/);
  });
});

describe("JsonLogger", () => {
  it("each line is JSON and carries the run id", () => {
    const lines: string[] = [];
    new JsonLogger("info", "run1", (l) => lines.push(l)).info("hello", { id: 7 });
    expect(JSON.parse(lines[0]!)).toEqual({ level: "info", event: "hello", runId: "run1", id: 7 });
  });
  it("events below the chosen level are dropped", () => {
    const lines: string[] = [];
    new JsonLogger("warn", "r", (l) => lines.push(l)).info("quiet");
    expect(lines).toEqual([]);
  });
});
