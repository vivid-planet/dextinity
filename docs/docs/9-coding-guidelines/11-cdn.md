---
title: CDN
sidebar_position: -5
---

The caching strategy must always be controlled by the origin (i.e., the application itself). **There must be no dependency on the default settings of the CDN.**

### Requirements

- All GET requests (Site and API) must explicitly set a Cache-Control header (see [Cache-Control header - HTTP | MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control)).
- Caching duration: The lifetime of assets should be chosen appropriately depending on the content (e.g., for static assets with [Cache Buster](https://www.keycdn.com/support/what-is-cache-busting): long validity with `immutable`; for API responses: short validity or `no-store`).
- Dextinity: Header setting is already ensured for all routes.

### Background

Proper control of cache lifetime not only improves loading speed but also affects SEO (see e.g., [Serve static assets with an efficient cache policy | Lighthouse | Chrome for Developers](https://developer.chrome.com/docs/lighthouse/performance/uses-long-cache-ttl?hl=de)).
