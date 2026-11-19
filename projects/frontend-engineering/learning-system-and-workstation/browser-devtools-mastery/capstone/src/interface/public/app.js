// The dashboard builds the report with textContent only. Page data is untrusted,
// so it is never inserted as HTML.
const form = document.getElementById("form");
const statusLine = document.getElementById("status");
const reportBox = document.getElementById("report");

function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function sectionFor(title, section, render) {
  const box = el("section");
  box.append(el("h2", title));
  if (section.status !== "ok") box.append(el("p", `Could not measure: ${section.reason}`, "unavailable"));
  else render(box, section.data);
  return box;
}

function table(headers, rows) {
  const t = el("table");
  const head = el("tr");
  headers.forEach((h) => head.append(el("th", h)));
  t.append(head);
  rows.forEach((row) => {
    const tr = el("tr");
    row.forEach((cell) => tr.append(el("td", cell === null || cell === undefined ? "n/a" : String(cell))));
    t.append(tr);
  });
  return t;
}

function metric(box, label, value, rating) {
  const p = el("p", `${label}: `);
  p.append(el("span", `${value} (${rating})`, rating));
  box.append(p);
}

function renderReport(report) {
  reportBox.replaceChildren();
  reportBox.append(el("p", `${report.url} - load outcome: ${report.loadOutcome}`));

  reportBox.append(sectionFor("Network timing (ms)", report.network, (box, data) => {
    box.append(el("p", `${data.totals.count} requests, ${data.totals.failed} failed, ${data.totals.incomplete} incomplete, ${data.totals.redirects} redirects`));
    box.append(table(["URL", "Status", "DNS", "Connect", "TLS", "Wait", "Download"],
      data.requests.map((r) => [r.url, r.status, r.phases.dns, r.phases.connect, r.phases.tls, r.phases.wait, r.phases.download])));
  }));

  const vitals = el("section");
  vitals.append(el("h2", "Core Web Vitals"));
  const { lcp, cls, longTasks } = report.vitals;
  [["LCP", lcp, (d) => [`${d.ms} ms`, d.rating]], ["CLS", cls, (d) => [d.value, d.rating]],
    ["Total blocking time", longTasks, (d) => [`${d.totalBlockingMs} ms across ${d.count} long tasks`, d.rating]]].forEach(([name, s, fmt]) => {
    if (s.status === "ok") metric(vitals, name, ...fmt(s.data));
    else vitals.append(el("p", `${name}: could not measure (${s.reason})`, "unavailable"));
  });
  reportBox.append(vitals);

  reportBox.append(sectionFor("Console errors", report.console, (box, data) => {
    if (data.total === 0) box.append(el("p", "No console errors."));
    else box.append(table(["Kind", "Message", "Count"], data.errors.map((e) => [e.kind, e.message, e.count])));
  }));

  reportBox.append(sectionFor("Heap growth", report.heap, (box, d) => {
    box.append(el("p", `${d.beforeBytes} to ${d.afterBytes} bytes: ${d.deltaBytes >= 0 ? "+" : ""}${d.deltaBytes} bytes (${d.deltaPercent ?? "n/a"}%)`));
  }));
  if (report.captureFile) reportBox.append(el("p", `Raw capture saved as ${report.captureFile}`));
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusLine.textContent = "Inspecting... this takes up to half a minute.";
  statusLine.className = "";
  reportBox.replaceChildren();
  try {
    const response = await fetch("/api/inspect", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: document.getElementById("url").value }),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error?.message ?? "Request failed");
    statusLine.textContent = "Done.";
    renderReport(body);
  } catch (error) {
    statusLine.textContent = `Error: ${error.message}`;
    statusLine.className = "error";
  }
});
