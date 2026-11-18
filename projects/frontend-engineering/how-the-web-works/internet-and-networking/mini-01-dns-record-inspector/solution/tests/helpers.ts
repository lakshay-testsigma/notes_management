import type { Resolver } from "../src/resolver.ts";

export function dnsError(code: string): Error {
  return Object.assign(new Error(`query ${code}`), { code });
}

// A stub resolver: every method answers "no data" unless the test overrides it.
export function stubResolver(overrides: Partial<Resolver> = {}): Resolver {
  return {
    resolve4: async () => { throw dnsError("ENODATA"); },
    resolve6: async () => { throw dnsError("ENODATA"); },
    resolveCname: async () => { throw dnsError("ENODATA"); },
    resolveCaa: async () => { throw dnsError("ENODATA"); },
    ...overrides,
  };
}
