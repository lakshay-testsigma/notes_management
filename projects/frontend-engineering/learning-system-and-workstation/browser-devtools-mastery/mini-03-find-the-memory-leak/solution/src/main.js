import { createRouter } from "./router.js";
import { createHomeView, createReportView } from "./views.js";
import { cacheSize, countDetached } from "./cache.js";

const root = document.getElementById("app");
const stats = document.getElementById("stats");

createRouter({ doc: document, win: window, root, views: { home: createHomeView, report: createReportView } });

function showStats() {
  stats.textContent = ` cached nodes: ${cacheSize()}, detached: ${countDetached()}`;
}
window.addEventListener("hashchange", showStats);
showStats();

// Visits Report and Home five times, 100 ms apart, so a leak is easy to see in a snapshot.
document.getElementById("churn").addEventListener("click", () => {
  let step = 0;
  const timer = setInterval(() => {
    location.hash = step % 2 === 0 ? "#/report" : "#/home";
    step += 1;
    if (step >= 10) clearInterval(timer);
  }, 100);
});
