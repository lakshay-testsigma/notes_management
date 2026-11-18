import { UsageError } from "./errors.ts";

export interface BudgetValues {
  maxRequestWaitMs: number;
  maxRequestTotalMs: number;
  maxPageBytes: number;
  maxLongTaskMs: number;
  maxTotalBlockingMs: number;
  maxCls: number;
  maxLcpMs: number;
  maxFcpMs: number;
  minPerformanceScore: number;
}

const DEFAULTS: BudgetValues = {
  maxRequestWaitMs: 800,
  maxRequestTotalMs: 3000,
  maxPageBytes: 1_500_000,
  maxLongTaskMs: 200,
  maxTotalBlockingMs: 300,
  maxCls: 0.1,
  maxLcpMs: 2500,
  maxFcpMs: 1800,
  minPerformanceScore: 0.9,
};

// A budget is a limit the team agreed on. Overrides must be positive numbers.
export class Budgets {
  readonly values: BudgetValues;

  constructor(values: BudgetValues) {
    this.values = values;
  }

  static defaults(): Budgets {
    return new Budgets({ ...DEFAULTS });
  }

  static fromJson(text: string): Budgets {
    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      throw new UsageError("Budgets file is not valid JSON.");
    }
    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
      throw new UsageError("Budgets file must hold one JSON object.");
    }
    const merged: BudgetValues = { ...DEFAULTS };
    for (const [key, value] of Object.entries(raw)) {
      if (!(key in DEFAULTS)) throw new UsageError(`Unknown budget "${key}".`);
      if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
        throw new UsageError(`Budget "${key}" must be a positive number.`);
      }
      merged[key as keyof BudgetValues] = value;
    }
    return new Budgets(merged);
  }
}
