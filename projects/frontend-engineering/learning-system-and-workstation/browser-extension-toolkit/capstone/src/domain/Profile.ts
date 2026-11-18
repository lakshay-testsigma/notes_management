import { ProfileError } from "./errors.ts";
import type { Policy } from "./Policy.ts";

export interface ExtensionEntry {
  id: string;
  name: string;
  phase: string;
  manifest: string; // path of the manifest file, relative to the profile file
}

// The team's vetted list of extensions. An invalid profile cannot exist.
export class Profile {
  readonly name: string;
  readonly extensions: ExtensionEntry[];

  private constructor(name: string, extensions: ExtensionEntry[]) {
    this.name = name;
    this.extensions = extensions;
  }

  static fromJson(raw: unknown, policy: Policy): Profile {
    const o = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
    if (typeof o["name"] !== "string" || o["name"] === "") throw new ProfileError(`Profile needs a "name"`);
    if (!Array.isArray(o["extensions"]) || o["extensions"].length === 0) {
      throw new ProfileError(`Profile needs a non-empty "extensions" list`);
    }
    const seen = new Set<string>();
    const entries: ExtensionEntry[] = [];
    for (const item of o["extensions"] as Record<string, unknown>[]) {
      const entry = { id: item?.["id"], name: item?.["name"], phase: item?.["phase"], manifest: item?.["manifest"] };
      for (const [key, value] of Object.entries(entry)) {
        if (typeof value !== "string" || value === "") throw new ProfileError(`Every extension needs a "${key}"`);
      }
      const e = entry as ExtensionEntry;
      if (seen.has(e.id)) throw new ProfileError(`Extension id "${e.id}" appears twice`);
      if (!policy.phases.includes(e.phase)) {
        throw new ProfileError(`Extension "${e.id}" has phase "${e.phase}"; the policy allows ${policy.phases.join(", ")}`);
      }
      seen.add(e.id);
      entries.push(e);
    }
    return new Profile(o["name"], entries);
  }
}
