import { describe, expect, it } from "vitest";
import { classify } from "../src/classify.ts";
import { entry } from "./helpers.ts";

describe("classify", () => {
  it("treats a content-hashed script as a hashed asset", () => {
    expect(classify(entry({ url: "https://a.example/assets/app.3f9a1c2b.js", mimeType: "text/javascript" }))).toBe("hashed-asset");
    expect(classify(entry({ url: "https://a.example/assets/main-D4kQ93xz.css", mimeType: "text/css" }))).toBe("hashed-asset");
  });

  it("treats text/html as html, even with a hash-like path", () => {
    expect(classify(entry({ url: "https://a.example/page.3f9a1c2b.js", mimeType: "text/html" }))).toBe("html");
  });

  it("leaves plain file names alone", () => {
    expect(classify(entry({ url: "https://a.example/assets/application.js", mimeType: "text/javascript" }))).toBe("other");
    expect(classify(entry({ url: "https://a.example/api/data", mimeType: "application/json" }))).toBe("other");
  });
});
