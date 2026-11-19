import { cacheNode } from "./cache.js";

const ROW_COUNT = 200;

export function createHomeView({ doc }) {
  return {
    mount(root) {
      const title = doc.createElement("h1");
      title.textContent = "Home";
      root.append(title);
    },
    unmount() {},
  };
}

export function createReportView({ doc, win }) {
  let header = null;
  let rows = [];

  // This closure keeps header and rows alive for as long as the window holds it.
  function onResize() {
    header.textContent = `${rows.length} rows, window width ${win.innerWidth}`;
  }

  return {
    mount(root) {
      const section = doc.createElement("section");
      header = doc.createElement("h1");
      section.append(header);
      for (let i = 0; i < ROW_COUNT; i += 1) {
        const row = doc.createElement("div");
        row.textContent = `Row ${i}`;
        rows.push(cacheNode(row)); // The cache is the second thing that holds the rows.
        section.append(row);
      }
      win.addEventListener("resize", onResize);
      onResize();
      root.append(section);
    },
    unmount() {
      // TODO(3): This view leaks a window listener. Find it with the Retainers pane, then remove it here.
      // TODO(4): This view leaks cached nodes. Make unmount release them, and drop what the view holds.
      // Today unmount does nothing, and that is the bug.
    },
  };
}
