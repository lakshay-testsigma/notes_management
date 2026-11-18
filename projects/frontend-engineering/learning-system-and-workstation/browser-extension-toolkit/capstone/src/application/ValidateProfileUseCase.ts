import { InputError } from "../domain/errors.ts";
import type { CheckResult } from "../domain/Outcome.ts";
import type { FileSource, Logger } from "../domain/ports.ts";
import { ManifestScorer } from "./ManifestScorer.ts";
import type { LoadedProfile } from "./ProfileLoader.ts";

const CHECK_ID = "extension-permissions";

// Use case 1: judge every extension in the profile against the policy.
// A manifest that cannot be read is "review", not "fail": we could not see it.
export class ValidateProfileUseCase {
  private readonly files: FileSource;
  private readonly logger: Logger;

  constructor(files: FileSource, logger: Logger) {
    this.files = files;
    this.logger = logger;
  }

  async run(loaded: LoadedProfile): Promise<CheckResult[]> {
    const scorer = new ManifestScorer(loaded.policy);
    const results: CheckResult[] = [];
    for (const entry of loaded.profile.extensions) {
      const result = await this.checkOne(entry.id, loaded.manifestPath(entry), loaded, scorer);
      this.logger.info("extension.checked", { id: entry.id, outcome: result.outcome });
      results.push(result);
    }
    return results;
  }

  private async checkOne(id: string, path: string, loaded: LoadedProfile, scorer: ManifestScorer): Promise<CheckResult> {
    let text: string;
    try {
      text = await this.files.readText(path);
    } catch (error) {
      if (!(error instanceof InputError)) throw error;
      return { check: CHECK_ID, target: id, outcome: "review", message: `manifest not readable (${error.message})` };
    }
    let manifest: Record<string, unknown>;
    try {
      manifest = JSON.parse(text);
    } catch {
      return { check: CHECK_ID, target: id, outcome: "fail", message: "manifest is not valid JSON" };
    }
    if (typeof manifest?.["manifest_version"] !== "number" || typeof manifest["name"] !== "string") {
      return { check: CHECK_ID, target: id, outcome: "fail", message: 'manifest lacks "manifest_version" or "name"' };
    }
    const { points, reasons } = scorer.score(manifest);
    const outcome = loaded.policy.judge(points);
    const why = reasons.length > 0 ? reasons.join("; ") : "no risky permission";
    return { check: CHECK_ID, target: id, outcome, message: `${points} points: ${why}` };
  }
}
