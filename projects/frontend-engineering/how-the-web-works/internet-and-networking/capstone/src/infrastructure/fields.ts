// Small readers for untyped JSON. Each one throws the error class its caller asks for.

type Fail = (message: string) => Error;

export function asObject(value: unknown, path: string, fail: Fail): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw fail(`${path} must be an object`);
  return value as Record<string, unknown>;
}

export function asArray(value: unknown, path: string, fail: Fail): unknown[] {
  if (!Array.isArray(value)) throw fail(`${path} must be a list`);
  return value;
}

export function asString(value: unknown, path: string, fail: Fail): string {
  if (typeof value !== "string") throw fail(`${path} must be text`);
  return value;
}

export function asNumber(value: unknown, path: string, fail: Fail): number {
  if (typeof value !== "number" || Number.isNaN(value)) throw fail(`${path} must be a number`);
  return value;
}

export function asBoolean(value: unknown, path: string, fail: Fail): boolean {
  if (typeof value !== "boolean") throw fail(`${path} must be true or false`);
  return value;
}
