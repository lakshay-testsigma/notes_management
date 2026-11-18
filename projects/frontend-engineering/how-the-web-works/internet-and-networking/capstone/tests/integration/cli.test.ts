import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { FileSiteDataSource } from "../../src/infrastructure/fileSiteDataSource.ts";
import { HarReader } from "../../src/infrastructure/harReader.ts";
import { JsonPolicyRepository } from "../../src/infrastructure/jsonPolicyRepository.ts";

const ENV = { ...process.env, REPORT_NOW: "2026-11-18T00:00:00Z", REPORT_FORMAT: "json", LOG_LEVEL: "silent" };

function runCli(args: string[], env: Record<string, string | undefined> = ENV) {
  return spawnSync("node", ["src/main.ts", ...args], { env, encoding: "utf8" });
}

describe("real adapters, real files", () => {
  it("reads the good fixtures into typed data", () => {
    const site = new FileSiteDataSource("fixtures/good", new HarReader()).load();
    expect(site.entries).toHaveLength(3);
    expect(site.client).toBe("Chrome DevTools 130");
    expect(new JsonPolicyRepository("fixtures/good/policy.json").load().host).toBe("www.example.com");
  });
});

describe("the CLI process", () => {
  it("exits 0 with no findings on the good fixtures", () => {
    const run = runCli(["fixtures/good"]);
    expect(run.status).toBe(0);
    expect(JSON.parse(run.stdout)).toMatchObject({ errors: 0, warnings: 0, unknown: 0 });
  });
  it("exits 1 and lists problems from every area on the bad fixtures", () => {
    const run = runCli(["fixtures/bad"]);
    expect(run.status).toBe(1);
    const report = JSON.parse(run.stdout);
    const checks = new Set(report.findings.map((f: { check: string }) => f.check));
    expect([...checks].sort()).toEqual(["caching", "compression", "cookies", "dns", "http-version", "https"]);
    expect(report.unknown).toBe(2);
  });
  it("exits 0 on the bad fixtures when FAIL_ON=never", () => {
    expect(runCli(["fixtures/bad"], { ...ENV, FAIL_ON: "never" }).status).toBe(0);
  });
  it("exits 2 for a missing folder, a bad setting and no argument", () => {
    const missing = runCli(["fixtures/nope"]);
    expect(missing.status).toBe(2);
    expect(missing.stderr).toContain("InputError");
    expect(runCli(["fixtures/good"], { ...ENV, FAIL_ON: "x" }).status).toBe(2);
    expect(runCli([]).status).toBe(2);
  });
});
