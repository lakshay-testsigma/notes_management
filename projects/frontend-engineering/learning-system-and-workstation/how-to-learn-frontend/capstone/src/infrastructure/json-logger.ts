import type { Logger } from "../domain/ports.js";
import type { LogLevel } from "./config.js";

// One JSON line per event. `sessionId` ties every line of one page load together.
export class JsonLogger implements Logger {
  constructor(
    private readonly level: LogLevel,
    private readonly sessionId: string,
    private readonly write: (line: string) => void = (line) => console.log(line),
  ) {}

  info(event: string, fields: Record<string, unknown> = {}): void {
    if (this.level === "info") this.emit("info", event, fields);
  }

  error(event: string, fields: Record<string, unknown> = {}): void {
    this.emit("error", event, fields);
  }

  private emit(level: string, event: string, fields: Record<string, unknown>): void {
    this.write(JSON.stringify({ time: new Date().toISOString(), level, event, sessionId: this.sessionId, ...fields }));
  }
}
