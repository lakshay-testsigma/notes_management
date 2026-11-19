import { CdpCommandError, CdpTimeoutError, TargetCrashedError } from "../domain/errors.js";

// One WebSocket to Chrome. It numbers commands, keeps one pending promise per id,
// hands events to listeners, and never rejects: send() resolves to { result } or { error }.
export class CdpConnection {
  #socket;
  #nextId = 1;
  #pending = new Map();
  #listeners = [];
  #closed = false;

  constructor(socket, { commandTimeoutMs = 15000 } = {}) {
    this.#socket = socket;
    this.commandTimeoutMs = commandTimeoutMs;
    socket.addEventListener("message", (event) => this.#onMessage(event.data));
    socket.addEventListener("close", () => this.#failAll());
    socket.addEventListener("error", () => this.#failAll());
  }

  static open(url, { WebSocketImpl = globalThis.WebSocket, ...options } = {}) {
    return new Promise((resolve, reject) => {
      const socket = new WebSocketImpl(url);
      socket.addEventListener("open", () => resolve(new CdpConnection(socket, options)), { once: true });
      socket.addEventListener("error", () => reject(new CdpCommandError(`Cannot connect to ${url}`)), { once: true });
    });
  }

  onEvent(listener) {
    this.#listeners.push(listener);
  }

  send(method, params = {}, sessionId, timeoutMs = this.commandTimeoutMs) {
    if (this.#closed) return Promise.resolve({ error: new TargetCrashedError() });
    const id = this.#nextId++;
    return new Promise((resolve) => {
      // Race the reply against a timer so a lost reply cannot hang the run.
      const timer = setTimeout(() => {
        this.#pending.delete(id);
        resolve({ error: new CdpTimeoutError(method, timeoutMs) });
      }, timeoutMs);
      this.#pending.set(id, { resolve, timer });
      this.#socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  }

  close() {
    this.#failAll();
    try {
      this.#socket.close();
    } catch {
      // already closed
    }
  }

  #onMessage(data) {
    let message;
    try {
      message = JSON.parse(typeof data === "string" ? data : String(data));
    } catch {
      return; // ignore a message that is not JSON
    }
    if (message.id !== undefined) {
      const entry = this.#pending.get(message.id);
      if (!entry) return;
      clearTimeout(entry.timer);
      this.#pending.delete(message.id);
      entry.resolve(message.error ? { error: new CdpCommandError(message.error.message ?? "CDP error") } : { result: message.result ?? {} });
      return;
    }
    if (message.method === "Inspector.targetCrashed") this.#failAll(false);
    for (const listener of this.#listeners) listener(message);
  }

  // Fail every waiting command, so no await waits for a reply that will never come.
  #failAll(markClosed = true) {
    if (markClosed) this.#closed = true;
    for (const { resolve, timer } of this.#pending.values()) {
      clearTimeout(timer);
      resolve({ error: new TargetCrashedError() });
    }
    this.#pending.clear();
  }
}
