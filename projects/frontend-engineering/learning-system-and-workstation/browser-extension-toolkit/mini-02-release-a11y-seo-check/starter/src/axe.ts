import axe from "axe-core";
import { JSDOM, VirtualConsole } from "jsdom"; // you will need both in TODO(3)
import type { Finding, Outcome } from "./types.js";

// TODO(3): Run axe on `html` inside jsdom and return its results, including
//   the incomplete list. There is no real browser here.
export async function runAxe(html: string): Promise<axe.AxeResults> {
  throw new Error("TODO(3): runAxe is not implemented yet");
}

// TODO(4): Turn axe results into Findings. Keep violations, passes and incomplete.
export function toFindings(page: string, results: axe.AxeResults): Finding[] {
  throw new Error("TODO(4): toFindings is not implemented yet");
}
