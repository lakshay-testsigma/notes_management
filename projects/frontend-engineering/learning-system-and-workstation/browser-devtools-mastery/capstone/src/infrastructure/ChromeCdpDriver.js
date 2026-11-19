import { CdpCommandError, InspectorError } from "../domain/errors.js";
import { CAPTURE_SCHEMA } from "../domain/ports.js";
import { Result } from "../domain/Result.js";
import { LoadSettler } from "./LoadSettler.js";

const KEEP_PREFIXES = ["Network.", "Page.", "Runtime.", "Log.", "Target."];
const TRACE_CATEGORIES = "-*,devtools.timeline,loading,rail,blink.user_timing,disabled-by-default-devtools.timeline";
const VIEWPORT = { width: 1350, height: 940, deviceScaleFactor: 1, mobile: false };

// The only class that drives Chrome. It starts a fresh browser, runs one navigation,
// and returns the raw events as a RawCapture. It implements the PageDriver port.
export class ChromeCdpDriver {
  constructor({ launcher, connect, config, quietMs = 500, pollMs = 100, clock = () => Date.now() }) {
    this.launcher = launcher;
    this.connect = connect; // (endpoint) => Promise<CdpConnection>
    this.config = config;
    this.quietMs = quietMs;
    this.pollMs = pollMs;
    this.clock = clock;
  }

  async capture(url) {
    let chrome = null;
    let connection = null;
    try {
      chrome = await this.launcher.launch();
      connection = await this.connect(chrome.endpoint);
      return Result.ok(await this.#run(connection, url));
    } catch (error) {
      return Result.err(error instanceof InspectorError ? error : new InspectorError(error.message, "capture_failed"));
    } finally {
      connection?.close();
      await chrome?.close();
    }
  }

  async #run(conn, url) {
    const events = [];
    const trace = [];
    const settler = new LoadSettler({ quietMs: this.quietMs });
    const collectionErrors = {};
    let traceDone;
    const traceComplete = new Promise((resolve) => (traceDone = resolve));

    const call = async (method, params, sessionId) => {
      const reply = await conn.send(method, params, sessionId);
      if (reply.error) throw reply.error;
      return reply.result;
    };

    // Start from the same state every run: a blank tab, no cache, one fixed viewport.
    const { targetId } = await call("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await call("Target.attachToTarget", { targetId, flatten: true });
    const page = (method, params) => call(method, params, sessionId);

    conn.onEvent((message) => {
      if (message.method === "Tracing.dataCollected") trace.push(...(message.params?.value ?? []));
      else if (message.method === "Tracing.tracingComplete") traceDone();
      else if (message.sessionId === sessionId && KEEP_PREFIXES.some((p) => message.method?.startsWith(p))) {
        const event = { method: message.method, params: message.params };
        events.push(event);
        settler.observe(event);
      }
    });

    for (const domain of ["Network", "Page", "Runtime", "Log", "HeapProfiler"]) await page(`${domain}.enable`);
    await page("Network.setCacheDisabled", { cacheDisabled: true });
    await page("Emulation.setDeviceMetricsOverride", VIEWPORT);
    await call("Tracing.start", { categories: TRACE_CATEGORIES, transferMode: "ReportEvents" });

    const capturedAt = new Date().toISOString();
    const navigation = await page("Page.navigate", { url });
    let loadOutcome = "navigation-failed";
    let navigationError = navigation.errorText ?? null;
    if (!navigationError) {
      loadOutcome = await this.#waitUntilLoaded(settler, page);
    }

    const heapSamples = [];
    try {
      heapSamples.push(await this.#sampleHeap(page, "after-load"));
      await new Promise((r) => setTimeout(r, this.config.heapWaitMs));
      heapSamples.push(await this.#sampleHeap(page, "after-wait"));
    } catch (error) {
      collectionErrors.heap = error.message;
    }

    try {
      await call("Tracing.end");
      await Promise.race([traceComplete, new Promise((_, reject) => setTimeout(() => reject(new CdpCommandError("Tracing.tracingComplete did not arrive")), 10000))]);
    } catch (error) {
      collectionErrors.trace = error.message;
    }

    return {
      schema: CAPTURE_SCHEMA, url, capturedAt, loadOutcome, events, trace, heapSamples, collectionErrors,
      settings: { viewport: VIEWPORT, cacheDisabled: true, throttling: "none", quietMs: this.quietMs, navigationError },
    };
  }

  async #waitUntilLoaded(settler, page) {
    const deadline = this.clock() + this.config.navTimeoutMs;
    while (this.clock() < deadline) {
      if (settler.isSettled(this.clock())) return "loaded";
      await new Promise((r) => setTimeout(r, this.pollMs));
    }
    // A tiny evaluate tells a slow page (still answers) from a hung page (does not).
    try {
      await page("Runtime.evaluate", { expression: "1+1" });
      return "timeout-slow";
    } catch {
      return "timeout-hung";
    }
  }

  async #sampleHeap(page, label) {
    await page("HeapProfiler.collectGarbage"); // compare after garbage collection, not before
    const usage = await page("Runtime.getHeapUsage");
    return { label, usedSize: usage.usedSize, totalSize: usage.totalSize };
  }
}
