// The search box logic. It has no DOM code, so Node can test it.
// `search(query, { signal })` returns a promise of { query, results }.
// `render(response)` shows a response on the page.
export function createSearchBox({ search, render }) {
  let latestId = 0; // id of the newest request
  let controller = null; // lets us cancel the previous request

  async function onInput(query) {
    // Task 1: give each request a number. The newest request has the highest.
    const id = ++latestId;

    // Task 3: cancel the previous request before starting a new one.
    controller?.abort();
    controller = new AbortController();

    try {
      const response = await search(query, { signal: controller.signal });
      // Task 2: a slow, old response must not overwrite a newer one.
      if (id !== latestId) return;
      render(response);
    } catch (error) {
      if (error.name === "AbortError") return; // we cancelled it on purpose
      throw error;
    }
  }

  return { onInput };
}
