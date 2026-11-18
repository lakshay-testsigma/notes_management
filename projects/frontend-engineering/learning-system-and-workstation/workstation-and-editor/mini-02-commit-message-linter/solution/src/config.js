// Each entry is [level, when, value]. Level: 0 off, 1 warning, 2 error.
export const defaultConfig = {
  "type-enum": [2, "always", ["feat", "fix", "docs", "style", "refactor", "perf", "test", "build", "ci", "chore", "revert"]],
  "header-max-length": [2, "always", 72],
  "subject-empty": [2, "never"],
  "breaking-has-description": [1, "always"],
};
