// Tiny static file server: no dependencies, serves public/ and src/ on port 4173.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const path = url.pathname === "/" ? "/public/index.html" : url.pathname;
  const file = normalize(join(root, path));
  // Only files inside public/ and src/ are served.
  if (!file.startsWith(join(root, "public")) && !file.startsWith(join(root, "src"))) {
    res.writeHead(404).end("Not found");
    return;
  }
  try {
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": types[extname(file)] ?? "text/plain" }).end(body);
  } catch {
    res.writeHead(404).end("Not found");
  }
});

server.listen(4173, () => console.log("Open http://localhost:4173"));
