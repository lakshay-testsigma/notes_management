import { readFileSync } from "node:fs";

export function loadCapture() {
  return JSON.parse(readFileSync(new URL("./capture-sample.json", import.meta.url), "utf8"));
}
