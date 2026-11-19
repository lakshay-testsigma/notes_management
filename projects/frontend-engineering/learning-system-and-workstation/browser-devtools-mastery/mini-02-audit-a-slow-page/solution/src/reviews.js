// The reviews "database" is slow. A cache means only the first visitor waits.

export function createReviewsCache(loader, ttlMs, now = () => Date.now()) {
  let value = null;
  let expiresAt = 0;
  return async function getReviews() {
    if (value !== null && now() < expiresAt) return value;
    value = await loader();
    expiresAt = now() + ttlMs;
    return value;
  };
}

export function slowReviewsLoader(delayMs) {
  return async () => {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return [
      { author: "Asha", text: "Sturdy and light." },
      { author: "Ben", text: "Arrived a day early." },
      { author: "Chen", text: "Good value." },
    ];
  };
}
