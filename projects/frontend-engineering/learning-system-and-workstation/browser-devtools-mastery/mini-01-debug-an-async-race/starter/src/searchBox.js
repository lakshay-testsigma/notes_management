// The search box logic. It has no DOM code, so Node can test it.
// `search(query, { signal })` returns a promise of { query, results }.
// `render(response)` shows a response on the page.
//
// This starter has the bug on purpose: every response is drawn, even a late one.
// Reproduce it in DevTools first (README), then fix it with the TODOs.
export function createSearchBox({ search, render }) {
  let latestId = 0; // id of the newest request
  let controller = null; // lets us cancel the previous request

  async function onInput(query) {
    // TODO(1): Give each request a number.
    //   1. Add one to `latestId` and keep the new value in `const id`.

    // TODO(3): Cancel the previous request before starting a new one.
    //   1. Call `controller?.abort()`.
    //   2. Set `controller = new AbortController()`.
    //   3. Pass `{ signal: controller.signal }` to `search` below.

    try {
      const response = await search(query, {});
      // TODO(2): Skip a response that is not from the newest request.
      //   1. If `id` is not equal to `latestId`, return before `render`.
      render(response);
    } catch (error) {
      // TODO(3): If `error.name` is "AbortError", return. Otherwise throw it.
      throw error;
    }
  }

  return { onInput };
}
