// Conventional Commits -> SemVer: breaking = major, feat = minor, fix = patch.
export function bumpFor(parsed) {
  if (parsed.breaking) return "major";
  if (parsed.type === "feat") return "minor";
  if (parsed.type === "fix") return "patch";
  return "none";
}
