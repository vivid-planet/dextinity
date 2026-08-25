---
"@dextinity/cms-api": patch
---

Look up content scopes by key instead of scanning them with `isEqual`

Resolving the available and the allowed content scopes scanned the full scope list with `lodash.isequal` per scope, which is quadratic in the number of available scopes. Every request pays it, because the guard builds the `CurrentUser`: with 2000 available scopes that was about 1.3 seconds of CPU per request, with 4000 about five. Projects reach those numbers when a scope dimension holds one value per entity, e.g. a dealer.
