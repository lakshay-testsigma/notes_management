import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { Artifacts } from "../../src/application/Artifacts.ts";
import { HarAudit } from "../../src/application/HarAudit.ts";
import { HarGatherer } from "../../src/application/HarGatherer.ts";
import { LighthouseAudit } from "../../src/application/LighthouseAudit.ts";
import { LighthouseGatherer } from "../../src/application/LighthouseGatherer.ts";
import { Ranker } from "../../src/application/Ranker.ts";
import { TraceAudit } from "../../src/application/TraceAudit.ts";
import { TraceGatherer } from "../../src/application/TraceGatherer.ts";
import { TriageUseCase } from "../../src/application/TriageUseCase.ts";
import { Budgets } from "../../src/domain/Budgets.ts";
import { JsonLogger } from "../../src/infrastructure/JsonLogger.ts";
import { NodeFileSource } from "../../src/infrastructure/NodeFileSource.ts";
import { Cli } from "../../src/interface/Cli.ts";
import { MarkdownRenderer } from "../../src/interface/MarkdownRenderer.ts";

// Real file adapter, real gatherers and audits: only the logger is silenced.
function buildCli(): Cli {
  const logger = new JsonLogger("silent", "test");
  const useCase = new TriageUseCase(
    [
      { gatherer: new HarGatherer(), audit: new HarAudit() },
      { gatherer: new TraceGatherer(), audit: new TraceAudit() },
      { gatherer: new LighthouseGatherer(), audit: new LighthouseAudit() },
    ],
    new Artifacts(new NodeFileSource(), logger),
    new Ranker(),
    logger,
  );
  return new Cli(useCase, new MarkdownRenderer(), Budgets.defaults());
}

const sample = (name: string) => `samples/${name}`;
const allSamples = ["--har", sample("checkout.har"), "--trace", sample("checkout-trace.json"), "--lighthouse", sample("lighthouse.json")];

describe("perf-triage end to end", () => {
  it("matches the golden report", async () => {
    const result = await buildCli().run(allSamples);
    const expected = readFileSync("tests/fixtures/expected-report.md", "utf8");
    expect(result.stdout).toBe(expected);
    expect(result.exitCode).toBe(1);
  });

  it("still triages the HAR when the trace is broken, and says so", async () => {
    const result = await buildCli().run(["--har", sample("checkout.har"), "--trace", "tests/fixtures/broken-trace.json"]);
    expect(result.stdout).toContain("## Skipped inputs");
    expect(result.stdout).toContain("trace: Trace file has no traceEvents array.");
    expect(result.stdout).toContain("Slow server response");
  });

  it("exits 2 when no input can be read, and 2 on bad flags", async () => {
    expect((await buildCli().run(["--har", "tests/fixtures/missing.har"])).exitCode).toBe(2);
    expect((await buildCli().run(["--bogus"])).exitCode).toBe(2);
  });

  it("never prints the token from a request URL", async () => {
    const result = await buildCli().run(allSamples);
    expect(result.stdout).not.toContain("abc123");
  });

  it("runs as a real process and sets the exit code", () => {
    const run = (extra: string[]) =>
      spawnSync(process.execPath, ["src/main.ts", ...allSamples, ...extra], { encoding: "utf8", env: { ...process.env, PERF_TRIAGE_LOG_LEVEL: "silent" } });
    expect(run([]).status).toBe(1);
    const relaxed = run(["--exit-zero"]);
    expect(relaxed.status).toBe(0);
    expect(relaxed.stdout).toContain("Ranked findings");
  });
});
