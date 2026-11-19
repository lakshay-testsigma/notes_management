// Builds one record per request id from raw Network events and computes timing phases.
// Rules: events can arrive late or never; a value of -1 means "did not happen".

const round = (n) => (n === null ? null : Math.round(n * 10) / 10);

// Chrome reports -1 for phases that did not occur (for example DNS on a reused socket).
function span(start, end) {
  if (start === undefined || end === undefined || start < 0 || end < 0 || end < start) return null;
  return end - start;
}

export class RequestTimingAnalyzer {
  analyze(events) {
    const table = new Map();
    for (const { method, params } of events) {
      if (!method?.startsWith("Network.") || !params?.requestId) continue;
      const record = this.#recordFor(table, params.requestId);
      this.#apply(record, method, params);
    }
    const requests = [...table.values()].map((r) => this.#finish(r));
    return {
      requests,
      totals: {
        count: requests.length,
        failed: requests.filter((r) => r.state === "failed").length,
        incomplete: requests.filter((r) => r.state === "incomplete").length,
        redirects: requests.reduce((sum, r) => sum + r.redirects, 0),
        bytes: requests.reduce((sum, r) => sum + (r.bytes ?? 0), 0),
      },
    };
  }

  #recordFor(table, id) {
    if (!table.has(id)) {
      table.set(id, { id, url: null, status: null, redirects: 0, timing: null, mimeType: null,
        finishedAt: null, bytes: null, errorText: null, sawRequest: false, sawResponse: false });
    }
    return table.get(id);
  }

  #apply(record, method, p) {
    if (method === "Network.requestWillBeSent") {
      // A repeated id with redirectResponse is the next hop of a redirect chain.
      if (record.sawRequest && p.redirectResponse) {
        record.redirects += 1;
        record.timing = null;
        record.sawResponse = false;
      }
      record.sawRequest = true;
      record.url = p.request?.url ?? record.url;
    } else if (method === "Network.responseReceived") {
      record.sawResponse = true;
      record.url = record.url ?? p.response?.url ?? null;
      record.status = p.response?.status ?? null;
      record.mimeType = p.response?.mimeType ?? null;
      record.timing = p.response?.timing ?? null;
    } else if (method === "Network.loadingFinished") {
      record.finishedAt = p.timestamp ?? null;
      record.bytes = p.encodedDataLength ?? null;
    } else if (method === "Network.loadingFailed") {
      record.errorText = p.errorText ?? "failed";
      record.canceled = Boolean(p.canceled);
    }
  }

  #finish(r) {
    let state = "complete";
    if (r.errorText) state = "failed";
    else if (!r.sawRequest || !r.sawResponse || r.finishedAt === null) state = "incomplete";
    return {
      id: r.id, url: r.url, status: r.status, mimeType: r.mimeType, redirects: r.redirects,
      bytes: r.bytes, state, errorText: r.errorText,
      missing: [!r.sawRequest && "request", !r.sawResponse && "response"].filter(Boolean),
      phases: this.#phases(r),
    };
  }

  // Phases in milliseconds, or null when the data is missing. Never a negative number.
  #phases(r) {
    const t = r.timing;
    if (!t) return { dns: null, connect: null, tls: null, wait: null, download: null };
    const connectTotal = span(t.connectStart, t.connectEnd);
    const tls = span(t.sslStart, t.sslEnd);
    const download = r.finishedAt !== null && t.requestTime !== undefined && t.receiveHeadersEnd >= 0
      ? (r.finishedAt - t.requestTime) * 1000 - t.receiveHeadersEnd : null;
    return {
      dns: round(span(t.dnsStart, t.dnsEnd)),
      // The connect span includes TLS, so subtract it to show the two phases apart.
      connect: round(connectTotal !== null && tls !== null ? connectTotal - tls : connectTotal),
      tls: round(tls),
      wait: round(span(t.sendEnd, t.receiveHeadersEnd)),
      download: round(download !== null && download >= 0 ? download : null),
    };
  }
}
