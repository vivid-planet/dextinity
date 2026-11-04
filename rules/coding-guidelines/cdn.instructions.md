---
description: Cache-Control header policy for GET routes (Site and API)
applyTo: "**/api/**/*.controller.ts,**/api/**/*.resolver.ts,**/site/**/route.ts,**/site/**/next.config.js,**/site/**/next.config.ts,**/site/**/next.config.mjs"
paths:
    - "**/api/**/*.controller.ts"
    - "**/api/**/*.resolver.ts"
    - "**/site/**/route.ts"
    - "**/site/**/next.config.{js,ts,mjs}"
globs:
    - "**/api/**/*.controller.ts"
    - "**/api/**/*.resolver.ts"
    - "**/site/**/route.ts"
    - "**/site/**/next.config.{js,ts,mjs}"
alwaysApply: false
---

# CDN / Caching Rules

- Cache behavior is **controlled by the origin**. Never rely on CDN defaults.
- Every GET response (Site and API) must set an explicit `Cache-Control` header.
- Pick the TTL deliberately for the content:
    - Static assets with cache-busting hashes → long TTL with `immutable`.
    - API responses → short TTL, or `no-store` when the response is per-user / sensitive.
- In Dextinity, all built-in routes already set `Cache-Control` — if you add a custom route/handler, you are responsible for setting it too.
