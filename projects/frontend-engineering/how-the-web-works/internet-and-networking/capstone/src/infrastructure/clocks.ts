import type { Clock } from "../domain/ports.ts";

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}

// Repeatable runs: tests and the sample use a fixed date from REPORT_NOW.
export class FixedClock implements Clock {
  private readonly moment: Date;

  constructor(iso: string) {
    this.moment = new Date(iso);
  }

  now(): Date {
    return this.moment;
  }
}
