---
"@comet/cms-admin": patch
---

Update `axios` to `^0.33.0` to fix known security vulnerabilities

The previously used `axios@^0.21.0` is affected by multiple published advisories (among them SSRF and credential leakage via absolute URLs, `Proxy-Authorization` leakage across redirects, prototype-pollution gadgets and several denial-of-service issues). Version `0.33.0` of the maintained 0.x line contains the fixes for all of them while keeping the API compatible, so no changes are required in projects using Comet.
