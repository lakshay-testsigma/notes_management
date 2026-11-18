/**
 * The logger of the app.
 * Every line is one JSON object with a level, a message, a time and the id of
 * the run, so the lines can be read by a machine and still be read by a human.
 */

import type { Logger } from '../domain/ports';
import type { LogLevel } from './Config';

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

export class JsonLogger implements Logger {
  constructor(
    private readonly level: LogLevel = 'info',
    private readonly requestId: string = createRequestId(),
  ) {}

  info(message: string, context?: Record<string, unknown>): void {
    this.write('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.write('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.write('error', message, context);
  }

  private write(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (LEVEL_ORDER[level] < LEVEL_ORDER[this.level]) {
      return;
    }
    const line = JSON.stringify({
      level,
      msg: message,
      time: new Date().toISOString(),
      requestId: this.requestId,
      ...context,
    });
    if (level === 'error') {
      console.error(line);
      return;
    }
    console.log(line);
  }
}

/** A short id that tells the lines of one run apart from the others. */
function createRequestId(): string {
  return Math.random().toString(36).slice(2, 10);
}
