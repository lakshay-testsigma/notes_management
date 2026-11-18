import type { Logger } from "../domain/ports.ts";

export type LogLevel = "silent" | "warn" | "info";
const ORDER: Record<LogLevel, number> = { silent: 3, warn: 1, info: 0 };
const WEIGHT = { info: 0, warn: 1, error: 2 } as const;

// One JSON object per line on stderr, so stdout stays clean for the report.
export class JsonLogger implements Logger {
  private readonly runId: string;
  private readonly level: LogLevel;
  private readonly write: (line: string) => void;

  constructor(runId: string, level: LogLevel, write: (line: string) => void = (line) => process.stderr.write(line + "\n")) {
    this.runId = runId;
    this.level = level;
    this.write = write;
  }

  info(message: string, fields: Record<string, unknown> = {}): void {
    this.log("info", message, fields);
  }

  warn(message: string, fields: Record<string, unknown> = {}): void {
    this.log("warn", message, fields);
  }

  error(message: string, fields: Record<string, unknown> = {}): void {
    this.log("error", message, fields);
  }

  private log(level: keyof typeof WEIGHT, message: string, fields: Record<string, unknown>): void {
    if (WEIGHT[level] < ORDER[this.level]) return;
    this.write(JSON.stringify({ level, runId: this.runId, message, ...fields }));
  }
}
