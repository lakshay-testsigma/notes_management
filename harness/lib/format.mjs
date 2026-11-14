// Plain-text output helpers for the human (non --json) mode.

/** Render an aligned table. Columns are separated by two spaces. */
export function table(headers, rows, { indent = 2 } = {}) {
  const all = [headers, ...rows].map((row) => row.map((cell) => String(cell ?? '')));
  const widths = headers.map((_, i) => Math.max(...all.map((row) => row[i].length)));
  const pad = ' '.repeat(indent);
  const line = (row) =>
    (pad + row.map((cell, i) => cell.padEnd(widths[i])).join('  ')).trimEnd();
  return [line(all[0]), line(widths.map((w) => '-'.repeat(w))), ...all.slice(1).map(line)].join(
    '\n',
  );
}

/** Render `label  value` pairs with aligned values. */
export function keyValues(pairs, { indent = 2 } = {}) {
  const width = Math.max(...pairs.map(([key]) => key.length));
  const pad = ' '.repeat(indent);
  return pairs.map(([key, value]) => `${pad}${key.padEnd(width)}  ${value}`).join('\n');
}

/** A validation failure as one actionable line: `path: problem. fix.` */
export function formatFailure(failure) {
  return `${failure.path}: ${trimDot(failure.problem)}. ${trimDot(failure.fix)}.`;
}

export function formatNumber(n) {
  return Number(n).toLocaleString('en-US');
}

function trimDot(text) {
  return String(text).trim().replace(/\.+$/, '');
}
