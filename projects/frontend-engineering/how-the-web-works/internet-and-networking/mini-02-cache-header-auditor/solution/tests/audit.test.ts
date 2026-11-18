import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { auditAll } from "../src/audit.ts";
import { readEntries } from "../src/har.ts";

// The expected list sits next to the HAR. Rules the auditor skips are listed in the README.
const har = JSON.parse(readFileSync(new URL("./fixtures/site.har", import.meta.url), "utf8"));
const expected = JSON.parse(readFileSync(new URL("./fixtures/expected.json", import.meta.url), "utf8"));

describe("audit of the sample HAR", () => {
  it("reports exactly the expected non-ok findings", () => {
    const got = auditAll(readEntries(har))
      .filter((f) => f.result !== "ok")
      .map((f) => `${f.result} ${f.rule} ${new URL(f.url).pathname}`);
    expect(got).toEqual(expected);
  });

  it("joins repeated Cache-Control rows before parsing", () => {
    const about = readEntries(har).find((e) => e.url.endsWith("/about"));
    expect(about?.headers["cache-control"]).toBe("public, max-age=600, max-age=60");
  });
});
