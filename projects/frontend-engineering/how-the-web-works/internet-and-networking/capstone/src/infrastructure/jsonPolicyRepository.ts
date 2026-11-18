import { PolicyError } from "../domain/errors.ts";
import type { PolicyRepository } from "../domain/ports.ts";
import type { Policy } from "../domain/types.ts";
import { asArray, asBoolean, asNumber, asObject, asString } from "./fields.ts";
import { readJsonFile } from "./jsonFile.ts";

const fail = (message: string) => new PolicyError(message);

// Policy is checked at startup. A wrong policy stops the run before any check.
export class JsonPolicyRepository implements PolicyRepository {
  private readonly path: string;

  constructor(path: string) {
    this.path = path;
  }

  load(): Policy {
    const doc = asObject(readJsonFile(this.path, fail), "policy", fail);
    const dns = asObject(doc.dns, "policy.dns", fail);
    const tls = asObject(doc.tls, "policy.tls", fail);
    const http = asObject(doc.http, "policy.http", fail);
    const caching = asObject(doc.caching, "policy.caching", fail);
    const compression = asObject(doc.compression, "policy.compression", fail);
    const cookies = asObject(doc.cookies, "policy.cookies", fail);
    const pattern = asString(caching.hashedAssetPattern, "policy.caching.hashedAssetPattern", fail);
    try {
      new RegExp(pattern);
    } catch {
      throw fail("policy.caching.hashedAssetPattern is not a valid regular expression");
    }
    return {
      host: asString(doc.host, "policy.host", fail),
      dns: {
        minTtl: asNumber(dns.minTtl, "policy.dns.minTtl", fail),
        maxTtl: asNumber(dns.maxTtl, "policy.dns.maxTtl", fail),
        requireCaa: asBoolean(dns.requireCaa, "policy.dns.requireCaa", fail),
        requireAaaa: asBoolean(dns.requireAaaa, "policy.dns.requireAaaa", fail),
      },
      tls: {
        minProtocol: asString(tls.minProtocol, "policy.tls.minProtocol", fail),
        minDaysToExpiry: asNumber(tls.minDaysToExpiry, "policy.tls.minDaysToExpiry", fail),
        hstsMinMaxAge: asNumber(tls.hstsMinMaxAge, "policy.tls.hstsMinMaxAge", fail),
      },
      http: { minVersion: asString(http.minVersion, "policy.http.minVersion", fail) },
      caching: {
        hashedAssetPattern: pattern,
        hashedAssetMinMaxAge: asNumber(caching.hashedAssetMinMaxAge, "policy.caching.hashedAssetMinMaxAge", fail),
        htmlMaxAge: asNumber(caching.htmlMaxAge, "policy.caching.htmlMaxAge", fail),
      },
      compression: { minBytes: asNumber(compression.minBytes, "policy.compression.minBytes", fail) },
      cookies: { allowNoHttpOnly: asArray(cookies.allowNoHttpOnly, "policy.cookies.allowNoHttpOnly", fail).map((n) => asString(n, "cookie name", fail)) },
    };
  }
}
