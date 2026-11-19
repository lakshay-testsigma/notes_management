// Serves the page and the fake API on http://localhost:3000
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { search } from "./src/fakeApi.js";

const root = fileURLToPath(new URL(".", import.meta.url));
const types = { ".html": "text/html", ".js": "text/javascript" };

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");

  if (url.pathname === "/api/search") {
    const data = await search(url.searchParams.get("q") ?? "");
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
    return;
  }

  const file = url.pathname === "/" ? "/public/index.html" : url.pathname;
  const path = join(root, normalize(file));
  const allowed = path.startsWith(join(root, "public")) || path.startsWith(join(root, "src"));
  try {
    if (!allowed) throw new Error("not allowed");
    res.setHeader("Content-Type", types[extname(path)] ?? "text/plain");
    res.end(await readFile(path));
  } catch {
    res.statusCode = 404;
    res.end("Not found");
  }
});

server.listen(3000, () => console.log("Open http://localhost:3000"));
