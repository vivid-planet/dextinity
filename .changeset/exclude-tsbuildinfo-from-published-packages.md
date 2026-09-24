---
"@dextinity/cms-api": patch
"@dextinity/brevo-api": patch
---

Exclude the TypeScript build cache from the published packages

The published tarballs contained the `.tsbuildinfo` files that TypeScript writes next to the build output for incremental builds — 1.3 MB of build cache in `@dextinity/cms-api` alone, which has no use outside the repository.
