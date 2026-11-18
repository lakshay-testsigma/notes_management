import { dirname, resolve } from "node:path";
import { PolicyError, ProfileError } from "../domain/errors.ts";
import { Policy } from "../domain/Policy.ts";
import { Profile } from "../domain/Profile.ts";
import type { ExtensionEntry } from "../domain/Profile.ts";
import type { FileSource } from "../domain/ports.ts";

// A profile together with the policy it was checked against.
export interface LoadedProfile {
  policy: Policy;
  profile: Profile;
  manifestPath(entry: ExtensionEntry): string;
}

// Step one of every run: read the policy and the profile and check their shape.
export class ProfileLoader {
  private readonly files: FileSource;

  constructor(files: FileSource) {
    this.files = files;
  }

  async load(profilePath: string, policyPath: string): Promise<LoadedProfile> {
    const policy = Policy.fromJson(await this.readJson(policyPath, PolicyError));
    const profile = Profile.fromJson(await this.readJson(profilePath, ProfileError), policy);
    // Manifest paths in the profile are relative to the profile file.
    const base = dirname(resolve(profilePath));
    return { policy, profile, manifestPath: (entry) => resolve(base, entry.manifest) };
  }

  private async readJson(path: string, ErrorClass: typeof PolicyError): Promise<unknown> {
    const text = await this.files.readText(path);
    try {
      return JSON.parse(text);
    } catch {
      throw new ErrorClass(`${path} is not valid JSON`);
    }
  }
}

