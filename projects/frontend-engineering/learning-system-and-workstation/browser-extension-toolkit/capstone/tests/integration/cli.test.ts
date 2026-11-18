import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { AccessibilityCheck } from "../../src/application/AccessibilityCheck.ts";
import { AuditPageUseCase } from "../../src/application/AuditPageUseCase.ts";
import { ChecklistBuilder } from "../../src/application/ChecklistBuilder.ts";
import { ProfileLoader } from "../../src/application/ProfileLoader.ts";
import { SecurityHeaderCheck } from "../../src/application/SecurityHeaderCheck.ts";
import { SeoCheck } from "../../src/application/SeoCheck.ts";
import { ValidateProfileUseCase } from "../../src/application/ValidateProfileUseCase.ts";
import { JsdomAxeRunner } from "../../src/infrastructure/JsdomAxeRunner.ts";
import { JsdomPageParser } from "../../src/infrastructure/JsdomPageParser.ts";
import { NodeFileSource } from "../../src/infrastructure/NodeFileSource.ts";
import { Cli } from "../../src/interface/Cli.ts";
import { TextRenderer } from "../../src/interface/TextRenderer.ts";
import { silentLogger } from "../unit/helpers.ts";

const root = resolve(import.meta.dirname, "../..");
const p = (...parts: string[]) => resolve(root, ...parts);

// The real adapters: real files, real jsdom, real axe-core. Only the output is captured.
function makeCli(strict = false) {
  const files = new NodeFileSource();
  const output: string[] = [];
  const cli = new Cli({
    loader: new ProfileLoader(files),
    validate: new ValidateProfileUseCase(files, silentLogger),
    audit: new AuditPageUseCase(files, new JsdomPageParser(), [new AccessibilityCheck(new JsdomAxeRunner()), new SeoCheck(), new SecurityHeaderCheck()], silentLogger),
    checklist: new ChecklistBuilder(),
    renderer: new TextRenderer(),
    logger: silentLogger,
    policyPath: p("policy/permission-policy.json"),
    strict,
    out: (t) => output.push(t),
  });
  return { cli, text: () => output.join("\n") };
}

describe("CLI with real adapters", () => {
  it("axe-core finds the image without alt text and cannot decide color contrast in jsdom", async () => {
    const { cli, text } = makeCli();
    await cli.run(["audit", "--page", p("tests/fixtures/page-bad.html"), "--url", "https://shop.example.com/"]);
    expect(text()).toMatch(/FAIL .*axe-image-alt/);
    expect(text()).toMatch(/REVIEW .*axe-color-contrast/);
  });

  it("a good page with good headers has no failure and exits 0", async () => {
    const { cli, text } = makeCli();
    const code = await cli.run(["audit", "--page", p("tests/fixtures/page-good.html"), "--headers", p("tests/fixtures/headers-good.txt"), "--url", "https://shop.example.com/"]);
    expect(text()).not.toMatch(/FAIL/);
    expect(code).toBe(0);
  });

  it("run prints the profile result and the checklist, then checks the page", async () => {
    const { cli, text } = makeCli();
    const code = await cli.run(["run", "--profile", p("sample/profile.json"), "--page", p("sample/page.html"), "--headers", p("sample/headers.txt"), "--url", "https://shop.example.com/"]);
    expect(text()).toMatch(/Profile validation[\s\S]*Setup checklist[\s\S]*Page checks/);
    expect(code).toBe(1); // the sample page has real failures
  });

  it("a risky extension stops the run before any page check", async () => {
    const { cli, text } = makeCli();
    const code = await cli.run(["run", "--profile", p("sample/profile-risky.json"), "--page", p("sample/page.html")]);
    expect(code).toBe(1);
    expect(text()).toMatch(/Profile rejected/);
    expect(text()).not.toMatch(/Page checks/);
  });

  it("strict mode turns a review into exit code 1", async () => {
    const strictCli = makeCli(true).cli;
    const relaxedCli = makeCli(false).cli;
    const args = ["validate", "--profile", p("sample/profile.json")]; // one review, no failure
    expect(await relaxedCli.run(args)).toBe(0);
    expect(await strictCli.run(args)).toBe(1);
  });

  it("a missing file gives exit code 2 and a message", async () => {
    const { cli, text } = makeCli();
    expect(await cli.run(["audit", "--page", p("tests/fixtures/nope.html")])).toBe(2);
    expect(text()).toMatch(/cannot read/);
  });

  it("an unknown command gives exit code 2 and the usage text", async () => {
    const { cli, text } = makeCli();
    expect(await cli.run(["explode"])).toBe(2);
    expect(text()).toMatch(/Usage:/);
  });
});
