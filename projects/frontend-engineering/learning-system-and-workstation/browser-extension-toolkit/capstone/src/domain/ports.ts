import type { CheckResult } from "./Outcome.ts";
import type { AxeFindings, PageContext, ParsedPage } from "./PageContext.ts";

// Ports: what the inner layers need from the outside world.
export interface FileSource {
  readText(path: string): Promise<string>; // throws InputError when unreadable
}

export interface Logger {
  debug(event: string, fields?: Record<string, unknown>): void;
  info(event: string, fields?: Record<string, unknown>): void;
  warn(event: string, fields?: Record<string, unknown>): void;
  error(event: string, fields?: Record<string, unknown>): void;
}

export interface PageParser {
  parse(html: string): ParsedPage;
}

export interface AxeRunner {
  run(html: string): Promise<AxeFindings>;
}

// One kind of page check. Add a check by writing a class that has this shape.
export interface Check {
  readonly id: string;
  run(context: PageContext): Promise<CheckResult[]>;
}
