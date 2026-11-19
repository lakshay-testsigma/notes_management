// Connects the page to createSearchBox. Not the lesson: it is complete.
import { createSearchBox } from "/src/searchBox.js";

const box = document.querySelector("#box");
const shown = document.querySelector("#shown");
const list = document.querySelector("#results");

async function search(query, { signal }) {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal });
  return response.json();
}

function render({ query, results }) {
  shown.textContent = `Showing results for: ${query}`;
  list.replaceChildren(
    ...results.map((word) => Object.assign(document.createElement("li"), { textContent: word })),
  );
}

const searchBox = createSearchBox({ search, render });
box.addEventListener("input", () => searchBox.onInput(box.value));
