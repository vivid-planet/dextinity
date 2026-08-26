---
title: CDN
---

Dextinity can be run behind a CDN. This is useful to improve the performance of the application and to reduce the load on the server. No additional configuration is required as all GET requests set the `Cache-Control` header appropriately. Dextinity is tested with CloudFront and Cloudflare.

## CDN Guard

The application can be protected against direct access to the API and Site.

### API

A `CdnGuard` is available to make sure the application is only accessed through the CDN. See https://github.com/vivid-planet/dextinity-starter/blob/main/api/src/main.ts for reference.

```ts title="api/main.ts"
// if CDN is enabled, make sure all traffic is either coming from the CDN or internal sources
if (config.cdn.originCheckSecret) {
    app.useGlobalGuards(
        new CdnGuard({
            headerName: "x-cdn-origin-check",
            headerValue: config.cdn.originCheckSecret,
        }),
    );
}
```

### Site

The Site can be protected against direct access to the Site. See https://github.com/vivid-planet/dextinity-starter/blob/main/site/server.ts for reference.

```ts title="site/server.ts"
if (cdnOriginCheckSecret) {
    if (req.headers["x-cdn-origin-check"] !== cdnOriginCheckSecret) {
        res.statusCode = 403;
        res.end();
        return;
    }
}
```
