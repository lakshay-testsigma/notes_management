import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PUBLIC_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "public");
const STATIC = { "/": ["index.html", "text/html; charset=utf-8"], "/app.js": ["app.js", "text/javascript; charset=utf-8"], "/style.css": ["style.css", "text/css; charset=utf-8"] };
const STATUS_BY_CODE = { invalid_url: 400, bad_capture: 404 };
const MAX_BODY = 10_000;

// HTTP interface: serves the dashboard page and two JSON routes. It parses input, calls
// one use case, and turns a failed Result into a status code. It holds no analysis logic.
export class DashboardServer {
  #busy = false;

  constructor({ inspectPage, analyzeSavedCapture, logger }) {
    this.inspectPage = inspectPage;
    this.analyzeSavedCapture = analyzeSavedCapture;
    this.logger = logger;
    this.server = createServer((req, res) => this.#handle(req, res).catch((e) => this.#crash(res, e)));
  }

  listen(port) {
    return new Promise((resolve) => this.server.listen(port, () => resolve(this.server.address().port)));
  }

  close() {
    return new Promise((resolve) => this.server.close(resolve));
  }

  async #handle(req, res) {
    const url = new URL(req.url, "http://localhost");
    const requestId = randomUUID();
    if (req.method === "GET" && STATIC[url.pathname]) return this.#sendStatic(res, STATIC[url.pathname]);
    if (req.method === "GET" && url.pathname === "/health") return this.#json(res, 200, { ok: true });
    if (req.method === "POST" && url.pathname === "/api/inspect") return this.#inspect(req, res, requestId);
    const saved = url.pathname.match(/^\/api\/captures\/([^/]+)\/report$/);
    if (req.method === "GET" && saved) return this.#sendResult(res, await this.analyzeSavedCapture.execute(decodeURIComponent(saved[1])));
    return this.#json(res, 404, { error: { code: "not_found", message: "No such route" } });
  }

  async #inspect(req, res, requestId) {
    if (this.#busy) return this.#json(res, 429, { error: { code: "busy", message: "Another inspection is running. Try again soon." } });
    let body;
    try {
      body = JSON.parse(await this.#readBody(req));
    } catch {
      return this.#json(res, 400, { error: { code: "bad_request", message: "Send JSON like {\"url\":\"https://example.com\"}" } });
    }
    this.#busy = true; // one Chrome at a time keeps memory use predictable
    try {
      this.#sendResult(res, await this.inspectPage.execute(body?.url, requestId));
    } finally {
      this.#busy = false;
    }
  }

  #sendResult(res, result) {
    if (result.ok) return this.#json(res, 200, result.value);
    const status = STATUS_BY_CODE[result.error.code] ?? 502;
    return this.#json(res, status, { error: { code: result.error.code, message: result.error.message } });
  }

  async #sendStatic(res, [file, type]) {
    res.writeHead(200, { "content-type": type });
    res.end(await readFile(path.join(PUBLIC_DIR, file)));
  }

  async #readBody(req) {
    let size = 0;
    const chunks = [];
    for await (const chunk of req) {
      size += chunk.length;
      if (size > MAX_BODY) throw new Error("body too large");
      chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString("utf8");
  }

  #json(res, status, payload) {
    res.writeHead(status, { "content-type": "application/json" });
    res.end(JSON.stringify(payload));
  }

  // Unexpected errors are logged with context and answered with a generic message.
  #crash(res, error) {
    this.logger.error("server.unexpected", { message: error.message, stack: error.stack });
    if (!res.headersSent) this.#json(res, 500, { error: { code: "internal", message: "Unexpected error" } });
  }
}
