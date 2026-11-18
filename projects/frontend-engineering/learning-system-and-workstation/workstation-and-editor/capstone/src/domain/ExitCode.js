// One list for every exit code, so hooks and CI can tell the cases apart.
export const ExitCode = Object.freeze({
  OK: 0,
  FAILED: 1,
  USAGE: 9,
});
