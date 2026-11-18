// Shared shapes. Nothing to implement here.

export type RecordType = "A" | "AAAA" | "CNAME" | "CAA" | "HTTPS";

export const RECORD_TYPES: RecordType[] = ["A", "AAAA", "CNAME", "CAA", "HTTPS"];

// One answer line. `ttl` is null when the resolver cannot report it (node:dns gives no CNAME TTL).
export interface DnsRecord {
  value: string;
  ttl: number | null;
}

// "ok" = records found, "empty" = the name has none of this type,
// "error" = the lookup failed, "unsupported" = this resolver cannot ask for the type.
export interface RecordSet {
  type: RecordType;
  status: "ok" | "empty" | "error" | "unsupported";
  records: DnsRecord[];
  message?: string;
}

export interface Report {
  name: string;
  sets: Record<RecordType, RecordSet>;
}

export interface Finding {
  level: "error" | "warn" | "info";
  type: RecordType | "ALL";
  message: string;
}
