import { randomUUID } from "node:crypto";
import { AccessibilityCheck } from "./application/AccessibilityCheck.ts";
import { AuditPageUseCase } from "./application/AuditPageUseCase.ts";
import { ChecklistBuilder } from "./application/ChecklistBuilder.ts";
import { ProfileLoader } from "./application/ProfileLoader.ts";
import { SecurityHeaderCheck } from "./application/SecurityHeaderCheck.ts";
import { SeoCheck } from "./application/SeoCheck.ts";
import { ValidateProfileUseCase } from "./application/ValidateProfileUseCase.ts";
import { UsageError } from "./domain/errors.ts";
import { Config } from "./infrastructure/Config.ts";
import { JsdomAxeRunner } from "./infrastructure/JsdomAxeRunner.ts";
import { JsdomPageParser } from "./infrastructure/JsdomPageParser.ts";
import { JsonLogger } from "./infrastructure/JsonLogger.ts";
import { NodeFileSource } from "./infrastructure/NodeFileSource.ts";
import { Cli } from "./interface/Cli.ts";
import { TextRenderer } from "./interface/TextRenderer.ts";

// Composition root: the only place where objects are created and wired.
async function main(): Promise<number> {
  let config: Config;
  try {
    config = Config.fromEnv(process.env);
  } catch (error) {
    if (!(error instanceof UsageError)) throw error;
    console.error(error.message);
    return 2;
  }
  const logger = new JsonLogger(config.logLevel, randomUUID().slice(0, 8), (line) => process.stderr.write(`${line}\n`));
  const files = new NodeFileSource();
  const checks = [new AccessibilityCheck(new JsdomAxeRunner()), new SeoCheck(), new SecurityHeaderCheck()];

  const cli = new Cli({
    loader: new ProfileLoader(files),
    validate: new ValidateProfileUseCase(files, logger),
    audit: new AuditPageUseCase(files, new JsdomPageParser(), checks, logger),
    checklist: new ChecklistBuilder(),
    renderer: new TextRenderer(),
    logger,
    policyPath: config.policyPath,
    strict: config.strict,
    out: (text) => console.log(text),
  });
  return cli.run(process.argv.slice(2));
}

process.exitCode = await main();
