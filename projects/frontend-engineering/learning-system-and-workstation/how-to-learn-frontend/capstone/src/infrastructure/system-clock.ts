import type { Clock, IdGenerator } from "../domain/ports.js";

export class SystemClock implements Clock {
  // The learner's local calendar day, not UTC, so "due today" matches their wall clock.
  today(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
  }
}

export class RandomIdGenerator implements IdGenerator {
  next(): string {
    return crypto.randomUUID();
  }
}
