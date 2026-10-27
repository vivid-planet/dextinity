# Demo site on Vite + `@vitejs/plugin-rsc` + Hono: open tasks

Follow-ups for [vivid-planet/dextinity#6779](https://github.com/vivid-planet/dextinity/pull/6779) (PoC: demo site migrated from Next.js). Task numbers match the session task list. Paths are relative to `demo/site/` unless stated otherwise.

## References

| Ref              | What                                                                                                                                                                                                 | Where to look                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **audi6**        | Same migration (PoC) in the Audi project: [vivid-planet-intern/audi6#166](https://github.com/vivid-planet-intern/audi6/pull/166)                                                                     | `frontend/apps/site/src/framework/` (`renderPage.tsx`, `navigationErrors.ts`, `GlobalErrorBoundary.tsx`, `Link.tsx`, `navigation.tsx`, `entry.browser.tsx`, `entry.ssr.tsx`, `rscRequest.ts`, `requestContext.ts`, `Metadata.tsx`, `image/Image.tsx`, `dextinity/PixelImageBlock.tsx`, `fetchCache/`), `src/app/app.tsx` (router, trailing slash redirect), `src/middleware/` (`chain.ts`, `cacheControl.ts`, `securityHeaders.ts`, `domain.ts`), `vite.config.ts` (SSR `noExternal: true`, optimizeDeps entries)                    |
| **plugin-rsc**   | Examples of `@vitejs/plugin-rsc` (checked at commit `304a92a`): [vite-plugin-react/packages/plugin-rsc/examples](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-rsc/examples) | `starter/` and `basic/src/framework/` (`entry.{rsc,ssr,browser}.tsx`, `error-boundary.tsx`: GlobalErrorBoundary, SSR failure → 500 + `__NO_HYDRATE` client render), `ppr/` (TODO for digest-based error handling: [vite-plugin-react#795](https://github.com/vitejs/vite-plugin-react/issues/795)), `react-router/` (delegates to React Router), README (framework packages must remap `optimizeDeps.include`)                                                                                                                       |
| **Next.js**      | Next.js 16.3.8, installed in this repo as devDependency of `@dextinity/site-nextjs` (`node_modules/.pnpm/next@16.3.8*/node_modules/next/dist/`)                                                      | `server/app-render/app-render.js` ("errorRecovery": status/Location set while rendering the shell), `server/app-render/make-get-server-inserted-html.js` (after the shell: `<meta name="robots" content="noindex">` for not found, `<meta http-equiv="refresh">` with id `__next-page-redirect` for redirects), `client/components/http-access-fallback/` (`NEXT_HTTP_ERROR_FALLBACK;404` digest, boundary per layout), `client/components/redirect-error.js` (`NEXT_REDIRECT` digest), `client/components/builtin/global-error.tsx` |
| **React Router** | React Router 8.5.0 RSC mode (`npm pack react-router@8.5.0`, `dist/development/`)                                                                                                                     | `index-react-server.js` (`generateRedirectResponse`: redirects of RSC requests as status 202 + payload `{ type: "redirect", location, status, replace, reload }`; loaders decide the status before rendering), `lib/rsc/server.ssr.js` (`routeRSCServerRequest`: 202 payload → real 3xx for HTML; digests decoded in SSR `onError`; late redirect → `<meta http-equiv="refresh" content="0;url=…">`; `hasInvalidProtocol`; `RSCRouterGlobalErrorBoundary` reset by location; `.rsc` URL suffix)                                      |

## Fixes

### #1 Allow `notFound()`/`redirect()` anywhere in the tree (done)

Errors carry a digest (`NOT_FOUND`, `REDIRECT;307;/path`), the RSC payload is buffered completely in `framework/render.tsx` before responding, SSR `onError` handles client components. Pages are plain components again. Refs: audi6 `renderPage.tsx`/`navigationErrors.ts`, Next.js digests.

### #2 Render a 500 error page and add a client error boundary (done)

- Problem: SSR failure answers with plain text "Internal Server Error" (`framework/entry.ssr.tsx`); RSC requests with a server component error get status 200 + `s-maxage` (CDN caches the broken payload); no client boundary, so any error after hydration or client navigation unmounts the whole document (white page). Block errors are already contained in the browser by site-react's `ErrorHandlerBoundary` (`BlocksBlock`/`ListBlock`/`OneOfBlock`), but not during SSR.
- Proposal: `renderPage` gets an `error` option → server-rendered error page (`src/app/error.tsx`, only `RootLayout`, no API data) with status 500, plain-text fallback if it fails too; `no-store` for payloads containing errors; `framework/GlobalErrorBoundary.tsx` around `BrowserRoot` (full document fallback, keyed by URL to reset on navigation, navigation digests → full page load); one central `reportError` for RSC/SSR/client.
- Decision: server-rendered error page without browser retry (instead of the plugin-rsc examples' 500 + empty shell + `__NO_HYDRATE` client render retry). `GlobalErrorBoundary` follows redirect digests with `location.assign` without protocol validation until #39.
- Refs: plugin-rsc `basic/src/framework/error-boundary.tsx` + `entry.ssr.tsx`, audi6 `GlobalErrorBoundary.tsx`/`renderPage.tsx` (`error` option), Next.js `global-error.tsx`, React Router `RSCRouterGlobalErrorBoundary`.

### #3 Redirect URLs with a trailing slash (done)

`new Hono({ strict: false })` in `src/app/router.tsx` served `/en/` and `/en` with 200 (duplicate content). Next.js redirected with 308. Now `framework/trailingSlashRedirect.ts` redirects with 308, collapsing leading slashes so that `//example.com/` doesn't redirect to another host (audi6's middleware has that open redirect). `createSitePath` returns `/en` instead of `/en/` for the root page (links, sitemap). Ref: audi6 `src/app/app.tsx` (`trailingSlashRedirectMiddleware`).

### #4 Keep the `/_rsc` prefix for absolute same-origin redirects (superseded by #38)

`framework/entry.rsc.tsx` only prefixes `Location` headers starting with `/`. Goes away with #38; close then.

### #5 Don't store `Set-Cookie` in the fetch cache (won't fix)

`src/util/fetchCache.ts` stores all response headers, including a possible `Set-Cookie`. Decided to keep it: the cached headers never reach the browser (`createGraphQLFetch` only reads status and body), and Next.js does the same (`next/dist/server/lib/patch-fetch.js` stores `Object.fromEntries(res.headers.entries())`, the Next.js demo cached the GraphQL fetches with `force-cache` in Redis). Revisit with #29 if the cache is used for responses that are passed to the browser.

### #6 Send `no-store` for non-200 page responses from the render (done)

`renderPage` sent the public `cacheControl` also with 404; only `server.ts` overrode it, and only in production. Now `renderPage` uses the route's `cacheControl` only for status 200 without errors and `no-store` for everything else. The override in `server.ts` stays for responses that don't go through `renderPage` (see #11). Ref: audi6 `renderPage.tsx` (`status === 200 && !isSitePreview()`).

### #7 Resolve relative metadata URLs against the site URL (done)

The Next.js demo set `metadataBase: new URL(siteConfig.url)` in the language layout, so the relative DAM path of `og:image` became absolute. Since the migration, `og:image` was relative, so share previews had no image. Now `src/util/absoluteUrl.ts` resolves it against the URL of the current site (from the request context). Canonical and alternate URLs are already absolute (`@IsUrl()` in the CMS). The general solution, resolving all URL fields in a Metadata component, comes with #27. Ref: audi6 `framework/Metadata.tsx` (`baseUrl`).

## Refactoring

### #8 Replace the `router.fetch()` handoff with Hono route order (done)

Skip middlewares and the site context middleware handed requests to separate Hono apps (`router.fetch()`/`siteRouter.fetch()`), so whether a route was reachable and which middlewares applied was only defined by the position of the handoff. Now `src/handler.ts` is a single app whose registration order defines both: middlewares only apply to routes registered after them. `status`, `admin` and `dam` are routes in `src/app/`. Only the predefined pages rewrite still calls `siteRoutes.fetch()` (GET/HEAD only), since Hono routes by the original path. Verified by comparing status and headers of 46 requests before/after: identical except `/api` (now the 404 shortcut without CSP like all other `/api/*` paths). Ref: audi6 `src/app/app.tsx` + `middleware/chain.ts` (`handleRoute`).

### #9 Resolve site config and preview params once per request (done)

The site was resolved from the host in 4 middlewares and the preview JWT verified up to 6 times per request. Now `siteContextMiddleware` runs before `redirectToMainHost`, resolves both once and stores them in the site context (`domain`, `visibility`, `sitePreview`); unknown hosts leave it unset (`hasSiteContext()`), which the preview domain check and the main host redirect use. Everything after reads the site context, `/admin` moved after the main host redirect. Site pages requested with the `x-block-preview` header are no longer cached publicly. Ref: audi6 `requestContext.ts` (`setRequestSite`), `middleware/domain.ts`.

### #10 Bundle all SSR dependencies and pre-scan client components (dropped)

Kept the short `ssr.resolve.noExternal` list (`prop-types`, `swiper`). Tried `noExternal: true` like audi6: `csso` and `css-tree` (via `@dextinity/mail-react`) and `uglify-js` (via mjml → `html-minifier`) load their own files at runtime, which breaks when bundled. Works with the self-contained `csso/dist/csso.esm` build in mail-react plus `external: ["mjml"]`, but in dev the SSR dependency optimizer then re-bundles after dependency changes and the first requests answer 500. Not worth it for removing two list entries. Moving the welcome email's data loading to the RSC environment came out of it (no fetch cache/ioredis in SSR anymore). Revisit with mjml 5 or if the list grows. Ref: audi6 `vite.config.ts` (`findClientComponents`).

### #11 Move security and cache headers into the Hono app (done)

Security headers were set on Node level in `server.ts`, static files, their cache headers and `no-store` for error responses only existed in the production server, and `robots.txt`/`sitemap.xml` got their `Cache-Control` from a path list there. Now `src/handler.ts` starts with `securityHeadersMiddleware` (only sets headers the response doesn't have, the proxied DAM files keep the API's), `errorResponseCacheControlMiddleware` and, in production, `staticFilesMiddleware`; the two routes set their own `Cache-Control`. `server.ts` only keeps the transport (origin check, metrics, compression). Verified by comparing 61 requests in dev and production before/after: production identical except the spelling of `text/plain;charset=UTF-8`; dev now matches production for error responses and robots/sitemap, files served by Vite in dev have no security headers anymore. Ref: audi6 `middleware/securityHeaders.ts`, `middleware/cacheControl.ts`.

### #12 Memoize fetches per request

The fetch cache only de-duplicates concurrent requests in the cached path; preview requests aren't memoized. Add a per-request memo to the request context. Ref: audi6 `requestContext.ts` (`fetchMemo`) + `fetchCache/fetchCache.ts`.

## Navigation

### #13 Replace global click interception with a `Link` component and router API

`framework/entry.browser.tsx` intercepts clicks on every `<a>` with exceptions (`/dam/`, `/api/`). Opt-in `Link` + `useRouter()` (`push`/`replace`/`refresh`). Ref: audi6 `framework/Link.tsx`, `navigation.tsx`, `entry.browser.tsx` (same-path navigation without refetch).

### #14 Add abort, pending state, scroll restoration, prefetch, route announcer

Client navigation in `entry.browser.tsx`: `AbortController` for superseded fetches, pending state (`useTransition`), scroll restoration on back/forward (`history.scrollRestoration = "manual"` + stored positions), optional prefetching, route change announcement for screen readers.

### #37 Stream the RSC payload with Next.js-style fallbacks (option D)

TODO in `framework/render.tsx` (`renderRscPayload`). Needed once pages use Suspense: decide the status only up to the SSR shell, afterwards inject `noindex` meta for not found and meta refresh for redirects, error boundaries around layouts (not found in place, client-side redirect). Public `notFound()`/`redirect()` API stays. Refs: Next.js `app-render.js` + `make-get-server-inserted-html.js`, React Router `server.ssr.js` (redirect transform).

### #38 Answer redirects of RSC requests with a redirect payload instead of 3xx

Today RSC requests get a 3xx that `fetch` follows; `entry.rsc.tsx` rewrites `Location` to keep `/_rsc`. External targets fail with CORS → console error → full page load (target requested twice). Turn every 3xx of an RSC request (renderPage, middlewares, Hono handlers) into status 202 + payload `{ type: "redirect", location, status }` with `no-store`; `RscPayload` becomes a union; the browser entry navigates (same origin client-side with `replaceState`, else `location.assign`). Makes #4 obsolete. Depends on #39. Ref: React Router `generateRedirectResponse` / `routeRSCServerRequest`.

## Other

### #15 Replace `DefaultTitle` on every page with a central title fallback

React doesn't de-duplicate `<title>`, so `src/layout/DefaultTitle.tsx` is rendered by each page without own title (easy to forget). Let the route declare its title/fallback centrally, e.g. in `renderSitePage`.

### #16 Use a CSP nonce instead of `'unsafe-inline'` for scripts

Bootstrap script and inlined RSC payload are inline scripts, so `src/middleware/contentSecurityPolicyHeaders.ts` needs `'unsafe-inline'`. React (`nonce` option of `renderToReadableStream`) and `rsc-html-stream` (`injectRSCPayload(…, { nonce })`) support nonces. Ref: plugin-rsc `basic/src/framework/entry.ssr.tsx` (`nonce` passed through).

### #17 Pick up new persisted queries in dev without restart

`persistedQueryRoute` (site-react) loads `dist/persisted-queries.json` once; queries added while the dev server runs are unknown until restart. Reload on file change or skip persisted queries in dev. Files: `vitePersistedQueriesPlugin.ts`, `src/app/graphql/route.ts`.

### #18 Add unit tests and HTTP tests against a test app for the framework code (done)

- Unit tests (Vitest, `pnpm test:unit`): `framework/navigation.ts`, `framework/rscRequest.ts`, `framework/requestContext.ts`, `util/fetchCache.ts` (store mocked). Each fix adds its unit tests here (#3, #7, #39).
- HTTP tests (Playwright `request` fixture, no browser, `pnpm test:e2e`, CI job "Test (e2e)"): `e2e/fixture/` is a test app that runs the real framework entries with its own Hono routes (`@src/handler` aliased in `e2e/fixture/vite.config.ts`), against the dev server and the production build (`vite preview`). Covers rendering, request context, `/_rsc`, navigation errors (#1) and error handling (#2). Add a route to `e2e/fixture/handler.tsx` and a test per fix (#3, #4, #6, #38, #39).
- Still open: router path splitting and sitemap/robots output (need the demo's API), see also #40.
- Ref: plugin-rsc `e2e/fixture.ts` (`useFixture` with dev/build modes).

### #40 Add browser tests against the test app

Playwright with a browser against the same test app (`e2e/fixture/`): client navigation without full reload, title/meta update, back/forward, hydration without console errors, navigation to a 404/redirect (full load, final URL, #1/#4/#38), `GlobalErrorBoundary` fallback and reset (#2). Later abort, pending state, scroll restoration, prefetch (#13, #14) and CSP violations (#16). CI needs `playwright install chromium-headless-shell` like the Storybook job. Optionally also a few smoke tests against the real demo (needs Docker + API, run manually or nightly). With an empty Vite cache (always in CI), dev discovers dependencies of client components late and reloads the page ("Outdated Optimize Dep"); if that makes the tests flaky, add the `"use client"` files to `environments.client.optimizeDeps.entries` (measured during #10: removes the reload).

### #39 Only allow http(s) and relative redirect targets

Redirect targets also come from the CMS (external link `targetUrl` of redirect entries, Link documents). Once the browser performs redirects itself (#38), a `javascript:` URL would execute. Validate in `redirect()` (`framework/navigation.ts`) and when creating the redirect payload. Ref: React Router `hasInvalidProtocol`.

### #36 Rewrite the description of [vivid-planet/dextinity#6779](https://github.com/vivid-planet/dextinity/pull/6779)

The description generated by the Claude Code UI doesn't follow `AGENTS.md` (restates the diff, example code doesn't match the router). Rewrite per `.github/pull_request_template.md`.

## Library `@dextinity/site-vite-rsc`

Counterpart to `@dextinity/site-nextjs`: re-exports `@dextinity/site-react` and adds the Vite/RSC/Hono specific parts, so projects mainly swap the import.

### #19 Decide the open design questions

1. Hono as hard dependency or only a fetch handler `(request) => Response`?
2. How project data (domain, visibility) gets into the request context: generic types or a `resolveSiteContext(request)` callback?
3. Pin `@vitejs/plugin-rsc` (0.x) and `react-server-dom-webpack` (must match React exactly) together.
4. Packaging the entries: `optimizeDeps.include` must be remapped to `pkg > @vitejs/plugin-rsc/...` (plugin-rsc README, "Using `@vitejs/plugin-rsc` as a framework package's `dependencies`").
5. Leave room for server actions later.

### #20 Create the package with a Vite plugin preset (blocked by #19, #10)

`dextinitySite({ app })` from `vite.config.ts`: `rsc()` with the library's entries, `react()`, SSR `noExternal: true`, scanning of `"use client"` files, `envDir: false`, assets dir, persisted queries.

### #21–#32 Move into the package

| #   | What                                                                                                                                                 | From (demo/site)                                                    | Blocked by   |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------ |
| 21  | RSC, SSR and browser entries (project only provides its Hono app)                                                                                    | `src/framework/entry.{rsc,ssr,browser}.tsx`                         | #20          |
| 22  | `/_rsc` prefix handling                                                                                                                              | `src/framework/rscRequest.ts`, `entry.rsc.tsx`                      | #20, #4, #38 |
| 23  | Request context core (request, isRsc, cookies, memo, typed slot for project data)                                                                    | `src/framework/requestContext.ts`                                   | #20, #9, #12 |
| 24  | `renderPage`, `notFound()`, `redirect()`                                                                                                             | `src/framework/render.tsx`, `navigation.ts`                         | #20, #6      |
| 25  | Router hooks + `Link` + `useRouter`                                                                                                                  | `src/framework/RouterProvider.tsx`                                  | #20, #13     |
| 26  | Error boundary, error and not found handling                                                                                                         | (from #2)                                                           | #20, #2      |
| 27  | `Metadata` component with base URL resolution, replaces `absoluteUrl`                                                                                | inline in `src/documents/pages/Page.tsx`, `src/util/absoluteUrl.ts` | #20, #7      |
| 28  | Production and dev server (`createServer({ staticDir, securityHeaders, cdnOriginCheckSecret })`, Vite middleware mode in dev, metrics/tracing hooks) | `server.ts`                                                         | #20, #11     |
| 29  | Fetch cache (store interface, Valkey/LRU, stale-while-revalidate, metrics)                                                                           | `src/util/fetchCache.ts`, `fetchCacheStore.ts`                      | #20, #12     |
| 30  | `createServerGraphQLFetch({ url, headers })` reading visibility from the context                                                                     | `src/util/graphQLClient.ts`                                         | #29          |
| 31  | Persisted queries Vite plugin (counterpart to site-react's webpack loader)                                                                           | `vitePersistedQueriesPlugin.ts`                                     | #20, #17     |
| 32  | `SitePreviewProvider`                                                                                                                                | `src/util/SitePreviewProvider.tsx`                                  | #25          |

## Library `@dextinity/site-react` (framework-independent, also usable by site-nextjs; needs changesets)

### #33 Add `PixelImageBlock` and a responsive `Image` with srcset

Exists twice today (site-nextjs on `next/image`, demo in `src/common/blocks/PixelImageBlock.tsx`); site-react's `Image` has no srcset. Make `VideoPreviewImage` and the video blocks use it by default so `renderPreviewImage` becomes optional again (removes `src/common/helpers/VideoPreviewImage.tsx`). Ref: audi6 `framework/image/Image.tsx` (next/image width algorithm, blur placeholder, `priority`).

### #34 Add framework-independent site preview server helpers

From `src/util/sitePreview.ts` and `src/app/site-preview/route.ts`: JWT verification, cookie, `sitePreviewRoute(request)`, `getPreviewParams(request)` on standard Request/Response in `@dextinity/site-react/server`. site-nextjs could build on it. Ref: audi6 `framework/sitePreview.ts`.

### #35 Add sitemap and robots helpers

From `src/app/sitemap.ts` and `src/app/robots.ts`: generate `sitemap.xml`/`robots.txt` as `Response`. Ref: audi6 `framework/metadataRoutes.ts`.
