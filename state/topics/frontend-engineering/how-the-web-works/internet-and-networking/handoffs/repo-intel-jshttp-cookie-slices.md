# Slice plan — jshttp/cookie

Repository: https://github.com/jshttp/cookie
Clone: .cache/repos/jshttp__cookie
Commit: a437ef03993af559900010f62c294647589c29db (short: a437ef0)
License: MIT
Files tracked: 27

## Chosen slices

| Unit id | Module name | What it holds | Est. tokens | Why chosen | File list |
|---------|-------------|---------------|-------------|------------|-----------|
| jshttp-cookie-module-cookie-header | cookie-header | src/index.ts (name/value regexps, parseCookie, stringifyCookie, valueSlice, decode/encode helpers, lines 1-190 and 480-533) + parse-cookie and stringify-cookie specs | 6,851 | Cookie request header and the name/value rules | .cache/tmp/internet-and-networking/jshttp-cookie-module-cookie-header.files.txt |
| jshttp-cookie-module-set-cookie-serialize | set-cookie-serialize | src/index.ts (SetCookie type, stringifySetCookie, lines 192-398) + stringify-set-cookie spec | 6,533 | Attribute validation: Domain, Path, Max-Age, SameSite, Partitioned, Priority | .cache/tmp/internet-and-networking/jshttp-cookie-module-set-cookie-serialize.files.txt |
| jshttp-cookie-module-set-cookie-parse | set-cookie-parse | src/index.ts (parseSetCookie, lines 399-478) + parse-set-cookie spec | 6,521 | Reading Set-Cookie into attributes, lenient parsing | .cache/tmp/internet-and-networking/jshttp-cookie-module-set-cookie-parse.files.txt |
| jshttp-cookie-module-build-and-infra | build-and-infra | package.json, tsconfig*, CI/CodeQL/release/scorecards workflows, benchmarks, scripts/update-benchmark.ts, LICENSE | 5,355 | Technologies, CI, supply-chain checks, performance tests | .cache/tmp/internet-and-networking/jshttp-cookie-module-build-and-infra.files.txt |

## Skipped slices

- src/__snapshots__/*.snap — generated snapshot output (about 6,500 tokens); module workers may grep it for single cases.
- scripts/top-cookie.json, scripts/top-set-cookie.json — generated benchmark data from real sites.
- package-lock.json — generated lockfile.

## Notes for module workers

- Topic keywords to search for: SameSite, Secure, HttpOnly, Partitioned, Domain, Max-Age, Expires, Priority, encode, decode.
- Focus from the playbook: testing strategy (spec files), performance techniques (benchmarks, size limit), CI and release, type safety at boundaries (`tsconfig.json`).
- src/index.ts is shared by three slices: read only your line range.
