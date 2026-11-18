import { Resolver as NodeResolver } from "node:dns/promises";

// The only thing the inspector knows about DNS. Tests pass a stub that matches this shape,
// so no test touches the network.
export interface Resolver {
  resolve4(name: string): Promise<{ address: string; ttl: number }[]>;
  resolve6(name: string): Promise<{ address: string; ttl: number }[]>;
  resolveCname(name: string): Promise<string[]>;
  resolveCaa(name: string): Promise<{ critical: number; issue?: string; issuewild?: string; iodef?: string }[]>;
  // Optional: node:dns has no HTTPS (type 65) method, so the real resolver leaves it out.
  resolveHttps?(name: string): Promise<{ priority: number; target: string; params: string }[]>;
}

// The real resolver, backed by node:dns/promises and the system DNS servers.
export function createNodeResolver(): Resolver {
  const dns = new NodeResolver();
  return {
    resolve4: (name) => dns.resolve4(name, { ttl: true }),
    resolve6: (name) => dns.resolve6(name, { ttl: true }),
    resolveCname: (name) => dns.resolveCname(name),
    resolveCaa: (name) => dns.resolveCaa(name),
  };
}
