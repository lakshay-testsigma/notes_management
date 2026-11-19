// Defines "loaded" on purpose: the load event fired, and at most `maxInflight` requests
// stayed open for `quietMs`. The clock is passed in, so tests need no waiting.
export class LoadSettler {
  #loadFired = false;
  #inflight = new Set();
  #quietSince = null;

  constructor({ quietMs = 500, maxInflight = 2 } = {}) {
    this.quietMs = quietMs;
    this.maxInflight = maxInflight;
  }

  observe({ method, params }) {
    if (method === "Page.loadEventFired") this.#loadFired = true;
    else if (method === "Network.requestWillBeSent") this.#inflight.add(params.requestId);
    else if (method === "Network.loadingFinished" || method === "Network.loadingFailed") this.#inflight.delete(params.requestId);
  }

  isSettled(nowMs) {
    if (!this.#loadFired || this.#inflight.size > this.maxInflight) {
      this.#quietSince = null;
      return false;
    }
    if (this.#quietSince === null) this.#quietSince = nowMs;
    return nowMs - this.#quietSince >= this.quietMs;
  }
}
