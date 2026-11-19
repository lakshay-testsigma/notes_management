// Reads configuration from environment variables once, at startup, and fails early.
const DEFAULT_CHROME = {
  darwin: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  linux: "google-chrome",
  win32: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
};

export class Config {
  constructor(values) {
    Object.assign(this, values);
    Object.freeze(this);
  }

  static fromEnv(env = process.env, platform = process.platform) {
    const number = (name, fallback, min) => {
      const raw = env[name];
      if (raw === undefined || raw === "") return fallback;
      const value = Number(raw);
      if (!Number.isInteger(value) || value < min) throw new Error(`${name} must be an integer >= ${min}`);
      return value;
    };
    return new Config({
      port: number("PORT", 3000, 0),
      chromePath: env.CHROME_PATH || DEFAULT_CHROME[platform] || "google-chrome",
      navTimeoutMs: number("NAV_TIMEOUT_MS", 30000, 1000),
      heapWaitMs: number("HEAP_WAIT_MS", 2000, 0),
      captureDir: env.CAPTURE_DIR || "captures",
      allowPrivateHosts: env.ALLOW_PRIVATE_HOSTS === "true",
    });
  }
}
