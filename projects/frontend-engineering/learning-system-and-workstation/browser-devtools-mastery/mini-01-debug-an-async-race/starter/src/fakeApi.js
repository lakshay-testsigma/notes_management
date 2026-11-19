// A fake search API. It waits a random time before it answers,
// the way a real server on a slow network does.
const WORDS = [
  "react", "redux", "regex", "router", "render", "ref", "reducer",
  "vue", "vite", "vitest", "node", "npm", "network", "navigation",
  "css", "cache", "cookie", "console", "chrome", "closure",
];

export function randomDelay() {
  return 50 + Math.floor(Math.random() * 750); // 50 to 800 ms
}

export function search(query, { signal, delayMs = randomDelay() } = {}) {
  return new Promise((resolve, reject) => {
    // TODO(4): Reject when the caller cancels the request.
    //   1. If `signal?.aborted` is true now, reject with
    //      `new DOMException("Aborted", "AbortError")` and return.
    const timer = setTimeout(() => {
      const results = WORDS.filter((word) => word.startsWith(query));
      resolve({ query, results });
    }, delayMs);
    // TODO(4): Listen for the signal's "abort" event.
    //   1. Call `clearTimeout(timer)`.
    //   2. Reject with the same AbortError.
  });
}
