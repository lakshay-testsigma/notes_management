// Runs in the browser. Served by server.js at /app.js.
import { heavyStep, processInChunks } from "./work.js";

async function loadReviews() {
  const response = await fetch("/api/reviews");
  const reviews = await response.json();
  document.querySelector("#reviews").innerHTML = reviews
    .map((r) => `<li><b>${r.author}</b>: ${r.text}</li>`)
    .join("");
}

document.querySelector("#add").addEventListener("click", async () => {
  const status = document.querySelector("#status");
  status.textContent = "Adding...";
  const items = Array.from({ length: 10000 }, (_, i) => i);
  await processInChunks(items, heavyStep);
  status.textContent = "Added to cart";
});

loadReviews();
