import { cacheNode, clearCache } from "./cache.js";

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
      // Fix 1: take the listener off the window, so the window stops holding onResize.
      win.removeEventListener("resize", onResize);
      // Fix 2: empty the cache and drop our own references.
      clearCache();
      rows = [];
      header = null;
    },
  };
}
