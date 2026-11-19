// The reviews "database" is slow. A cache means only the first visitor waits.

// TODO(5): Return a function getReviews() that calls loader() only when nothing
// is cached or the cached value is older than ttlMs. Use now() for the clock.
// Today it calls the slow loader on every request.
export function createReviewsCache(loader, ttlMs, now = () => Date.now()) {
  return async function getReviews() {
    return loader();
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
