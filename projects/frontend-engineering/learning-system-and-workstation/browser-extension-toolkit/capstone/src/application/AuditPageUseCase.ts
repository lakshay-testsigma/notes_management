import { InputError } from "../domain/errors.ts";
import type { CheckResult } from "../domain/Outcome.ts";
import type { PageContext } from "../domain/PageContext.ts";
import type { Check, FileSource, Logger, PageParser } from "../domain/ports.ts";
import { ResponseHeaders } from "../domain/ResponseHeaders.ts";

export interface AuditRequest {
  pagePath: string;
  headersPath?: string;
  url: string;
}

// Use case 2: read the saved page once, then give the same context to every check.
// A check that throws becomes a "review" row that names the check and the target,
// so one broken check does not hide the others.
export class AuditPageUseCase {
  private readonly files: FileSource;
  private readonly parser: PageParser;
  private readonly checks: Check[];
  private readonly logger: Logger;

  constructor(files: FileSource, parser: PageParser, checks: Check[], logger: Logger) {
    this.files = files;
    this.parser = parser;
    this.checks = checks;
    this.logger = logger;
  }

  async run(request: AuditRequest): Promise<CheckResult[]> {
    const html = await this.files.readText(request.pagePath);
    const headers = request.headersPath ? ResponseHeaders.fromText(await this.files.readText(request.headersPath)) : null;
    const context: PageContext = { url: request.url, html, page: this.parser.parse(html), headers };

    const results: CheckResult[] = [];
    for (const check of this.checks) {
      try {
        results.push(...(await check.run(context)));
        this.logger.info("check.done", { check: check.id, target: request.url });
      } catch (error) {
        if (error instanceof InputError) throw error;
        const reason = error instanceof Error ? error.message : String(error);
        this.logger.error("check.crashed", { check: check.id, target: request.url, reason });
        results.push({ check: check.id, target: request.url, outcome: "review", message: `${check.id} on ${request.url}: ${reason}` });
      }
    }
    return results;
  }
}
