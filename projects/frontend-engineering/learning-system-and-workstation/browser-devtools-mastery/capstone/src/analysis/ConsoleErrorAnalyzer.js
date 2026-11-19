// Collects console errors, uncaught exceptions and browser log errors, grouped by message.
const MAX_MESSAGE = 300;

export class ConsoleErrorAnalyzer {
  analyze(events) {
    const groups = new Map();
    for (const { method, params } of events) {
      const found = this.#extract(method, params);
      if (!found) continue;
      const message = found.message.slice(0, MAX_MESSAGE);
      const key = `${found.kind}:${message}`;
      const group = groups.get(key) ?? { kind: found.kind, message, source: found.source, count: 0 };
      group.count += 1;
      groups.set(key, group);
    }
    const errors = [...groups.values()].sort((a, b) => b.count - a.count);
    return { total: errors.reduce((n, e) => n + e.count, 0), errors };
  }

  #extract(method, p) {
    if (method === "Runtime.exceptionThrown") {
      const d = p?.exceptionDetails ?? {};
      return { kind: "exception", message: d.exception?.description ?? d.text ?? "Unknown exception", source: d.url ?? null };
    }
    if (method === "Runtime.consoleAPICalled" && p?.type === "error") {
      const text = (p.args ?? []).map((a) => a.value ?? a.description ?? "").join(" ").trim();
      return { kind: "console.error", message: text || "(empty console.error)", source: null };
    }
    if (method === "Log.entryAdded" && p?.entry?.level === "error") {
      return { kind: "browser-log", message: p.entry.text ?? "Unknown log error", source: p.entry.url ?? null };
    }
    return null;
  }
}
