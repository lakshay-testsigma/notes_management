import type { DnsRecord, RecordSet, RecordType, Report } from "./types.ts";
import { RECORD_TYPES } from "./types.ts";
import type { Resolver } from "./resolver.ts";

// These error codes mean "the name exists but has no record of this type", which is normal.
const EMPTY_CODES = new Set(["ENODATA", "ENOTFOUND"]);

// Ask the resolver for one record type and turn the answer into a RecordSet.
export async function queryType(name: string, type: RecordType, resolver: Resolver): Promise<RecordSet> {
  try {
    let records: DnsRecord[];
    if (type === "A" || type === "AAAA") {
      const answers = type === "A" ? await resolver.resolve4(name) : await resolver.resolve6(name);
      records = answers.map((a) => ({ value: a.address, ttl: a.ttl }));
    } else if (type === "CNAME") {
      // node:dns returns CNAME targets without a TTL, so ttl stays null.
      records = (await resolver.resolveCname(name)).map((target) => ({ value: target, ttl: null }));
    } else if (type === "CAA") {
      records = (await resolver.resolveCaa(name)).map((c) => {
        const tag = c.issue !== undefined ? "issue" : c.issuewild !== undefined ? "issuewild" : "iodef";
        return { value: `${tag} ${c.issue ?? c.issuewild ?? c.iodef ?? ""}`, ttl: null };
      });
    } else {
      if (!resolver.resolveHttps) {
        return { type, status: "unsupported", records: [], message: "this resolver cannot query HTTPS records" };
      }
      const answers = await resolver.resolveHttps(name);
      records = answers.map((h) => ({ value: `${h.priority} ${h.target} ${h.params}`.trim(), ttl: null }));
    }
    return { type, status: records.length > 0 ? "ok" : "empty", records };
  } catch (error) {
    const code = (error as { code?: string }).code ?? "";
    if (EMPTY_CODES.has(code)) return { type, status: "empty", records: [] };
    return { type, status: "error", records: [], message: (error as Error).message };
  }
}

// Query all five types at the same time. One failed type must not hide the others.
export async function inspectDomain(name: string, resolver: Resolver): Promise<Report> {
  const sets = await Promise.all(RECORD_TYPES.map((type) => queryType(name, type, resolver)));
  const bySet = Object.fromEntries(sets.map((s) => [s.type, s])) as Report["sets"];
  return { name, sets: bySet };
}
