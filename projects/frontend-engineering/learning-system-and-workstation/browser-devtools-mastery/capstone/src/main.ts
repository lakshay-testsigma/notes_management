import { randomUUID } from "node:crypto";
import { Artifacts } from "./application/Artifacts.ts";
import { HarAudit } from "./application/HarAudit.ts";
import { HarGatherer } from "./application/HarGatherer.ts";
import { LighthouseAudit } from "./application/LighthouseAudit.ts";
import { LighthouseGatherer } from "./application/LighthouseGatherer.ts";
import { Ranker } from "./application/Ranker.ts";
import { TraceAudit } from "./application/TraceAudit.ts";
import { TraceGatherer } from "./application/TraceGatherer.ts";
import { TriageUseCase } from "./application/TriageUseCase.ts";
import { Budgets } from "./domain/Budgets.ts";
import { UsageError } from "./domain/errors.ts";
import { Config } from "./infrastructure/Config.ts";
import { JsonLogger } from "./infrastructure/JsonLogger.ts";
import { NodeFileSource } from "./infrastructure/NodeFileSource.ts";
import { Cli, USAGE } from "./interface/Cli.ts";
import { MarkdownRenderer } from "./interface/MarkdownRenderer.ts";

// Composition root: the only place where objects are created and wired.
async function main(): Promise<number> {
  const config = Config.fromEnv(process.env);
  const logger = new JsonLogger(config.logLevel, randomUUID().slice(0, 8));
  const files = new NodeFileSource();
  const budgets = config.budgetsPath === undefined ? Budgets.defaults() : Budgets.fromJson(await files.readText(config.budgetsPath));

  const useCase = new TriageUseCase(
    [
      { gatherer: new HarGatherer(), audit: new HarAudit() },
      { gatherer: new TraceGatherer(), audit: new TraceAudit() },
      { gatherer: new LighthouseGatherer(), audit: new LighthouseAudit() },
    ],
    new Artifacts(files, logger),
    new Ranker(),
    logger,
  );
  const result = await new Cli(useCase, new MarkdownRenderer(), budgets).run(process.argv.slice(2));
  process.stdout.write(result.stdout);
  return result.exitCode;
}

main().then(
  (code) => {
    process.exitCode = code;
  },
  (error: unknown) => {
    if (error instanceof UsageError) process.stderr.write(`${error.message}\n${USAGE}\n`);
    else process.stderr.write(`Unexpected error: ${String(error)}\n`);
    process.exitCode = 2;
  },
);
