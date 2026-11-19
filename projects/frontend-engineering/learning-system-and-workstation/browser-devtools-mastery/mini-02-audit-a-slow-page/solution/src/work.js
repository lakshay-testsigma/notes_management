// The work the "Add to cart" button does on click.
// One call to heavyStep is cheap. Ten thousand calls in a row are one long task.

export function heavyStep(index) {
  let total = 0;
  for (let i = 0; i < 20000; i++) total += Math.sqrt(i + index);
  return total;
}

// Lets the browser run other tasks (clicks, paint) before we continue.
// setTimeout works in every browser; scheduler.yield() is the newer option.
export function yieldToMain() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

// Runs step(item) for every item, but gives control back to the main thread
// whenever a slice of work has used up `budgetMs`. Each slice stays a short task.
export async function processInChunks(items, step, options = {}) {
  const budgetMs = options.budgetMs ?? 40; // under the 50 ms long-task line
  const now = options.now ?? (() => performance.now());
  const yieldFn = options.yieldFn ?? yieldToMain;
  const results = [];
  let sliceStart = now();
  for (const item of items) {
    results.push(step(item));
    if (now() - sliceStart >= budgetMs) {
      await yieldFn();
      sliceStart = now();
    }
  }
  return results;
}
