import type { Resolver } from "./resolver.ts";

function notFound(): Error {
  return Object.assign(new Error("queryA ENODATA"), { code: "ENODATA" });
}

// An offline resolver for `npm run demo`: a site with a long TTL, no IPv6 and a CAA that blocks the new host's CA.
export const demoResolver: Resolver = {
  resolve4: async () => [{ address: "203.0.113.10", ttl: 3600 }],
  resolve6: async () => {
    throw notFound();
  },
  resolveCname: async () => {
    throw notFound();
  },
  resolveCaa: async () => [{ critical: 0, issue: "digicert.com" }],
  resolveHttps: async () => [{ priority: 1, target: ".", params: "alpn=h2,h3" }],
};
