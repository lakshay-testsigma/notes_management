import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { ChromeLaunchError } from "../domain/errors.js";

// Starts one headless Chrome with a throwaway profile and finds its DevTools address.
export class ChromeLauncher {
  constructor({ chromePath, spawnProcess = spawn, startupTimeoutMs = 15000 }) {
    this.chromePath = chromePath;
    this.spawnProcess = spawnProcess;
    this.startupTimeoutMs = startupTimeoutMs;
  }

  // Chrome prints "DevTools listening on ws://..." on stderr when it is ready.
  static parseEndpoint(text) {
    return text.match(/DevTools listening on (ws:\/\/\S+)/)?.[1] ?? null;
  }

  async launch() {
    const profile = await mkdtemp(path.join(os.tmpdir(), "page-health-"));
    const args = ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`,
      "--no-first-run", "--no-default-browser-check", "--disable-extensions", "about:blank"];
    const child = this.spawnProcess(this.chromePath, args, { stdio: ["ignore", "ignore", "pipe"] });
    const cleanup = async () => {
      child.kill();
      await rm(profile, { recursive: true, force: true });
    };
    try {
      const endpoint = await this.#waitForEndpoint(child);
      return { endpoint, close: cleanup };
    } catch (error) {
      await cleanup();
      throw error;
    }
  }

  #waitForEndpoint(child) {
    return new Promise((resolve, reject) => {
      let seen = "";
      const timer = setTimeout(() => reject(new ChromeLaunchError(`Chrome did not report a DevTools address in ${this.startupTimeoutMs} ms`)), this.startupTimeoutMs);
      child.on("error", (e) => {
        clearTimeout(timer);
        reject(new ChromeLaunchError(`Cannot start ${this.chromePath}: ${e.message}. Set CHROME_PATH.`));
      });
      child.on("exit", (code) => {
        clearTimeout(timer);
        reject(new ChromeLaunchError(`Chrome exited early with code ${code}`));
      });
      child.stderr.on("data", (chunk) => {
        seen += chunk.toString();
        const endpoint = ChromeLauncher.parseEndpoint(seen);
        if (endpoint) {
          clearTimeout(timer);
          resolve(endpoint);
        }
      });
    });
  }
}
