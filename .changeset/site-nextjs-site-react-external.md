---
"@dextinity/site-nextjs": major
---

Stop bundling `@dextinity/site-react` into `@dextinity/site-nextjs`

`@dextinity/site-nextjs` now imports `@dextinity/site-react` at runtime instead of shipping its own copy.
This fixes "Module not found" errors for `@dextinity/site-react`'s dependencies (e.g., `scroll-into-view-if-needed`) and prevents duplicate React contexts when a project imports from both packages.
The styles of `@dextinity/site-react` are still included in `@dextinity/site-nextjs/css`.

**Breaking change:** Importing from `@dextinity/site-nextjs` in a middleware running in the Edge runtime fails to build with errors like `'useContext' is not exported from 'react'`, also when using `optimizePackageImports`.
Run the middleware in the Node.js runtime instead, for instance by using `proxy.ts` in Next.js 16.
