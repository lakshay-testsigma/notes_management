import assert from "node:assert/strict";
import { test } from "node:test";
import { InvalidUrlError } from "../../src/domain/errors.js";
import { UrlPolicy } from "../../src/domain/UrlPolicy.js";
import { Config } from "../../src/infrastructure/Config.js";

const policy = new UrlPolicy();

test("accepts a public https URL", () => {
  assert.equal(policy.check(" https://example.com/a "), "https://example.com/a");
});

test("rejects text that is not a URL and non-http schemes", () => {
  assert.throws(() => policy.check("example"), InvalidUrlError);
  assert.throws(() => policy.check("file:///etc/passwd"), InvalidUrlError);
  assert.throws(() => policy.check("javascript:alert(1)"), InvalidUrlError);
});

test("blocks private and local hosts by default", () => {
  for (const u of ["http://localhost:3000", "http://127.0.0.1", "http://10.0.0.5", "http://192.168.1.1", "http://172.16.0.1", "http://169.254.169.254", "http://[::1]/"]) {
    assert.throws(() => policy.check(u), InvalidUrlError, u);
  }
});

test("allows private hosts when the switch is on", () => {
  assert.equal(new UrlPolicy({ allowPrivateHosts: true }).check("http://localhost:3000"), "http://localhost:3000/");
});

test("Config reads defaults and environment values", () => {
  const defaults = Config.fromEnv({}, "linux");
  assert.equal(defaults.port, 3000);
  assert.equal(defaults.chromePath, "google-chrome");
  assert.equal(defaults.allowPrivateHosts, false);
  const custom = Config.fromEnv({ PORT: "8080", CHROME_PATH: "/x/chrome", ALLOW_PRIVATE_HOSTS: "true" });
  assert.equal(custom.port, 8080);
  assert.equal(custom.chromePath, "/x/chrome");
  assert.equal(custom.allowPrivateHosts, true);
});

test("Config fails at startup on a bad number", () => {
  assert.throws(() => Config.fromEnv({ PORT: "abc" }), /PORT/);
  assert.throws(() => Config.fromEnv({ NAV_TIMEOUT_MS: "5" }), /NAV_TIMEOUT_MS/);
});
