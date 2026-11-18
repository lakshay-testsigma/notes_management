import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { RunReport } from "./application/runReport.ts";
import { ConfigError } from "./domain/errors.ts";
import { CachingCheck } from "./domain/checks/cachingCheck.ts";
import { CompressionCheck } from "./domain/checks/compressionCheck.ts";
import { CookieCheck } from "./domain/checks/cookieCheck.ts";
import { DnsCheck } from "./domain/checks/dnsCheck.ts";
import { HttpVersionCheck } from "./domain/checks/httpVersionCheck.ts";
import { TlsHstsCheck } from "./domain/checks/tlsHstsCheck.ts";
import { loadConfig } from "./infrastructure/config.ts";
import { FixedClock, SystemClock } from "./infrastructure/clocks.ts";
import { FileSiteDataSource } from "./infrastructure/fileSiteDataSource.ts";
import { HarReader } from "./infrastructure/harReader.ts";
import { JsonLogger } from "./infrastructure/jsonLogger.ts";
import { JsonPolicyRepository } from "./infrastructure/jsonPolicyRepository.ts";
import { Cli, EXIT_BAD_INPUT } from "./interface/cli.ts";
import { JsonRenderer, TextRenderer } from "./interface/renderers.ts";

// Composition root: the only place that creates objects and wires them together.
function main(argv: string[], env: Record<string, string | undefined>): number {
  const dir = argv[0];
  if (!dir) {
    process.stderr.write("Usage: node src/main.ts <folder with dns.json, tls.json, site.har, policy.json>\n");
    return EXIT_BAD_INPUT;
  }
  let config;
  try {
    config = loadConfig(env);
  } catch (error) {
    process.stderr.write(`${error instanceof ConfigError ? "ConfigError" : "Error"}: ${(error as Error).message}\n`);
    return EXIT_BAD_INPUT;
  }
  const logger = new JsonLogger(randomUUID().slice(0, 8), config.logLevel);
  const useCase = new RunReport(
    new FileSiteDataSource(dir, new HarReader()),
    new JsonPolicyRepository(config.policyFile ?? join(dir, "policy.json")),
    [new DnsCheck(), new TlsHstsCheck(), new HttpVersionCheck(), new CachingCheck(), new CompressionCheck(), new CookieCheck()],
    config.now ? new FixedClock(config.now) : new SystemClock(),
    logger,
  );
  const renderer = config.format === "json" ? new JsonRenderer() : new TextRenderer();
  const output = { out: (t: string) => process.stdout.write(t + "\n"), err: (t: string) => process.stderr.write(t + "\n") };
  return new Cli(useCase, renderer, config.failOn, logger, output).run();
}

process.exitCode = main(process.argv.slice(2), process.env);
