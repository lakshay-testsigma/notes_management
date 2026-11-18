import { readFileSync } from "node:fs";
import { decodeMappings } from "./mappings.ts";
import type { SourceMap } from "./lookup.ts";
import { formatStack, resolveStack } from "./stack.ts";

// Usage: npm start -- [stack-file] [source-map-file]
const stackPath = process.argv[2] ?? "sample/stack.txt";
const mapPath = process.argv[3] ?? "sample/app.min.js.map";

const stackText = readFileSync(stackPath, "utf8");
const map = JSON.parse(readFileSync(mapPath, "utf8")) as SourceMap;
if (map.version !== 3) throw new Error(`Unsupported source map version: ${map.version}`);

const bundleName = map.file ?? "app.min.js";
const frames = resolveStack(stackText, bundleName, map, decodeMappings(map.mappings));

console.log(stackText.split("\n")[0]); // the error message line
console.log(formatStack(frames));
