import { baselineTable } from "./baseline.ts";
import { decideShip } from "./decide.ts";
import { parseTarget, resolveFeature } from "./features.ts";
import { formatReport } from "./report.ts";

/** Read the command line. This part is wiring, so it is already done. */
function readArgs(argv: string[]): { target: string | undefined; ids: string[] } {
  const ids: string[] = [];
  let target: string | undefined;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--target") {
      target = argv[index + 1];
      index += 1;
      continue;
    }
    ids.push(arg);
  }
  return { target, ids };
}

function main(argv: string[]): void {
  const { target, ids } = readArgs(argv.slice(2));
  const chosenTarget = parseTarget(target);
  const chosen = ids.length > 0 ? ids : baselineTable.map((feature) => feature.id);
  const decisions = chosen.map((id) => decideShip(resolveFeature(id), chosenTarget));
  console.log(formatReport(chosenTarget, decisions));
}

try {
  main(process.argv);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
