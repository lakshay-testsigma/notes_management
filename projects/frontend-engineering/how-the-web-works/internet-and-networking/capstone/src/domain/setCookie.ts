// A Set-Cookie header read leniently. Problems are listed in `issues`, never thrown (see ADR 0002).

const SAME_SITE_VALUES = ["strict", "lax", "none"];

export class SetCookie {
  readonly name: string;
  readonly value: string;
  readonly attributes: Map<string, string | null>;
  readonly issues: string[];
  readonly sizeBytes: number;

  constructor(name: string, value: string, attributes: Map<string, string | null>, issues: string[], sizeBytes: number) {
    this.name = name;
    this.value = value;
    this.attributes = attributes;
    this.issues = issues;
    this.sizeBytes = sizeBytes;
  }

  static parse(header: string): SetCookie {
    const parts = header.split(";");
    const first = parts[0] ?? "";
    const issues: string[] = [];
    const eq = first.indexOf("=");
    const name = eq === -1 ? "" : first.slice(0, eq).trim();
    const value = eq === -1 ? "" : first.slice(eq + 1).trim();
    if (eq === -1 || name === "") issues.push("the cookie has no name=value pair");
    const attributes = new Map<string, string | null>();
    for (const part of parts.slice(1)) {
      const at = part.indexOf("=");
      const key = (at === -1 ? part : part.slice(0, at)).trim().toLowerCase();
      if (key === "") continue;
      attributes.set(key, at === -1 ? null : part.slice(at + 1).trim());
    }
    const maxAge = attributes.get("max-age");
    if (maxAge !== undefined && (maxAge === null || !/^-?\d+$/.test(maxAge))) issues.push("Max-Age is not an integer");
    const expires = attributes.get("expires");
    if (expires !== undefined && (expires === null || Number.isNaN(Date.parse(expires)))) issues.push("Expires is not a date");
    const sameSite = attributes.get("samesite");
    if (sameSite !== undefined && (sameSite === null || !SAME_SITE_VALUES.includes(sameSite.toLowerCase()))) {
      issues.push("SameSite is not Strict, Lax or None");
    }
    return new SetCookie(name, value, attributes, issues, new TextEncoder().encode(name + value).length);
  }

  has(attribute: string): boolean {
    return this.attributes.has(attribute);
  }

  get sameSite(): string | null {
    const raw = this.attributes.get("samesite");
    return raw ? raw.toLowerCase() : null;
  }
}
