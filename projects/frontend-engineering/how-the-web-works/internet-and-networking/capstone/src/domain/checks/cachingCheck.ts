import { CacheControl } from "../cacheControl.ts";
import { problem, unknown } from "../finding.ts";
import { freshnessRule } from "../freshness.ts";
import { firstHeader, headerValues, isHtml } from "../headers.ts";
import type { Check, CheckContext } from "../ports.ts";
import type { Finding, HttpEntry, Policy } from "../types.ts";

export class CachingCheck implements Check {
  readonly name = "caching";

  run({ site, policy }: CheckContext): Finding[] {
    const findings: Finding[] = [];
    const hashed = new RegExp(policy.caching.hashedAssetPattern);
    for (const entry of site.entries) {
      if (entry.method !== "GET" || entry.status !== 200) continue;
      findings.push(...this.checkEntry(entry, policy, hashed));
    }
    return findings;
  }

  private checkEntry(entry: HttpEntry, policy: Policy, hashed: RegExp): Finding[] {
    const findings: Finding[] = [];
    const header = headerValues(entry, "cache-control").join(", ");
    const cc = CacheControl.parse(header);
    if (header !== "" && !cc.isReadable) {
      return [unknown(this.name, "cache.unreadable", entry.url, `Cannot read Cache-Control "${header}": ${cc.errors.join("; ")}.`)];
    }

    const fresh = freshnessRule(cc, firstHeader(entry, "expires"), firstHeader(entry, "date"), firstHeader(entry, "last-modified"));
    const path = new URL(entry.url).pathname;
    const hasValidator = firstHeader(entry, "etag") !== undefined || firstHeader(entry, "last-modified") !== undefined;

    const revalidates = cc.has("no-cache") || cc.has("no-store");
    if (!revalidates && (fresh.rule === "none" || fresh.rule === "heuristic")) {
      findings.push(problem(this.name, "cache.no-lifetime", "warning", entry.url, `No explicit lifetime (rule: ${fresh.rule}). Caches will guess.`));
    }
    if (hashed.test(path)) {
      const maxAge = cc.seconds("max-age") ?? 0;
      if (!cc.has("immutable") || maxAge < policy.caching.hashedAssetMinMaxAge) {
        findings.push(problem(this.name, "cache.hashed-not-immutable", "error", entry.url, `Hashed asset needs "max-age=${policy.caching.hashedAssetMinMaxAge}, immutable"; found "${header}".`));
      }
    } else if (isHtml(entry)) {
      const lifetime = fresh.seconds ?? 0;
      if (lifetime > policy.caching.htmlMaxAge && !cc.has("no-cache")) {
        findings.push(problem(this.name, "cache.html-too-fresh", "error", entry.url, `HTML is fresh for ${lifetime}s (rule: ${fresh.rule}); policy allows ${policy.caching.htmlMaxAge}s.`));
      }
      if (!hasValidator) {
        findings.push(problem(this.name, "cache.no-validator", "warning", entry.url, "HTML has no ETag or Last-Modified, so a revalidation cannot return 304."));
      }
    }
    findings.push(...this.checkSharedCaches(entry, cc), ...this.checkVary(entry));
    return findings;
  }

  private checkSharedCaches(entry: HttpEntry, cc: CacheControl): Finding[] {
    const setsCookie = headerValues(entry, "set-cookie").length > 0;
    if (setsCookie && (cc.has("public") || cc.has("s-maxage"))) {
      return [problem(this.name, "cache.shared-leak", "error", entry.url, "Response sets a cookie but a shared cache may store it (public or s-maxage).")];
    }
    return [];
  }

  private checkVary(entry: HttpEntry): Finding[] {
    const vary = (firstHeader(entry, "vary") ?? "").toLowerCase();
    if (vary.includes("*")) {
      return [problem(this.name, "cache.vary-star", "warning", entry.url, "Vary: * stops caches from reusing this response.")];
    }
    if (firstHeader(entry, "content-encoding") !== undefined && !vary.includes("accept-encoding")) {
      return [problem(this.name, "cache.vary-encoding", "warning", entry.url, "Compressed response lacks Vary: Accept-Encoding.")];
    }
    return [];
  }
}
