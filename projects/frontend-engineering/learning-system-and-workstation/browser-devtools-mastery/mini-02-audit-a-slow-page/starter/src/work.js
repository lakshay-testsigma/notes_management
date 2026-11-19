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

// TODO(4): Run step(item) for every item, but give control back to the main
// thread whenever a slice of work has used up `budgetMs` (default 40, under the
// 50 ms long-task line). Collect the results in an array and return it.
// The options now() and yieldFn() exist so the test can fake time.
// Today the loop below is one long task of about 400 ms or more.
export async function processInChunks(items, step, options = {}) {
  const results = [];
  for (const item of items) results.push(step(item));
  return results;
}
