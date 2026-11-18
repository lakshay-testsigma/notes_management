import { describe, expect, it } from "vitest";
import { checkSeo, readHead } from "../src/seo.js";
import type { PageEntry } from "../src/types.js";

const entry: PageEntry = { name: "p", file: "p.html", url: "https://example.com/p", status: 200 };
const page = (head: string, body = "<p>" + "text ".repeat(20) + "</p>") =>
  `<!doctype html><html lang="en"><head>${head}</head><body>${body}</body></html>`;
const outcome = (html: string, rule: string, e = entry) =>
  checkSeo(e, readHead(html)).find((f) => f.rule === rule)?.outcome;

describe("readHead", () => {
  it("reads title, description and canonical", () => {
    const head = readHead(page(
      '<title> Hi </title><meta name="description" content="d"><link rel="canonical" href="https://example.com/p">'));
    expect(head).toMatchObject({ title: "Hi", description: "d", canonical: "https://example.com/p" });
  });
  it("parses JSON-LD and counts a broken block", () => {
    const head = readHead(page(
      '<script type="application/ld+json">{"@type":"Product"}</script><script type="application/ld+json">{oops</script>'));
    expect(head.jsonLd).toEqual([{ "@type": "Product" }]);
    expect(head.jsonLdErrors).toBe(1);
  });
  it("returns null for missing tags", () => {
    expect(readHead(page(""))).toMatchObject({ title: null, description: null, canonical: null });
  });
});

describe("checkSeo", () => {
  it("fails a missing title", () => expect(outcome(page(""), "seo-title")).toBe("violation"));
  it("passes a canonical equal to the page url", () =>
    expect(outcome(page('<link rel="canonical" href="https://example.com/p">'), "seo-canonical")).toBe("pass"));
  it("asks for review when the canonical points elsewhere", () =>
    expect(outcome(page('<link rel="canonical" href="https://example.com/other">'), "seo-canonical")).toBe("incomplete"));
  it("fails invalid JSON-LD and asks for review when it is absent", () => {
    expect(outcome(page('<script type="application/ld+json">{</script>'), "seo-structured-data")).toBe("violation");
    expect(outcome(page(""), "seo-structured-data")).toBe("incomplete");
  });
  it("flags an empty script shell as needs review", () =>
    expect(outcome(page("", '<div id="root"></div>'), "rendered-content")).toBe("incomplete"));
  it("reports a redirect as needs review and checks nothing else", () => {
    const redirect = { ...entry, status: 301, location: "https://example.com/new" };
    const found = checkSeo(redirect, readHead(""));
    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject({ rule: "redirect", outcome: "incomplete" });
  });
});
