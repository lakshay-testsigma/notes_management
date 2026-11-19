// Plain good / needs-work / poor labels. Limits follow the published Core Web Vitals
// guidance; check the current values before you rely on them.
const LIMITS = {
  lcpMs: { good: 2500, poor: 4000 },
  cls: { good: 0.1, poor: 0.25 },
  tbtMs: { good: 200, poor: 600 },
};

export class Rating {
  static of(metric, value) {
    const limit = LIMITS[metric];
    if (value === null || value === undefined || !limit) return "unknown";
    if (value <= limit.good) return "good";
    if (value <= limit.poor) return "needs-work";
    return "poor";
  }
}
