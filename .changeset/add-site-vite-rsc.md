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

**Pages and components**

- `notFound()` and `redirect()` can be called anywhere in server and client components
- `Link` navigates on the client, `useRouter()` offers `push()`, `replace()` and `refresh()`
- `usePathname()`, `useSearchParams()`, `useParams()` and `useNavigationPending()`
- `Metadata` renders the description, robots, canonical, alternate and Open Graph tags of a page and resolves relative URLs, e.g. of DAM images, against `baseUrl`

**Middlewares** (`@dextinity/site-vite-rsc/server`)

- `staticFilesMiddleware` serves the client build in production, `_assets` with a long cache duration
- `errorResponseCacheControlMiddleware` prevents caching of error responses
- `trailingSlashRedirectMiddleware` redirects URLs with a trailing slash

**Fetch cache** (`@dextinity/site-vite-rsc/server`)

`createCachingFetch(fetch, { revalidateInSeconds, store })` caches successful responses and serves stale ones while refreshing them in the background. `createMemoryFetchCacheStore()` keeps the entries in memory, `createValkeyFetchCacheStore({ connection, fallback })` shares them between the instances of the site and uses `fallback` while Valkey is unavailable:

```ts
const memoryStore = createMemoryFetchCacheStore();
const cachingFetch = createCachingFetch(fetch, {
    revalidateInSeconds: 450,
    store: createValkeyFetchCacheStore({ connection: { host, port, password }, fallback: memoryStore }),
});
```

**Server** (`@dextinity/site-vite-rsc/node`)

`createRequestListener({ dev, server })` handles the requests with Vite during development and with the build in production. The project's server adds what its operation needs, e.g. tracing and metrics:

```ts
const server = createServer();
server.on("request", await createRequestListener({ dev: process.env.NODE_ENV !== "production", server }));
server.listen(3000);
```

**Request context** (`@dextinity/site-vite-rsc/server`)

`getRequest()`, `isRscRequest()`, `getCookie()`, `getVisibility()` and `getSitePreview()` are available while handling a request. The project's data of the request, e.g. the scope of the site, is set with `setRequestData()` and typed with module augmentation:

```ts
declare module "@dextinity/site-vite-rsc/server" {
    interface RequestContextData {
        domain: string;
    }
}
```

Pin `react-server-dom-webpack` to exactly the version of `react` used by the site.
