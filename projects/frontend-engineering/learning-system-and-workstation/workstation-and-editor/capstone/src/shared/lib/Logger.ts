// A structured logger: one JSON line per event with level, message, and a
// session id. The browser console is the transport in development.

export interface Logger {
  info(message: string, fields?: Record<string, unknown>): void;
  warn(message: string, fields?: Record<string, unknown>): void;
  error(message: string, fields?: Record<string, unknown>): void;
}

export class ConsoleLogger implements Logger {
  constructor(private readonly sessionId: string) {}

  info(message: string, fields?: Record<string, unknown>): void {
    this.write('info', message, fields);
  }

  warn(message: string, fields?: Record<string, unknown>): void {
    this.write('warn', message, fields);
  }

  error(message: string, fields?: Record<string, unknown>): void {
    this.write('error', message, fields);
  }

  private write(
    level: 'info' | 'warn' | 'error',
    message: string,
    fields?: Record<string, unknown>,
  ): void {
    const line = JSON.stringify({ level, message, sessionId: this.sessionId, ...fields });
    if (level === 'error') console.error(line);
    else if (level === 'warn') console.warn(line);
    else console.info(line);
  }
}
