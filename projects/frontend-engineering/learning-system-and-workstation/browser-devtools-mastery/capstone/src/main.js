import { pathToFileURL } from "node:url";
import { AnalyzeSavedCaptureUseCase } from "./application/AnalyzeSavedCaptureUseCase.js";
import { InspectPageUseCase } from "./application/InspectPageUseCase.js";
import { ReportBuilder } from "./application/ReportBuilder.js";
import { ConsoleErrorAnalyzer } from "./analysis/ConsoleErrorAnalyzer.js";
import { HeapAnalyzer } from "./analysis/HeapAnalyzer.js";
import { RequestTimingAnalyzer } from "./analysis/RequestTimingAnalyzer.js";
import { WebVitalsAnalyzer } from "./analysis/WebVitalsAnalyzer.js";
import { UrlPolicy } from "./domain/UrlPolicy.js";
import { CaptureStore } from "./infrastructure/CaptureStore.js";
import { CdpConnection } from "./infrastructure/CdpConnection.js";
import { ChromeCdpDriver } from "./infrastructure/ChromeCdpDriver.js";
import { ChromeLauncher } from "./infrastructure/ChromeLauncher.js";
import { Config } from "./infrastructure/Config.js";
import { Logger } from "./infrastructure/Logger.js";
import { DashboardServer } from "./interface/DashboardServer.js";

// Composition root: the one place where objects are created and wired together.
export function buildApp(config, { driver } = {}) {
  const logger = new Logger();
  const store = new CaptureStore(config.captureDir);
  const reportBuilder = new ReportBuilder({
    timing: new RequestTimingAnalyzer(),
    vitals: new WebVitalsAnalyzer(),
    consoleErrors: new ConsoleErrorAnalyzer(),
    heap: new HeapAnalyzer(),
  });
  const realDriver = driver ?? new ChromeCdpDriver({
    launcher: new ChromeLauncher({ chromePath: config.chromePath }),
    connect: (endpoint) => CdpConnection.open(endpoint),
    config,
  });
  const inspectPage = new InspectPageUseCase({
    urlPolicy: new UrlPolicy({ allowPrivateHosts: config.allowPrivateHosts }),
    driver: realDriver, store, reportBuilder, logger,
  });
  const analyzeSavedCapture = new AnalyzeSavedCaptureUseCase({ store, reportBuilder });
  return { logger, server: new DashboardServer({ inspectPage, analyzeSavedCapture, logger }), analyzeSavedCapture };
}

async function run() {
  const config = Config.fromEnv();
  const app = buildApp(config);
  const fileFlag = process.argv.indexOf("--file");
  if (fileFlag !== -1) {
    // Offline mode: rebuild a report from a saved capture, no Chrome needed.
    const result = await app.analyzeSavedCapture.execute(process.argv[fileFlag + 1] ?? "");
    process.stdout.write(JSON.stringify(result.ok ? result.value : { error: result.error.message }, null, 2) + "\n");
    process.exitCode = result.ok ? 0 : 1;
    return;
  }
  const port = await app.server.listen(config.port);
  app.logger.info("server.listening", { port });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  run().catch((error) => {
    process.stderr.write(`Startup failed: ${error.message}\n`);
    process.exitCode = 1;
  });
}
