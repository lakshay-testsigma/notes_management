// Plain data shapes. No behaviour and no imports from other layers.

export type Severity = "error" | "warning";
// "unknown" means the data could not be read. It is never treated as a pass.
export type Verdict = "problem" | "unknown";

export interface Finding {
  check: string;
  rule: string;
  severity: Severity;
  verdict: Verdict;
  subject: string;
  message: string;
}

export interface DnsRecord {
  type: string;
  name: string;
  ttl: number;
  value: string;
}

export interface DnsAnswers {
  host: string;
  records: DnsRecord[];
}

export interface TlsInfo {
  host: string;
  protocol: string;
  notBefore: string;
  notAfter: string;
  subjectAltNames: string[];
}

export interface Header {
  name: string; // always lower case
  value: string;
}

export interface HttpEntry {
  method: string;
  url: string;
  status: number;
  httpVersion: string;
  mimeType: string;
  decodedSize: number;
  headers: Header[];
}

export interface SiteData {
  dns: DnsAnswers;
  tls: TlsInfo;
  entries: HttpEntry[];
  client: string; // the tool that produced the HAR file
}

export interface Policy {
  host: string;
  dns: { minTtl: number; maxTtl: number; requireCaa: boolean; requireAaaa: boolean };
  tls: { minProtocol: string; minDaysToExpiry: number; hstsMinMaxAge: number };
  http: { minVersion: string };
  caching: { hashedAssetPattern: string; hashedAssetMinMaxAge: number; htmlMaxAge: number };
  compression: { minBytes: number };
  cookies: { allowNoHttpOnly: string[] };
}
