import type { RecordSet, RecordType, Report } from "./types.ts";
import type { Resolver } from "./resolver.ts";

// These error codes mean "the name exists but has no record of this type", which is normal.
// Use this set in TODO(1).
export const EMPTY_CODES = new Set(["ENODATA", "ENOTFOUND"]);

// TODO(1): Ask the resolver for one record type and turn the answer into a RecordSet.
//   1. For "A" and "AAAA", call resolver.resolve4 or resolver.resolve6. Map each answer
//      { address, ttl } to a DnsRecord { value: address, ttl }.
//   2. For "CNAME", call resolver.resolveCname. Each target becomes { value: target, ttl: null }
//      (node:dns gives no CNAME TTL).
//   3. For "CAA", call resolver.resolveCaa. Write each record as "issue <ca>", "issuewild <ca>"
//      or "iodef <url>", with ttl null.
//   4. For "HTTPS", return status "unsupported" when resolver.resolveHttps is undefined.
//      Otherwise write each answer as "<priority> <target> <params>", ttl null.
//   5. Return status "ok" when there are records and "empty" when there are none.
//   6. Wrap the lookup in try/catch. A thrown error whose `code` is in EMPTY_CODES gives
//      status "empty". Any other error gives status "error" with `message` set.
export async function queryType(name: string, type: RecordType, resolver: Resolver): Promise<RecordSet> {
  throw new Error("TODO(1): queryType is not implemented yet");
}

// TODO(2): Query all five types at the same time and return { name, sets }.
//   1. Use Promise.all over RECORD_TYPES (from ./types.ts) and call queryType for each.
//   2. Build `sets` as an object keyed by type, for example { A: ..., AAAA: ..., ... }.
//   queryType never throws, so one failed type cannot hide the others.
export async function inspectDomain(name: string, resolver: Resolver): Promise<Report> {
  throw new Error("TODO(2): inspectDomain is not implemented yet");
}
