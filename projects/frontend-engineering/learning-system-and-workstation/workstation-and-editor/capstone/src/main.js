#!/usr/bin/env node
// Composition root: the only place where real objects are created and wired together.
import { pathToFileURL } from 'node:url';
import { Config } from './infrastructure/Config.js';
import { JsonLogger } from './infrastructure/JsonLogger.js';
import { SystemEnvironment } from './infrastructure/SystemEnvironment.js';
import { GitCommitSource } from './infrastructure/GitCommitSource.js';
import { CommitParser } from './domain/CommitParser.js';
import { CommitRules } from './domain/CommitRules.js';
import { ConfigError } from './domain/errors.js';
import { ExitCode } from './domain/ExitCode.js';
import { CheckWorkstationUseCase } from './application/CheckWorkstationUseCase.js';
import { LintCommitsUseCase } from './application/LintCommitsUseCase.js';
import { WriteReleaseNotesUseCase } from './application/WriteReleaseNotesUseCase.js';
import { Cli } from './interface/Cli.js';
import { TextReporter } from './interface/TextReporter.js';

export function main(argv, env = process.env) {
  const out = (text) => process.stdout.write(`${text}\n`);
  const err = (text) => process.stderr.write(`${text}\n`);
  try {
    const config = new Config(env);
    const logger = new JsonLogger({ level: config.logLevel });
    const parser = new CommitParser();
    const cli = new Cli({
      doctorFor: (projectDir) => new CheckWorkstationUseCase({
        environment: new SystemEnvironment({ projectDir, env }), tools: config.tools, logger,
      }),
      lint: new LintCommitsUseCase({ parser, rules: new CommitRules(config.rulePreset), logger }),
      notes: new WriteReleaseNotesUseCase({ parser, logger }),
      commitSource: new GitCommitSource({ env }),
      reporter: new TextReporter(),
      stdout: out,
      stderr: err,
      logger,
    });
    return cli.run(argv);
  } catch (error) {
    if (!(error instanceof ConfigError)) throw error;
    err(`Configuration problem: ${error.message}`);
    return ExitCode.USAGE;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2));
}
