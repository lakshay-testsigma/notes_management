// A Cache-Control header read once into a value object.
// Parsing never throws: a bad directive goes into `errors` (see ADR 0002).

export class CacheControl {
  readonly directives: Map<string, string | null>;
  readonly errors: string[];

  constructor(directives: Map<string, string | null>, errors: string[]) {
    this.directives = directives;
    this.errors = errors;
  }

  static parse(header: string): CacheControl {
    const directives = new Map<string, string | null>();
    const errors: string[] = [];
    for (const part of header.split(",")) {
      const token = part.trim();
      if (token === "") continue;
      const eq = token.indexOf("=");
      const name = (eq === -1 ? token : token.slice(0, eq)).trim().toLowerCase();
      const value = eq === -1 ? null : token.slice(eq + 1).trim().replace(/^"|"$/g, "");
      if ((name === "max-age" || name === "s-maxage") && (value === null || !/^\d+$/.test(value))) {
        errors.push(`${name} is not a whole number`);
        continue;
      }
      directives.set(name, value);
    }
    if (directives.size === 0 && errors.length === 0) errors.push("header is empty");
    return new CacheControl(directives, errors);
  }

  get isReadable(): boolean {
    return this.errors.length === 0;
  }

  has(name: string): boolean {
    return this.directives.has(name);
  }

  seconds(name: string): number | null {
    const value = this.directives.get(name);
    return value === undefined || value === null ? null : Number(value);
  }
}
