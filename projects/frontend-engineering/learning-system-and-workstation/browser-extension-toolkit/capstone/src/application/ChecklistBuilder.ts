import type { Policy } from "../domain/Policy.ts";
import type { Profile } from "../domain/Profile.ts";

export interface ChecklistPhase {
  phase: string;
  steps: string[];
}

// Groups the profile by phase, in the order the policy lists the phases.
// Phases with no extension are left out.
export class ChecklistBuilder {
  build(profile: Profile, policy: Policy): ChecklistPhase[] {
    const phases: ChecklistPhase[] = [];
    for (const phase of policy.phases) {
      const entries = profile.extensions.filter((e) => e.phase === phase);
      if (entries.length === 0) continue;
      const steps = entries.map((e) => `Install "${e.name}" and pin it in the team browser profile`);
      steps.push(`Open a page and confirm each ${phase} extension shows its panel`);
      phases.push({ phase, steps });
    }
    return phases;
  }
}
