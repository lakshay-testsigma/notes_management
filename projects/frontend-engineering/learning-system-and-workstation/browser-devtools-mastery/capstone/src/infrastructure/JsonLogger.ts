import type { Logger } from "../domain/ports.ts";

export type LogLevel = "debug" | "info" | "error" | "silent";
const ORDER: Record<LogLevel, number> = { debug: 0, info: 1, error: 2, silent: 3 };

// One JSON object per line on stderr, so stdout stays clean for the report.
export class JsonLogger implements Logger {
  private readonly level: LogLevel;
  private readonly runId: string;
  private readonly write: (line: string) => void;

  constructor(level: LogLevel, runId: string, write: (line: string) => void = (line) => process.stderr.write(line + "\n")) {
    this.level = level;
    this.runId = runId;
    this.write = write;
  }

  debug(message: string, fields: Record<string, unknown> = {}): void {
    this.log("debug", message, fields);
  }
  info(message: string, fields: Record<string, unknown> = {}): void {
    this.log("info", message, fields);
  }
  error(message: string, fields: Record<string, unknown> = {}): void {
    this.log("error", message, fields);
  }

  private log(level: Exclude<LogLevel, "silent">, message: string, fields: Record<string, unknown>): void {
    if (ORDER[level] < ORDER[this.level]) return;
    this.write(JSON.stringify({ level, runId: this.runId, message, ...fields }));
  }
}
