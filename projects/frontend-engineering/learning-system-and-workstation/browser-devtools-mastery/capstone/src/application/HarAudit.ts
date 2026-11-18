import type { Budgets } from "../domain/Budgets.ts";
import type { Finding, HarData } from "../domain/model.ts";
import type { Audit } from "../domain/ports.ts";

// The report never shows query strings: they often carry tokens.
function safeUrl(url: string): string {
  return url.split("?")[0].split("#")[0];
}

const round = (value: number): number => Math.round(value);

export class HarAudit implements Audit<HarData> {
  readonly source = "har" as const;

  run(data: HarData, budgets: Budgets): Finding[] {
    const limits = budgets.values;
    const findings: Finding[] = [];

    for (const request of data.requests) {
      const label = `${request.method} ${safeUrl(request.url)}`;
      if (!request.hasResponse) {
        findings.push(this.finding("har-no-response", "Request got no response", `${label} never answered; it was blocked for ${round(request.totalMs)} ms.`, request.totalMs, 0));
        continue;
      }
      if (request.waitMs > limits.maxRequestWaitMs) {
        findings.push(this.finding("har-slow-wait", "Slow server response", `${label} waited ${round(request.waitMs)} ms for the first byte (budget ${limits.maxRequestWaitMs} ms).`, request.waitMs - limits.maxRequestWaitMs, request.bytes));
      }
      if (request.totalMs > limits.maxRequestTotalMs) {
        findings.push(this.finding("har-slow-request", "Slow request", `${label} took ${round(request.totalMs)} ms in total (budget ${limits.maxRequestTotalMs} ms).`, request.totalMs - limits.maxRequestTotalMs, request.bytes));
      }
    }

    const pageBytes = data.requests.reduce((sum, request) => sum + request.bytes, 0);
    if (pageBytes > limits.maxPageBytes) {
      findings.push(this.finding("har-page-weight", "Page is too heavy", `The page transferred ${pageBytes} bytes (budget ${limits.maxPageBytes}).`, 0, pageBytes - limits.maxPageBytes));
    }
    return findings;
  }

  private finding(id: string, title: string, detail: string, savingsMs: number, bytes: number): Finding {
    return { source: "har", id, title, detail, mode: "fail", savingsMs: round(savingsMs), bytes, dataKind: "recorded" };
  }
}
