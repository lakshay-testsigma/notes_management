import type { Budgets } from "../domain/Budgets.ts";
import type { Finding, SkippedInput, SourceName, TriageReport } from "../domain/model.ts";
import type { Audit, Gatherer, Logger } from "../domain/ports.ts";
import type { Artifacts } from "./Artifacts.ts";
import type { Ranker } from "./Ranker.ts";

export type InputPaths = Partial<Record<SourceName, string>>;

// One entry per input kind: how to read it and how to judge it.
export interface Pipeline<T> {
  gatherer: Gatherer<T>;
  audit: Audit<T>;
}

export class TriageUseCase {
  private readonly pipelines: Pipeline<any>[];
  private readonly artifacts: Artifacts;
  private readonly ranker: Ranker;
  private readonly logger: Logger;

  constructor(pipelines: Pipeline<any>[], artifacts: Artifacts, ranker: Ranker, logger: Logger) {
    this.pipelines = pipelines;
    this.artifacts = artifacts;
    this.ranker = ranker;
    this.logger = logger;
  }

  async run(paths: InputPaths, budgets: Budgets): Promise<TriageReport> {
    const findings: Finding[] = [];
    const skipped: SkippedInput[] = [];
    const checked: SourceName[] = [];

    for (const { gatherer, audit } of this.pipelines) {
      const path = paths[gatherer.source];
      if (path === undefined) continue;
      const gathered = await this.artifacts.get(gatherer, path);
      if (!gathered.ok) {
        skipped.push({ source: gatherer.source, reason: gathered.reason });
        continue;
      }
      const found = audit.run(gathered.data, budgets);
      this.logger.info("audit done", { source: gatherer.source, findings: found.length });
      findings.push(...found);
      checked.push(gatherer.source);
    }
    return { findings: this.ranker.rank(findings), skipped, checked };
  }
}
