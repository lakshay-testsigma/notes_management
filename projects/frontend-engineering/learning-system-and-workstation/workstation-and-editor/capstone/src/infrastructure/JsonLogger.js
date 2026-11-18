import { randomUUID } from 'node:crypto';

export const LEVELS = Object.freeze({ debug: 10, info: 20, warn: 30, error: 40 });

/** Writes one JSON object per line. Every line carries the run id of this CLI call. */
export class JsonLogger {
  constructor({ level = 'warn', sink = (line) => process.stderr.write(`${line}\n`), runId = randomUUID() } = {}) {
    this.threshold = LEVELS[level];
    this.sink = sink;
    this.runId = runId;
  }

  #write(level, message, fields) {
    if (LEVELS[level] < this.threshold) return;
    this.sink(JSON.stringify({ ...fields, time: new Date().toISOString(), level, runId: this.runId, message }));
  }

  debug(message, fields = {}) { this.#write('debug', message, fields); }
  info(message, fields = {}) { this.#write('info', message, fields); }
  warn(message, fields = {}) { this.#write('warn', message, fields); }
  error(message, fields = {}) { this.#write('error', message, fields); }
}
