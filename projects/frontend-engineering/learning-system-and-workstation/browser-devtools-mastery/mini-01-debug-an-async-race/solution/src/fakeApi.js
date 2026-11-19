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
    // Reject when the caller cancels the request.
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const timer = setTimeout(() => {
      const results = WORDS.filter((word) => word.startsWith(query));
      resolve({ query, results });
    }, delayMs);
    // Stop the timer too, so a cancelled request leaves no work behind.
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}
