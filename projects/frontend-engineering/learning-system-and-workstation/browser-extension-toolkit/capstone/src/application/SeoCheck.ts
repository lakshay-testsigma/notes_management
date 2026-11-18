import type { CheckResult, Outcome } from "../domain/Outcome.ts";
import type { PageContext } from "../domain/PageContext.ts";
import type { Check } from "../domain/ports.ts";

// Reads the facts that PageParser already collected: title, description,
// canonical link and JSON-LD. It never touches the DOM.
export class SeoCheck implements Check {
  readonly id = "seo";

  async run(context: PageContext): Promise<CheckResult[]> {
    const url = context.url;
    const make = (check: string, outcome: Outcome, message: string): CheckResult => ({ check, target: url, outcome, message });
    const { title, metaDescription, canonical, jsonLdBlocks } = context.page;
    const results: CheckResult[] = [];

    if (!title) results.push(make("seo-title", "fail", "the page has no <title>"));
    else if (title.length > 60) results.push(make("seo-title", "review", `title has ${title.length} characters; search results cut at about 60`));
    else results.push(make("seo-title", "pass", "title is present and short enough"));

    if (!metaDescription) results.push(make("seo-description", "fail", "the page has no meta description"));
    else if (metaDescription.length < 50 || metaDescription.length > 160) {
      results.push(make("seo-description", "review", `description has ${metaDescription.length} characters; 50 to 160 is typical`));
    } else results.push(make("seo-description", "pass", "description length is in range"));

    results.push(this.canonicalResult(context, make));

    results.push(this.jsonLdResult(jsonLdBlocks, make));
    return results;
  }

  private canonicalResult(context: PageContext, make: (c: string, o: Outcome, m: string) => CheckResult): CheckResult {
    const canonical = context.page.canonical;
    if (!canonical) return make("seo-canonical", "fail", "the page has no canonical link");
    let canonicalUrl: URL;
    try {
      canonicalUrl = new URL(canonical);
    } catch {
      return make("seo-canonical", "fail", `canonical "${canonical}" is not an absolute URL`);
    }
    try {
      if (canonicalUrl.host !== new URL(context.url).host) {
        return make("seo-canonical", "review", `canonical points to ${canonicalUrl.host}, not this host; confirm it is on purpose`);
      }
    } catch {
      // The page URL is not a real URL, so there is nothing to compare with.
    }
    return make("seo-canonical", "pass", "canonical link is absolute and on this host");
  }

  private jsonLdResult(blocks: string[], make: (c: string, o: Outcome, m: string) => CheckResult): CheckResult {
    if (blocks.length === 0) return make("seo-json-ld", "review", "no JSON-LD found; add it if this page is an article or a product");
    for (const block of blocks) {
      let data: Record<string, unknown>;
      try {
        data = JSON.parse(block);
      } catch {
        return make("seo-json-ld", "fail", "a JSON-LD block is not valid JSON");
      }
      if (!data?.["@context"] || !data["@type"]) {
        return make("seo-json-ld", "review", 'a JSON-LD block lacks "@context" or "@type"');
      }
    }
    return make("seo-json-ld", "pass", `${blocks.length} valid JSON-LD block(s)`);
  }
}
