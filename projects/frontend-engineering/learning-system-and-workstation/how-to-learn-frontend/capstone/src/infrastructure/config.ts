export type LogLevel = "info" | "error";

// Reads settings from environment variables once, at startup, and fails with a clear message.
// Only public values belong here: every VITE_ variable is visible in the browser bundle.
export class Config {
  private constructor(
    public readonly storageKey: string,
    public readonly logLevel: LogLevel,
  ) {}

  static fromEnv(env: Record<string, string | undefined>): Config {
    const storageKey = env.VITE_STORAGE_KEY?.trim() || "til-journal.notes.v1";
    const level = env.VITE_LOG_LEVEL?.trim() || "info";
    if (level !== "info" && level !== "error") {
      throw new Error(`VITE_LOG_LEVEL is "${level}". Use "info" or "error".`);
    }
    return new Config(storageKey, level);
  }
}
