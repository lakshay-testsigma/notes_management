import { unknown } from "../domain/finding.ts";
import type { Check, Clock, Logger, PolicyRepository, SiteDataSource } from "../domain/ports.ts";
import { Report } from "../domain/report.ts";
import type { Finding } from "../domain/types.ts";

// The one use case: load the inputs once, run every check, build the report.
export class RunReport {
  private readonly source: SiteDataSource;
  private readonly policies: PolicyRepository;
  private readonly checks: Check[];
  private readonly clock: Clock;
  private readonly logger: Logger;

  constructor(source: SiteDataSource, policies: PolicyRepository, checks: Check[], clock: Clock, logger: Logger) {
    this.source = source;
    this.policies = policies;
    this.checks = checks;
    this.clock = clock;
    this.logger = logger;
  }

  execute(): Report {
    const site = this.source.load();
    const policy = this.policies.load();
    const context = { site, policy, now: this.clock.now() };
    const findings: Finding[] = [];

    for (const check of this.checks) {
      try {
        const found = check.run(context);
        this.logger.info("check finished", { check: check.name, findings: found.length });
        findings.push(...found);
      } catch (error) {
        // A broken check must not hide the other results, and must not look like a pass.
        const reason = error instanceof Error ? error.message : String(error);
        this.logger.error("check crashed", { check: check.name, reason });
        findings.push(unknown(check.name, `${check.name}.crashed`, site.dns.host, `The ${check.name} check failed to run: ${reason}`));
      }
    }
    return new Report(policy.host, site.client, this.checks.map((c) => c.name), site.entries.length, findings);
  }
}
