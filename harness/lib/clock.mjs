// Time helpers. `TUTOR_NOW` (an ISO timestamp) overrides the clock, for tests.

export function now() {
  const override = process.env.TUTOR_NOW;
  const date = override ? new Date(override) : new Date();
  if (Number.isNaN(date.getTime())) {
    throw new Error(`TUTOR_NOW is not a valid ISO timestamp: ${override}`);
  }
  return date;
}

/** ISO UTC timestamp without milliseconds, e.g. 2026-11-14T10:00:00Z. */
export function isoNow() {
  return now().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/** Calendar date in the learner's local time zone, e.g. 2026-11-14. */
export function today() {
  const d = now();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

/** Add whole days to a YYYY-MM-DD date. */
export function addDays(dateString, days) {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

/** True for a real calendar date written as YYYY-MM-DD. */
export function isIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
