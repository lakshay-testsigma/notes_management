import { join } from "node:path";
import { InputError } from "../domain/errors.ts";
import type { SiteDataSource } from "../domain/ports.ts";
import type { DnsAnswers, SiteData, TlsInfo } from "../domain/types.ts";
import { asArray, asNumber, asObject, asString } from "./fields.ts";
import { HarReader } from "./harReader.ts";
import { readJsonFile } from "./jsonFile.ts";

const fail = (message: string) => new InputError(message);

// Reads dns.json, tls.json and site.har from one folder. Each file is read once.
export class FileSiteDataSource implements SiteDataSource {
  private readonly dir: string;
  private readonly har: HarReader;

  constructor(dir: string, har: HarReader) {
    this.dir = dir;
    this.har = har;
  }

  load(): SiteData {
    const dns = this.readDns(readJsonFile(join(this.dir, "dns.json")));
    const tls = this.readTls(readJsonFile(join(this.dir, "tls.json")));
    const { client, entries } = this.har.read(readJsonFile(join(this.dir, "site.har")));
    return { dns, tls, entries, client };
  }

  private readDns(raw: unknown): DnsAnswers {
    const doc = asObject(raw, "dns.json", fail);
    const records = asArray(doc.records, "dns.json records", fail).map((r, i) => {
      const rec = asObject(r, `dns.json records[${i}]`, fail);
      return {
        type: asString(rec.type, "record type", fail).toUpperCase(),
        name: asString(rec.name, "record name", fail).toLowerCase(),
        ttl: asNumber(rec.ttl, "record ttl", fail),
        value: asString(rec.value, "record value", fail),
      };
    });
    return { host: asString(doc.host, "dns.json host", fail), records };
  }

  private readTls(raw: unknown): TlsInfo {
    const doc = asObject(raw, "tls.json", fail);
    return {
      host: asString(doc.host, "tls.json host", fail),
      protocol: asString(doc.protocol, "tls.json protocol", fail),
      notBefore: asString(doc.notBefore, "tls.json notBefore", fail),
      notAfter: asString(doc.notAfter, "tls.json notAfter", fail),
      subjectAltNames: asArray(doc.subjectAltNames, "tls.json subjectAltNames", fail).map((n) => asString(n, "subject name", fail)),
    };
  }
}
