---
"@dextinity/site-react-router": minor
---

Add `@dextinity/site-react-router`

The counterpart to `@dextinity/site-nextjs` and `@dextinity/site-vite-rsc` for sites built with React Router's framework mode. Pages load their data in loaders, including the data of the blocks with `recursivelyLoadBlockData()`, and are rendered with SSR. It re-exports `@dextinity/site-react`.

The site keeps React Router's own files: `routes.ts`, `root.tsx`, `entry.server.tsx` and `entry.client.tsx`. Enable the middleware of React Router in `react-router.config.ts`:

```ts
export default {
    appDirectory: "src",
    future: { v8_middleware: true, v8_passThroughRequests: true },
} satisfies Config;
```

**Server** (`@dextinity/site-react-router/node`, `@dextinity/site-react-router/server`)

The server entry of the site is a Hono app, which handles what also applies to the static files and passes the requests to React Router. Build it as server entry in `vite.config.ts`:

```ts
export default defineConfig(({ isSsrBuild }) => ({
    plugins: [reactRouter()],
    build: { assetsDir: "_assets", rollupOptions: isSsrBuild ? { input: "./src/app.ts" } : undefined },
}));
```

```ts
// src/app.ts
import * as build from "virtual:react-router/server-build";

const handleRequest = createRequestHandler(build, import.meta.env.MODE);

export const app = new Hono();
if (process.env.CDN_ORIGIN_CHECK_SECRET) {
    app.use(cdnOriginCheckMiddleware({ secret: process.env.CDN_ORIGIN_CHECK_SECRET }));
}
app.use(errorResponseCacheControlMiddleware);
if (import.meta.env.PROD) {
    app.use(staticFilesMiddleware);
}
app.use(trailingSlashRedirectMiddleware);
app.all("*", (c) => handleRequest(c.req.raw, new RouterContextProvider()));
```

`createRequestListener({ dev, server, appModule })` handles the requests with Vite during development and with the build in production:

```ts
const server = createServer();
server.on("request", await createRequestListener({ dev: process.env.NODE_ENV !== "production", server, appModule: "./src/app.ts" }));
server.listen(3000);
```

`renderDocument()` renders the HTML in `entry.server.tsx`, like React Router's default entry, but bots get the complete page:

```tsx
export default function handleRequest(request: Request, status: number, headers: Headers, routerContext: EntryContext) {
    return renderDocument({ request, status, headers, routerContext });
}
```

**Site preview and block preview** (`@dextinity/site-react-router/server`)

`sitePreviewMiddleware` reads the site preview and the block preview of each request into `previewContext`, `getVisibility(context)`, `getSitePreview(context)` and `getPreviewScope(context)` read it. `sitePreviewLoader` is the loader of the route that starts the site preview. Both use the `SITE_PREVIEW_SECRET` environment variable. Render `SitePreviewProvider` while `getSitePreview(context)` is set, it marks the page as site preview for the blocks and reports its location to the admin.

```ts
// A pathless layout above the pages of the site
export const middleware: Route.MiddlewareFunction[] = [sitePreviewMiddleware, siteMiddleware];
```

`createBlockPreview()` creates the component for the block preview of the admin, one route for all previews. Check the type in the loader with `BlockPreview.hasPreview(type)`.

**GraphQL and fetch cache** (`@dextinity/site-react-router/server`)

`createServerGraphQLFetch({ url, headers, cache })` returns the GraphQL fetch of a request for the loaders. In the site preview and the block preview, it sends the preview headers to the API and bypasses the cache:

```ts
export const getGraphQLFetch = createServerGraphQLFetch({ url, headers, cache: { revalidateInSeconds: 450, store } });

export async function loader({ context }: Route.LoaderArgs) {
    const data = await getGraphQLFetch(context)(query, variables);
}
```

`createCachingFetch()`, `createMemoryFetchCacheStore()` and `createValkeyFetchCacheStore()` are the same as in `@dextinity/site-vite-rsc`.

**Pages**

- `notFound()` renders the closest `ErrorBoundary` with status 404
- `redirect()` only accepts http(s), `mailto:` and `tel:` URLs and relative paths, e.g. no `javascript:` URLs from redirect entries of the CMS
- `createMetadata()` creates the title, description, robots, canonical, alternate and Open Graph tags for the `meta` export and resolves relative URLs, e.g. of DAM images, against `baseUrl`
- `cacheControlHeaders` is the `headers` export of pages, it uses the `Cache-Control` the loader returns with `data()`

**Images and videos**

`PixelImageBlock`, `Image`, `DamVideoBlock`, `YouTubeVideoBlock` and `VimeoVideoBlock` are the same as in `@dextinity/site-vite-rsc`. Set the widths the API resizes images to with `ImageConfigProvider` in `root.tsx`.

**Persisted queries** (`@dextinity/site-react-router/vite`)

`persistedQueriesPlugin({ persistedQueriesPath, include })` replaces the GraphQL queries in client code with their hashes and writes the hashes to `persistedQueriesPath`, which the BFF route of the site (`persistedQueryRoute()` from `@dextinity/site-react`) reads.

**Sitemap and robots.txt** (`@dextinity/site-react-router/server`)

`sitemapResponse(sitemap, { isPreview })` and `robotsResponse()` render a sitemap and robots rules in the shapes of Next.js' `MetadataRoute.Sitemap` and `MetadataRoute.Robots`, for the loaders of resource routes.
