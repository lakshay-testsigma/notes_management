import { describe, expect, it } from "vitest";
import { runAxe, toFindings } from "../src/axe.js";

const doc = (body: string) => `<!doctype html><html lang="en"><head><title>t</title></head><body><main><h1>Hi</h1>${body}</main></body></html>`;

describe("axe in jsdom", () => {
  it("reports an image without alt as a violation with its selector", async () => {
    const found = toFindings("p", await runAxe(doc('<img src="a.png">')));
    const f = found.find((x) => x.rule === "image-alt");
    expect(f).toMatchObject({ outcome: "violation", target: "img", page: "p" });
  });
  it("reports an image with alt as a pass", async () => {
    const found = toFindings("p", await runAxe(doc('<img src="a.png" alt="A chart">')));
    expect(found.find((x) => x.rule === "image-alt")?.outcome).toBe("pass");
  });
  it("keeps color-contrast as needs review, because jsdom has no layout", async () => {
    const found = toFindings("p", await runAxe(doc('<p style="color:#777;background:#fff">Pale text here</p>')));
    const contrast = found.filter((x) => x.rule === "color-contrast");
    expect(contrast.length).toBeGreaterThan(0);
    expect(contrast.every((x) => x.outcome === "incomplete")).toBe(true);
  });
});
