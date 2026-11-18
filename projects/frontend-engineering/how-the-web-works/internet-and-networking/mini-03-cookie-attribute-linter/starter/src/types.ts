export type SameSite = "Strict" | "Lax" | "None";

export interface CookieAttributes {
  secure: boolean;
  httpOnly: boolean;
  partitioned: boolean;
  sameSite?: SameSite;
  path?: string;
  domain?: string;
  maxAge?: number;
  expires?: string;
}

export interface ParsedCookie {
  name: string;
  value: string;
  attributes: CookieAttributes;
  // Pieces the parser could not use: a bad Max-Age, an unknown SameSite, an unknown attribute.
  ignored: string[];
}

export type Severity = "error" | "warning";

export interface Finding {
  rule: string;
  severity: Severity;
  cookie: string;
  message: string;
}

export interface LintResult {
  cookies: ParsedCookie[];
  findings: Finding[];
}
