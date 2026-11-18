import { problem, unknown } from "../finding.ts";
import { firstHeader } from "../headers.ts";
import type { Check, CheckContext } from "../ports.ts";
import type { Finding, HttpEntry } from "../types.ts";

const KNOWN_CODINGS = ["gzip", "br", "zstd", "deflate", "identity"];

function isCompressible(mime: string): boolean {
  const m = mime.toLowerCase();
  return m.startsWith("text/") || m.includes("json") || m.includes("javascript") || m.includes("xml");
}

export class CompressionCheck implements Check {
  readonly name = "compression";

  run({ site, policy }: CheckContext): Finding[] {
    const findings: Finding[] = [];
    for (const entry of site.entries) {
      if (entry.method !== "GET" || entry.status === 204 || entry.status === 304) continue;
      const coding = firstHeader(entry, "content-encoding");
      if (coding === undefined) {
        if (isCompressible(entry.mimeType) && entry.decodedSize >= policy.compression.minBytes) {
          findings.push(problem(this.name, "compression.missing", "warning", entry.url, `${entry.decodedSize} bytes of ${entry.mimeType} sent with no Content-Encoding.`));
        }
        continue;
      }
      findings.push(...this.checkCodings(entry, coding));
    }
    return findings;
  }

  private checkCodings(entry: HttpEntry, header: string): Finding[] {
    const codings = header.split(",").map((c) => c.trim().toLowerCase()).filter(Boolean);
    const findings: Finding[] = [];
    if (codings.length > 1) {
      findings.push(problem(this.name, "compression.stacked", "warning", entry.url, `Stacked codings "${header}". Clients may not decode them.`));
    }
    for (const coding of codings) {
      if (coding === "compress") {
        findings.push(problem(this.name, "compression.compress", "warning", entry.url, "The legacy compress coding is not supported by browsers."));
      } else if (!KNOWN_CODINGS.includes(coding)) {
        findings.push(unknown(this.name, "compression.unknown-coding", entry.url, `Unknown Content-Encoding "${coding}".`));
      }
    }
    return findings;
  }
}
