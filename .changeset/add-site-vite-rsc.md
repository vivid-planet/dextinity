---
"@dextinity/site-vite-rsc": minor
---

Add `@dextinity/site-vite-rsc`

The counterpart to `@dextinity/site-nextjs` for sites built with Vite, React Server Components (`@vitejs/plugin-rsc`) and Hono. It contains the RSC, SSR and browser entries of the site, so a project only provides its Hono app. It re-exports `@dextinity/site-react`.

Add the `dextinitySite()` Vite plugins to the `vite.config.ts` of the site:

```ts
import { dextinitySite } from "@dextinity/site-vite-rsc/vite";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [dextinitySite({ app: "./src/handler.ts" })],
});
```

The module passed as `app` exports the Hono app of the site as `app`. Its routes render pages with `renderPage()`:

```tsx
import { handleError, renderPage, trailingSlashRedirectMiddleware } from "@dextinity/site-vite-rsc/server";
import { Hono } from "hono";

export const app = new Hono();
app.use(trailingSlashRedirectMiddleware);
app.get("/:language", (c) =>
    renderPage(c, {
        root: <Layout>{/* … */}</Layout>,
        notFound: () => <NotFoundPage />,
        error: () => <ErrorPage />,
        cacheControl: "s-maxage=450, stale-while-revalidate=31535550",
    }),
);
app.onError(handleError);
```

**Error reporting**

All unexpected errors on the server and in the browser are passed to `reportError()`, which logs them. To report them to an error tracking service, pass a module exporting `reportError(error)` to `dextinitySite()`, relative to the Vite root. It's used in the RSC, the SSR and the browser environment:

```ts
dextinitySite({ app: "./src/handler.ts", reportError: "./src/util/reportError.ts" });
```

```ts
// src/util/reportError.ts
export function reportError(error: unknown) {
    // Report the error to the error tracking service, e.g. Sentry
    console.error(error);
}
```

Code of the site, e.g. a route handler or the `onError` of `ErrorHandlerProvider` for the block error boundaries, reports errors with `reportError()` from `@dextinity/site-vite-rsc`.

**Pages and components**

- `notFound()` and `redirect()` can be called anywhere in server and client components
- `redirect()` only accepts http(s), `mailto:` and `tel:` URLs and relative paths, e.g. no `javascript:` URLs from redirect entries of the CMS
- Client navigation follows redirects of pages, middlewares and route handlers itself, also to other origins
- Redirects of `renderPage()` are cached like the page, i.e. with `cacheControl`
- Pages with errors, also errors inside Suspense boundaries that an error boundary in the browser handles, aren't cached
- During a deployment with several instances, a client navigation can get a page of another build with client components the loaded build doesn't know. The page is then loaded fully instead of showing the error page or hiding the block
- `Link` navigates on the client, `useRouter()` offers `push()`, `replace()` and `refresh()`
- `usePathname()`, `useSearchParams()`, `useParams()` and `useNavigationPending()`
- In the site preview of the admin, i.e. when `getSitePreview()` is set, `renderPage()` marks the pages as site preview for the blocks and reports their location to the admin
- `Metadata` renders the description, robots, canonical, alternate and Open Graph tags of a page and resolves relative URLs, e.g. of DAM images, against `baseUrl`

**Images and videos**

`PixelImageBlock` and `Image` render responsive images with a `srcset`, lazy loading and the dominant color as placeholder. Pass `preload` for the most important image of a page, e.g. a stage image. `DamVideoBlock`, `YouTubeVideoBlock` and `VimeoVideoBlock` render their preview image with `PixelImageBlock`, so `renderPreviewImage` is optional. The widths must be the ones the API resizes images to, set them in the root layout:

```tsx
import dextinityConfig from "@src/dextinity-config.json" with { type: "json" };

<ImageConfigProvider config={dextinityConfig.images}>{children}</ImageConfigProvider>;
```

**Block preview**

`createBlockPreview()` creates the component for the block preview of the admin, one route for all previews. It renders the block the admin sends, with the data of `loadBlockData`, and the not found page for unknown types. Create it in a client component module:

```tsx
"use client";

export const BlockPreview = createBlockPreview<AllBlockNames>({
    previews: {
        page: defineBlockPreview({ blockType: "PageContent", render: (data: PageContentBlockData) => <PageContentBlock data={data} /> }),
        stage: defineBlockPreview({ blockType: "Stage", render: (data: StageBlockData) => <StageBlock data={data} /> }),
    },
    loadBlockData: ({ blockType, block, contentScope }) => recursivelyLoadBlockData({ blockType, blockData: block, scope: contentScope /* … */ }),
});
```

Import it with `await import()` in its route. Client components are bundled per server chunk, so a static import would add the code of all previews to the JavaScript of every page:

```tsx
app.get("/block-preview/:domain/:language/:type", async (c) => {
    const { BlockPreview } = await import("./BlockPreview");
    return renderPage(c, {
        root: (
            <Layout>
                <BlockPreview type={c.req.param("type")} />
            </Layout>
        ) /* … */,
    });
});
```

Previews are rendered in a Suspense boundary, so previews with large dependencies that the others don't need, e.g. mails, can be loaded with `lazy()`.

**Middlewares** (`@dextinity/site-vite-rsc/server`)

- `staticFilesMiddleware` serves the client build in production, `_assets` with a long cache duration
- `errorResponseCacheControlMiddleware` prevents caching of error responses
- `trailingSlashRedirectMiddleware` redirects URLs with a trailing slash
- `cdnOriginCheckMiddleware({ secret })` answers requests without the `x-cdn-origin-check` header set to `secret` with 403, so the site is only reachable via the CDN. Register it first, so it also covers the static files:

```ts
if (process.env.CDN_ORIGIN_CHECK_SECRET) {
    app.use(cdnOriginCheckMiddleware({ secret: process.env.CDN_ORIGIN_CHECK_SECRET }));
}
```

**Fetch cache** (`@dextinity/site-vite-rsc/server`)

`createCachingFetch(fetch, { revalidateInSeconds, store })` caches successful text responses, e.g. of the API, and serves stale ones while refreshing them in the background. Other responses, e.g. images, are passed through. `createMemoryFetchCacheStore()` keeps the entries in memory, `createValkeyFetchCacheStore({ connection, fallback })` shares them between the instances of the site and uses `fallback` while Valkey is unavailable:

```ts
const memoryStore = createMemoryFetchCacheStore();
const cachingFetch = createCachingFetch(fetch, {
    revalidateInSeconds: 450,
    store: createValkeyFetchCacheStore({ connection: { host, port, password }, fallback: memoryStore }),
});
```

**GraphQL** (`@dextinity/site-vite-rsc/server`)

`createServerGraphQLFetch({ url, headers, cache })` creates the GraphQL fetch for server components, one instance for the whole site. In the site preview and the block preview, it sends the preview headers to the API and bypasses the cache:

```ts
export const graphQLFetch = createServerGraphQLFetch({
    url: `${process.env.API_URL_INTERNAL}/graphql`,
    headers: { authorization: `Basic ${credentials}` },
    cache: { revalidateInSeconds: 450, store },
});
```

**Persisted queries** (`@dextinity/site-vite-rsc/vite`)

`persistedQueriesPlugin({ persistedQueriesPath, include })` replaces the GraphQL queries in client code with their hashes and writes the hashes to `persistedQueriesPath`, which the BFF route of the site (`persistedQueryRoute()` from `@dextinity/site-react`) reads:

```ts
plugins: [
    dextinitySite({ app: "./src/handler.ts" }),
    persistedQueriesPlugin({ persistedQueriesPath: "dist/persisted-queries.json", include: resolve(import.meta.dirname, "src") }),
],
```

**Server** (`@dextinity/site-vite-rsc/node`)

`createRequestListener({ dev, server })` handles the requests with Vite during development and with the build in production. The project's server adds what its operation needs, e.g. tracing and metrics:

```ts
const server = createServer();
server.on("request", await createRequestListener({ dev: process.env.NODE_ENV !== "production", server }));
server.listen(3000);
```

**Sitemap and robots.txt** (`@dextinity/site-vite-rsc/server`)

`sitemapResponse()` and `robotsResponse()` render a sitemap and robots rules in the shapes of Next.js' `MetadataRoute.Sitemap` and `MetadataRoute.Robots`, so the `sitemap()` and `robots()` functions of a Next.js site can be reused. In a preview, the sitemap isn't cached, as it may contain unpublished pages:

```ts
app.get("/sitemap.xml", async () => sitemapResponse(await sitemap()));
app.get("/robots.txt", () => robotsResponse({ rules: { userAgent: "*", allow: "/" }, sitemap: "https://www.example.com/sitemap.xml" }));
```

**Site preview** (`@dextinity/site-vite-rsc/server`)

`sitePreviewRoute` starts the site preview of the admin, `sitePreviewMiddleware` reads the site preview and the block preview of each request and sets the visibility. Both use the `SITE_PREVIEW_SECRET` environment variable. In the preview, the project resolves its site from `getPreviewScope()` instead of the host:

```ts
app.get("/site-preview", sitePreviewRoute);
app.use(sitePreviewMiddleware, siteMiddleware);
```

**Request context** (`@dextinity/site-vite-rsc/server`)

`getRequest()`, `isRscRequest()`, `getCookie()`, `getVisibility()`, `getSitePreview()` and `getPreviewScope()` are available while handling a request. The project's data of the request, e.g. the scope of the site, is set with `setRequestData()` and typed with module augmentation:

```ts
declare module "@dextinity/site-vite-rsc/server" {
    interface RequestContextData {
        domain: string;
    }
}
```

Requires React 19.2 or later, which added `renderToReadableStream` to the Node build of `react-dom/server`. Pin `react-server-dom-webpack` to exactly the version of `react` used by the site.

In development, the first page after a new Vite cache, e.g. after a dependency update, is reloaded once: Vite only discovers the dependencies of client components when the page loads them.
