import type { CheckResult, Outcome } from "../domain/Outcome.ts";
import type { PageContext } from "../domain/PageContext.ts";
import type { Check } from "../domain/ports.ts";
import type { ResponseHeaders } from "../domain/ResponseHeaders.ts";

const SIX_MONTHS = 15552000; // seconds; below this HSTS is weak

// Checks three response headers: CSP, HSTS and X-Content-Type-Options.
// Without saved headers we cannot see anything, so every result is "review".
export class SecurityHeaderCheck implements Check {
  readonly id = "security-headers";

  async run(context: PageContext): Promise<CheckResult[]> {
    const url = context.url;
    const make = (check: string, outcome: Outcome, message: string): CheckResult => ({ check, target: url, outcome, message });
    const headers = context.headers;
    if (!headers) {
      return ["header-csp", "header-hsts", "header-x-content-type-options"].map((id) =>
        make(id, "review", "no saved response headers were given"),
      );
    }
    return [this.csp(headers, make), this.hsts(headers, url, make), this.noSniff(headers, make)];
  }

  private csp(h: ResponseHeaders, make: (c: string, o: Outcome, m: string) => CheckResult): CheckResult {
    const policy = h.get("content-security-policy");
    if (!policy) {
      if (h.get("content-security-policy-report-only")) {
        return make("header-csp", "review", "CSP is in report-only mode: it reports but does not block");
      }
      return make("header-csp", "fail", "Content-Security-Policy header is missing");
    }
    const directives = policy.split(";").map((d) => d.trim());
    const scriptRule = directives.find((d) => d.startsWith("script-src ")) ?? directives.find((d) => d.startsWith("default-src "));
    if (scriptRule && /'unsafe-(inline|eval)'/.test(scriptRule)) {
      return make("header-csp", "review", `script rule allows ${scriptRule.match(/'unsafe-(inline|eval)'/)![0]}; this weakens CSP`);
    }
    return make("header-csp", "pass", "CSP is present and does not allow unsafe script");
  }

  private hsts(h: ResponseHeaders, url: string, make: (c: string, o: Outcome, m: string) => CheckResult): CheckResult {
    if (url.startsWith("http:")) return make("header-hsts", "review", "HSTS only applies over https; this URL is http");
    const value = h.get("strict-transport-security");
    if (!value) return make("header-hsts", "fail", "Strict-Transport-Security header is missing");
    const maxAge = Number(/max-age=(\d+)/i.exec(value)?.[1]);
    if (!Number.isFinite(maxAge) || maxAge === 0) return make("header-hsts", "fail", "HSTS max-age is missing or 0");
    if (maxAge < SIX_MONTHS) return make("header-hsts", "review", `HSTS max-age is ${maxAge} seconds; at least ${SIX_MONTHS} is advised`);
    return make("header-hsts", "pass", `HSTS max-age is ${maxAge} seconds`);
  }

  private noSniff(h: ResponseHeaders, make: (c: string, o: Outcome, m: string) => CheckResult): CheckResult {
    const value = h.get("x-content-type-options");
    if (value?.toLowerCase() === "nosniff") return make("header-x-content-type-options", "pass", "nosniff is set");
    return make("header-x-content-type-options", "fail", "X-Content-Type-Options: nosniff is missing");
  }
}
