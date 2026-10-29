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
