import type { Logger } from "../domain/ports.ts";

export type Level = "debug" | "info" | "warn" | "error";
const ORDER: Level[] = ["debug", "info", "warn", "error"];

// One JSON line per event, each with the run id, so one run can be followed in logs.
export class JsonLogger implements Logger {
  private readonly level: Level;
  private readonly runId: string;
  private readonly write: (line: string) => void;

  constructor(level: Level, runId: string, write: (line: string) => void) {
    this.level = level;
    this.runId = runId;
    this.write = write;
  }

  debug(event: string, fields: Record<string, unknown> = {}): void {
    this.log("debug", event, fields);
  }
  info(event: string, fields: Record<string, unknown> = {}): void {
    this.log("info", event, fields);
  }
  warn(event: string, fields: Record<string, unknown> = {}): void {
    this.log("warn", event, fields);
  }
  error(event: string, fields: Record<string, unknown> = {}): void {
    this.log("error", event, fields);
  }

  private log(level: Level, event: string, fields: Record<string, unknown>): void {
    if (ORDER.indexOf(level) < ORDER.indexOf(this.level)) return;
    this.write(JSON.stringify({ level, event, runId: this.runId, ...fields }));
  }
}
