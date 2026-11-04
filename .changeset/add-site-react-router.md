---
"@dextinity/site-react-router": minor
---

Add `@dextinity/site-react-router`

The counterpart to `@dextinity/site-nextjs` and `@dextinity/site-vite-rsc` for sites built with React Router's RSC Framework Mode (React Router 8, `unstable_reactRouterRSC` and `@vitejs/plugin-rsc`). Pages are React Server Components: loaders decide the status, redirects and metadata of a page, its `ServerComponent` renders the content, including the blocks with their data. It re-exports `@dextinity/site-react`.

The site keeps React Router's own files: `routes.ts`, `root.tsx`, `entry.rsc.tsx`, `entry.ssr.tsx` and `entry.client.tsx`.

```ts
// vite.config.ts
export default defineConfig({
    plugins: [reactRouterRSC(), rsc()],
    build: { assetsDir: "_assets" },
});
```

Requires `@vitejs/plugin-rsc` 0.5.35 or earlier: from 0.5.36 on, the production build of React Router 8.5 fails with "Vite RSC assets manifest not found".

**Server** (`@dextinity/site-react-router/node`, `@dextinity/site-react-router/server`)

`matchRscRequest()` is the `fetchServer()` of React Router's default `entry.rsc.tsx` with error reporting: errors of middlewares, loaders and server components are passed to `reportError`, and payloads with errors get `no-store` instead of the `Cache-Control` of the page, also for client navigations. The entry wraps it in a Hono app, which handles what also applies to the static files:

```tsx
// src/entry.rsc.tsx
const app = new Hono();
if (process.env.CDN_ORIGIN_CHECK_SECRET) {
    app.use(cdnOriginCheckMiddleware({ secret: process.env.CDN_ORIGIN_CHECK_SECRET }));
}
app.use(errorResponseCacheControlMiddleware);
if (import.meta.env.PROD) {
    app.use(staticFilesMiddleware);
}
app.use(trailingSlashRedirectMiddleware);
app.all("*", async (c) => {
    const response = await matchRscRequest({
        request: c.req.raw,
        routes,
        basename,
        clientVersion,
        routeDiscovery,
        ...pluginRscFunctions,
        reportError,
    });
    const ssr = await import.meta.viteRsc.loadModule<typeof import("./entry.ssr")>("ssr", "index");
    return ssr.generateHTML(c.req.raw, response);
});

export default { fetch: app.fetch };
```

`createRequestListener({ dev, server })` handles the requests with Vite during development and with the build in production:

```ts
const server = createServer();
server.on("request", await createRequestListener({ dev: process.env.NODE_ENV !== "production", server }));
server.listen(3000);
```

**Request context** (`@dextinity/site-react-router/server`)

React Router passes the context of the request only to middlewares, loaders and actions. `requestContextMiddleware`, registered in the root route, makes it available to server components with `getRequestContext()`.

**Site preview and block preview** (`@dextinity/site-react-router/server`)

`sitePreviewMiddleware` reads the site preview and the block preview of each request into `previewContext`, `getVisibility(context)`, `getSitePreview(context)` and `getPreviewScope(context)` read it. `sitePreviewLoader` is the loader of the route that starts the site preview. Both use the `SITE_PREVIEW_SECRET` environment variable. Render `SitePreviewProvider` while `getSitePreview(context)` is set, it marks the page as site preview for the blocks and reports its location to the admin.

`createBlockPreview()` creates the client component for the block preview of the admin, one route for all previews.

**GraphQL and fetch cache** (`@dextinity/site-react-router/server`)

`createServerGraphQLFetch({ url, headers, cache })` returns the GraphQL fetch of a request. It sends each query only once per request, e.g. when a loader checks that a page exists and its server component renders it. In the site preview and the block preview, it sends the preview headers to the API and bypasses the cache:

```ts
export const getGraphQLFetch = createServerGraphQLFetch({ url, headers, cache: { revalidateInSeconds: 450, store } });

// In a loader
const data = await getGraphQLFetch(context)(query, variables);
// In a server component
const data = await getGraphQLFetch(getRequestContext())(query, variables);
```

`createCachingFetch()`, `createMemoryFetchCacheStore()` and `createValkeyFetchCacheStore()` are the same as in `@dextinity/site-vite-rsc`.

**Pages**

- `notFound()` renders the closest `ErrorBoundary` with status 404
- `redirect()` only accepts http(s), `mailto:` and `tel:` URLs and relative paths, e.g. no `javascript:` URLs from redirect entries of the CMS
- `createMetadata()` creates the title, description, robots, canonical, alternate and Open Graph tags for the `meta` export and resolves relative URLs, e.g. of DAM images, against `baseUrl`
- `cacheControlHeaders` is the `headers` export of pages, it uses the `Cache-Control` the loader returns with `data()`

**Images and videos**

`PixelImageBlock`, `Image`, `DamVideoBlock`, `YouTubeVideoBlock` and `VimeoVideoBlock` are the same as in `@dextinity/site-vite-rsc`. Set the widths the API resizes images to with `ImageConfigProvider` in the layout of `root.tsx`.

**Persisted queries** (`@dextinity/site-react-router/vite`)

`persistedQueriesPlugin({ persistedQueriesPath, include })` replaces the GraphQL queries in client code with their hashes and writes the hashes to `persistedQueriesPath`, which the BFF route of the site (`persistedQueryRoute()` from `@dextinity/site-react`) reads.

**Sitemap and robots.txt** (`@dextinity/site-react-router/server`)

`sitemapResponse(sitemap, { isPreview })` and `robotsResponse()` render a sitemap and robots rules in the shapes of Next.js' `MetadataRoute.Sitemap` and `MetadataRoute.Robots`, for the loaders of resource routes.
