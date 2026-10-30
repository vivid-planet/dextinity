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
- Decision: server-rendered error page without browser retry (instead of the plugin-rsc examples' 500 + empty shell + `__NO_HYDRATE` client render retry). `GlobalErrorBoundary` follows redirect digests with `location.assign`, their targets are validated by `redirect()` since #39.
- Refs: plugin-rsc `basic/src/framework/error-boundary.tsx` + `entry.ssr.tsx`, audi6 `GlobalErrorBoundary.tsx`/`renderPage.tsx` (`error` option), Next.js `global-error.tsx`, React Router `RSCRouterGlobalErrorBoundary`.

### #3 Redirect URLs with a trailing slash (done)

`new Hono({ strict: false })` in `src/app/router.tsx` served `/en/` and `/en` with 200 (duplicate content). Next.js redirected with 308. Now `framework/trailingSlashRedirect.ts` redirects with 308, collapsing leading slashes so that `//example.com/` doesn't redirect to another host (audi6's middleware has that open redirect). `createSitePath` returns `/en` instead of `/en/` for the root page (links, sitemap). Ref: audi6 `src/app/app.tsx` (`trailingSlashRedirectMiddleware`).

### #4 Keep the `/_rsc` prefix for absolute same-origin redirects (done with #38)

`framework/entry.rsc.tsx` only prefixed `Location` headers starting with `/`. RSC requests don't answer with a `Location` anymore since #38.

### #5 Don't store `Set-Cookie` in the fetch cache (won't fix)

`src/util/fetchCache.ts` stores all response headers, including a possible `Set-Cookie`. Decided to keep it: the cached headers never reach the browser (`createGraphQLFetch` only reads status and body), and Next.js does the same (`next/dist/server/lib/patch-fetch.js` stores `Object.fromEntries(res.headers.entries())`, the Next.js demo cached the GraphQL fetches with `force-cache` in Redis). Revisit with #29 if the cache is used for responses that are passed to the browser.

### #6 Send `no-store` for non-200 page responses from the render (done)

`renderPage` sent the public `cacheControl` also with 404; only `server.ts` overrode it, and only in production. Now `renderPage` uses the route's `cacheControl` only for status 200 without errors and `no-store` for everything else. The override in `server.ts` stays for responses that don't go through `renderPage` (see #11). Ref: audi6 `renderPage.tsx` (`status === 200 && !isSitePreview()`).

### #7 Resolve relative metadata URLs against the site URL (done)

The Next.js demo set `metadataBase: new URL(siteConfig.url)` in the language layout, so the relative DAM path of `og:image` became absolute. Since the migration, `og:image` was relative, so share previews had no image. Now `src/util/absoluteUrl.ts` resolves it against the URL of the current site (from the request context). Canonical and alternate URLs are already absolute (`@IsUrl()` in the CMS). The general solution, resolving all URL fields in a Metadata component, comes with #27. Ref: audi6 `framework/Metadata.tsx` (`baseUrl`).

## Refactoring

### #8 Replace the `router.fetch()` handoff with Hono route order (done)

Skip middlewares and the site context middleware handed requests to separate Hono apps (`router.fetch()`/`siteRouter.fetch()`), so whether a route was reachable and which middlewares applied was only defined by the position of the handoff. Now `src/handler.ts` is a single app whose registration order defines both: middlewares only apply to routes registered after them. `status`, `admin` and `dam` are routes in `src/routes/` (#49). Only the predefined pages rewrite still calls `siteRoutes.fetch()` (GET/HEAD only), since Hono routes by the original path. Verified by comparing status and headers of 46 requests before/after: identical except `/api` (now the 404 shortcut without CSP like all other `/api/*` paths). Ref: audi6 `src/app/app.tsx` + `middleware/chain.ts` (`handleRoute`).

### #9 Resolve site config and preview params once per request (done)

The site was resolved from the host in 4 middlewares and the preview JWT verified up to 6 times per request. Now `siteContextMiddleware` runs before `redirectToMainHost`, resolves both once and stores them in the site context (`domain`, `visibility`, `sitePreview`); unknown hosts leave it unset (`hasSiteContext()`), which the preview domain check and the main host redirect use. Everything after reads the site context, `/admin` moved after the main host redirect. Site pages requested with the `x-block-preview` header are no longer cached publicly. Ref: audi6 `requestContext.ts` (`setRequestSite`), `middleware/domain.ts`.

### #10 Bundle all SSR dependencies and pre-scan client components (dropped)

Kept the short `ssr.resolve.noExternal` list (`prop-types`, `swiper`). Tried `noExternal: true` like audi6: `csso` and `css-tree` (via `@dextinity/mail-react`) and `uglify-js` (via mjml → `html-minifier`) load their own files at runtime, which breaks when bundled. Works with the self-contained `csso/dist/csso.esm` build in mail-react plus `external: ["mjml"]`, but in dev the SSR dependency optimizer then re-bundles after dependency changes and the first requests answer 500. Not worth it for removing two list entries. Moving the welcome email's data loading to the RSC environment came out of it (no fetch cache/ioredis in SSR anymore). Revisit with mjml 5 or if the list grows. Ref: audi6 `vite.config.ts` (`findClientComponents`).

### #11 Move security and cache headers into the Hono app (done)

Security headers were set on Node level in `server.ts`, static files, their cache headers and `no-store` for error responses only existed in the production server, and `robots.txt`/`sitemap.xml` got their `Cache-Control` from a path list there. Now `src/handler.ts` starts with `securityHeadersMiddleware` (only sets headers the response doesn't have, the proxied DAM files keep the API's), `errorResponseCacheControlMiddleware` and, in production, `staticFilesMiddleware`; the two routes set their own `Cache-Control`. `server.ts` only keeps the transport (origin check, metrics, compression). Verified by comparing 61 requests in dev and production before/after: production identical except the spelling of `text/plain;charset=UTF-8`; dev now matches production for error responses and robots/sitemap, files served by Vite in dev have no security headers anymore. Ref: audi6 `middleware/securityHeaders.ts`, `middleware/cacheControl.ts`.

### #12 Memoize fetches per request (dropped)

Measured the GraphQL requests of 7 page types, each normally and in the site preview (which bypasses the fetch cache): every request ran exactly once per page request (2–4 per page). The duplicates of the Next.js site came from `generateMetadata` and the page loading the same data, which Next.js memoized; with the metadata rendered in the page component, they're gone. Concurrent identical requests are already de-duplicated by the fetch cache. If duplicates appear later, use React's `cache()`, which is scoped to the render in the RSC environment, instead of a custom memo. Ref: audi6 `requestContext.ts` (`fetchMemo`).

## Navigation

### #13 Replace global click interception with a `Link` component and router API (done)

`framework/entry.browser.tsx` intercepted clicks on every `<a>`, with a path list for the exceptions (`/dam/`, `/api/`), so every non-page link outside that list needed a full page load as fallback. Now client navigation is opt-in: `framework/Link.tsx` renders an `<a>` and navigates on the client for plain left clicks on same-origin links (`isClientNavigationClick`; modifier keys, `target`, `download`, other origins and hash changes on the current page stay with the browser), `useRouter()` from `framework/RouterProvider.tsx` offers `push`/`replace`/`refresh` (with `scroll: false`). The demo's internal links use `Link`; DAM files, external links, skip links and the error page stay plain `<a>`. Verified in dev and production: navigation, back/forward and redirects keep the page, plain `<a>` and Ctrl+click load the page in the browser. Ref: audi6 `framework/Link.tsx`, `navigation.tsx`.

### #14 Add abort, pending state, scroll restoration, route announcer (done, prefetch deferred)

Measured before: superseded navigations kept loading, and when one failed, its full page load fallback opened the page the user had left; back from a short page to a long one ended at the short page's height (the browser restored the position on `popstate`, before the page was rendered); no feedback while loading; nothing announced to screen readers, focus stayed on the clicked link. Now `entry.browser.tsx` aborts superseded navigations (not after the payload is displayed, as it may still stream), stores the scroll position per history entry (`framework/scrollPositions.ts`, `history.scrollRestoration = "manual"`, kept in `sessionStorage` for reloads; fragment changes on the current page don't refetch), runs the navigation as a transition with `useNavigationPending()` (the demo shows `layout/NavigationProgress.tsx` after 200 ms; the router moved into the same context), and announces the title of the new page in a live region and moves the focus to the start of the document (`framework/announceNavigation.ts`). Verified in dev and production. **Prefetch deferred**: all pages are dynamic, prefetching costs a server render per link; if navigations feel slow, prefetch on intent only (hover/focus/touchstart on `Link`, ≤30 s, used once, not in the site preview). Ref: React Router `ScrollRestoration`, Next.js `RouteAnnouncer`.

### #37 Stream the RSC payload with Next.js-style fallbacks (option D) (deferred)

`renderPage` buffers the complete RSC payload, so that `notFound()`, `redirect()` and render errors anywhere in the tree can still set the status and `no-store` (#1, #2, #6); SSR streams, but only gets the complete payload. Measured: the time to first byte equals the total time, Suspense fallbacks are never shown. Deferred, not a real issue: the pages are cached by the CDN, so only cache misses wait for the render, and neither the demo nor site-react uses Suspense.

If a project needs it: decide status and headers when React DOM reports the SSR shell and stream the rest, opt-in per page (`renderPage(c, { stream: true })`), as a CDN would cache a page whose late part failed until it revalidates. Late `notFound()`/`redirect()` like Next.js: inject `<meta name="robots" content="noindex">` or a meta refresh, and client boundaries around the page render the not found page or redirect with the router. RSC requests stay buffered (the RSC format has no shell signal), streaming them would answer 200 and rely on the client boundaries, together with #38. Streaming adds React's inline `$RC()` scripts (see #16). Needs the browser tests of #40. Refs: Next.js `app-render.js` + `make-get-server-inserted-html.js`, React Router `server.ssr.js` (redirect transform).

### #38 Answer redirects of RSC requests with a redirect payload instead of 3xx (done)

- Problem: RSC requests got a 3xx that `fetch` followed; `entry.rsc.tsx` rewrote `Location` to keep `/_rsc`. Targets on other origins (e.g. a CMS redirect to an external URL) failed with CSP/CORS → console error → full page load of the redirecting page (two requests). Absolute same-origin targets lost the `/_rsc` prefix (#4).
- Solution: `entry.rsc.tsx` turns every 3xx with `Location` of an RSC request (`redirect()`, middlewares, Hono handlers) into status 200 with the RSC payload `{ redirect: { location } }`, keeping the other headers (e.g. `Set-Cookie`, `Cache-Control`) and adding `noindex`. Redirects without `Cache-Control` or with `Set-Cookie` get `no-store`. `renderPage()` sends its `cacheControl` with redirects too, so redirects of the CMS are cached like pages (HTML and RSC). The browser entry follows it: same origin client-side with `replaceState` (relative to the page, fragment kept like browsers do, at most 20 redirects), other origins and `mailto:`/`tel:` with `location.replace`. `response.redirected` stays for redirects of infrastructure in front of the site.
- Decision: payload instead of a header (React Router: 202 + payload, TanStack Start: 200 + JSON, Waku: 200 + `_location`; Next.js follows middleware redirects with `fetch` and renders `redirect()` as a digest in the stream). Status 200 instead of 202, as CDNs may not cache 202. Redirects are content like pages, so they're cached like them instead of always `no-store`.
- Known limitation: for `mailto:`/`tel:` targets the address bar keeps the URL of the redirecting page, as the browser stays on the current page and the history entry was pushed before the request.
- Refs: React Router `generateRedirectResponse` / `routeRSCServerRequest`, TanStack Start `serverFnFetcher`, Waku `fetchRsc`, Next.js `fetch-server-response.ts`.

### #47 Send an explicit `Cache-Control` with all redirects

HTML redirects without `Cache-Control` leave caching to the defaults of CDNs and browsers (a 301 is cached by browsers indefinitely), RSC requests turn them into `no-store` (#38). `trailingSlashRedirectMiddleware` could take a `cacheControl` option, as its redirects never change. The demo's redirects (`/` → `/en`, `predefinedPages`, `redirectToMainHost`, `/admin`) should set one (`rules/coding-guidelines/cdn.instructions.md`).

### #42 Switch the scroll restoration back to `"auto"` on `pagehide`

Like React Router (`useScrollRestoration`) and TanStack Router (`setupScrollRestoration`): set `history.scrollRestoration = "auto"` on `pagehide` and `"manual"` again on `pageshow` with `persisted`, so the browser restores reloads and returns from other sites natively (it retries until the page is loaded) instead of the early `window.scrollTo()` in `setUpScrollRestoration()`, which can be capped while images or CSS are still loading. Keep the `sessionStorage` positions: after a reload, back to an entry created before it is a same-document traversal that `"manual"` doesn't restore (measured in Chromium).

### #43 Replace the scroll restoration with the Navigation API (revisit 2027)

`navigateEvent.intercept({ handler, scroll: "after-transition" })` lets the browser restore its own positions after the handler's promise resolves, including reloads and fragments, and `focusReset` covers the focus part of `announceNavigation`. That would remove `framework/scrollPositions.ts`, the history keys and the fragment special case. Baseline since January 2026 (Chrome 102, Firefox 147, Safari 26.2), but about 88% of all users in Europe in October 2026 (`caniuse-lite`; iOS Safari < 26.2 is the largest gap) and known WebKit scroll bugs with `intercept`. Revisit when it reaches 93% (browser support rule); a fallback would keep today's code, so adopting it earlier doesn't simplify anything. Neither Next.js, React Router nor TanStack use it yet. Next.js keeps `"auto"` and renders back/forward from its client cache, which fails on cache misses (vercel/next.js#49087, #50105).

## Other

### #15 Make missing or duplicate titles visible instead of a central title fallback (done)

React doesn't de-duplicate `<title>`, so each page has to render its own (`src/layout/DefaultTitle.tsx` for pages without one), which is easy to forget. A central fallback isn't possible cleanly: React writes server-rendered titles in the order it encounters them and inserts client-rendered ones before the existing title, so a fallback would only lose against the page's title when rendered after the content, and every page's HTML would contain two `<title>` elements (invalid HTML). Next.js, React Router and TanStack declare titles at route level with loader data, which doesn't fit pages loading their data inside the server component (see #27). Now `renderPage` reports pages whose HTML doesn't contain exactly one `<title>` during development (`framework/titleCountCheck.ts`), and the pages with data render a real title (news and product detail, product list, not found, error); `DefaultTitle` remains for the news index and the block preview.

### #16 Remove `'unsafe-inline'` for scripts (optional, not a regression)

The old Next.js demo had the identical CSP with `'unsafe-inline'` (Next.js writes its payload as inline `self.__next_f.push()` scripts too). Measured inline scripts: the bootstrap `import()` (`bootstrapScriptContent`) and 9–13 RSC payload chunks (`rsc-html-stream`) per page; JSON-LD data blocks aren't subject to CSP, no React Suspense scripts. A nonce per response (React `nonce`, `injectRSCPayload(…, { nonce })`) conflicts with the CDN caching of public pages (the same nonce would be served to every visitor, the spec requires one per response); hashes need the whole HTML buffered. Preferred: no executable inline scripts, i.e. the browser entry via `bootstrapModules` and the RSC payload as JSON data blocks (`<` escaped) read by the browser entry after `DOMContentLoaded`, then `script-src-elem 'self'` plus the reCAPTCHA hosts. Once #37 streams Suspense boundaries, React's inline `$RC()` scripts need a nonce again.

### #17 Pick up changed persisted queries in dev without restart (done, vivid-planet/dextinity#6860)

`persistedQueryRoute` (site-react) loads `dist/persisted-queries.json` once per process. Reproduced: a changed query answers `PersistedQueryNotFound` until restart, a changed fragment is silently sent in its old version. Not caused by the migration, `@dextinity/site-nextjs/server` re-exports the same route. Fixed in site-react in vivid-planet/dextinity#6860 (reload when the file's modification time changes, outside production), picked up with the merge of `main`. Its loader fix, removing earlier versions of a changed fragment, is ported to the Vite plugin.

### #18 Add unit tests and HTTP tests against a test app for the framework code (done)

- Unit tests (Vitest, `pnpm test:unit`): `framework/navigation.ts`, `framework/rscRequest.ts`, `framework/requestContext.ts`, `util/fetchCache.ts` (store mocked). Each fix adds its unit tests here (#3, #7, #39).
- HTTP tests (Playwright `request` fixture, no browser, `pnpm test:e2e`, CI job "Test (e2e)"): `e2e/fixture/` is a test app that runs the real framework entries with its own Hono routes (`@src/handler` aliased in `e2e/fixture/vite.config.ts`), against the dev server and the production build (`vite preview`). Covers rendering, request context, `/_rsc`, navigation errors (#1) and error handling (#2). Add a route to `e2e/fixture/handler.tsx` and a test per fix (#3, #4, #6, #38, #39).
- Still open: router path splitting and sitemap/robots output (need the demo's API), see also #40.
- Ref: plugin-rsc `e2e/fixture.ts` (`useFixture` with dev/build modes).

### #40 Add browser tests against the test app (done)

Playwright with Chromium against the test app (`e2e/fixture/`, `/pages/:name` with links, router controls and long content), in dev and in the production build, in the CI job "Test (e2e)": hydration, `Link` vs. plain `<a>`, modifier clicks and `target`, `useRouter()`, title, announcement and focus, back/forward, pending state and abort, not found page (#1/#13/#14), redirects including other origins, cookies and loops (#38), `GlobalErrorBoundary` fallback and reset (#2), scroll restoration including `scroll={false}`, fragments and reload (#14). Every error in the browser fails a test unless it allows it. With an empty Vite cache (always in CI), dev discovered the dependencies of `@dextinity/site-react` only after the first page load and reloaded it, the test app pre-bundles `site-react` (`optimizeDeps.include`, see #50). Firefox and WebKit later, once the tests are stable; CSP violations with #16.

### #48 Add browser smoke tests against the demo

A few tests against the real demo site (needs Docker and the API, so run manually or nightly, not in the regular CI job): pages render without errors, client navigation, site preview in the admin.

### #50 Avoid the reload after the first page load in dev

With an empty Vite cache, the first page in dev is loaded twice: the scanner only crawls `entry.browser.js`, client components are loaded at runtime through the RSC payload, and as `dextinitySite()` excludes `@dextinity/site-vite-rsc` from pre-bundling (plugin-rsc has to transform its `"use client"` files), the dependencies of `@dextinity/site-react` are found late ("optimized dependencies changed. reloading"). The test app includes `@dextinity/site-vite-rsc > @dextinity/site-react` in `optimizeDeps`. For projects, `dextinitySite()` could do the same for the client environment, but in this monorepo the linked `site-react` would then be pre-bundled and stale while working on it with the demo running. Decide whether to do it only for installed packages, or to add the project's `"use client"` files to `optimizeDeps.entries` (measured during #10 in the demo).

### #41 Fix back navigation to a full page load in dev

In dev, back to a page that was left with a full page load (e.g. a plain `<a>`) breaks the page: Chrome takes the response of the SSR stylesheet `<link>` for `*.module.scss` from the cache for the JS module import of the same URL ("Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/css""), a client component fails to load, and the error boundary renders. Pre-existing, dev only, production works. Check which URLs plugin-rsc injects for CSS in dev (Vite itself requests CSS links with `?direct`) and whether a `Vary: Accept` or a distinct URL fixes it.

### #39 Only allow http(s), mailto, tel and relative redirect targets (done)

Redirect targets also come from the CMS (external link `targetUrl` of redirect entries, Link documents). Since the browser performs redirects itself (#38), a `javascript:` URL would execute. `redirect()` throws for other protocols (allowlist like TanStack Start, instead of React Router's denylist `hasInvalidProtocol`), `entry.rsc.tsx` answers redirects of Hono handlers to them with 500, the browser entry checks the payload again.

### #49 Name the route files without Next.js conventions (done)

The route files kept the folder structure of Next.js' app router (`src/app/[language]/news/[slug]/NewsDetailPage.tsx`, `route.ts`), which suggests file-based routing, while the routes are only defined in `src/routes/router.tsx`. Now they're in `src/routes/` and grouped by feature without params in the paths, e.g. `news/NewsDetailPage.tsx`, `blockPreview/`, `mails/`, `api/contactFormRoute.tsx`, `damRoute.ts`, and named after what they export.

### #36 Rewrite the description of [vivid-planet/dextinity#6779](https://github.com/vivid-planet/dextinity/pull/6779) (done)

The description generated by the Claude Code UI didn't follow `AGENTS.md` (restated the diff, example code didn't match the router) and described the state before the package. Rewritten per `.github/pull_request_template.md`, with independence from Next.js as the motive; the title keeps `[PoC]`.

## Library `@dextinity/site-vite-rsc`

Counterpart to `@dextinity/site-nextjs`: re-exports `@dextinity/site-react` and adds the Vite/RSC/Hono specific parts, so projects mainly swap the import.

### #19 Decide the open design questions (done)

1. **Hono** is a `peerDependency`: the library exports `renderPage(c, …)` and its middlewares as Hono middlewares; the entries only need `{ fetch(request) }` from the project's app.
2. **Request context**: `visibility` and `sitePreview` exist for every site and belong to the library (context, middleware, `getVisibility()`/`getSitePreview()` or similar). The scope (e.g. `domain`) is project-specific: a site may have a single domain without it in the scope, or name it differently. The project resolves its scope in its own middleware and stores it in the context via a typed slot (module augmentation of an interface like `RequestContextData`, as Hono's `ContextVariableMap`); the preview scope from the JWT is passed through untyped.
3. **Versions**: `@vitejs/plugin-rsc` is an exact `dependency` of the library (upgrades come with library releases); `react`, `react-dom`, `react-server-dom-webpack` and `vite` are `peerDependencies`. Projects pin `react-server-dom-webpack` to exactly their React version (plugin-rsc 0.5.38 vendors 19.3.1, which the demo uses since the merge of `main`); optionally warn at startup when they differ.
4. **Packaging** lives in the plugin preset (#20): remapping `optimizeDeps.include` to `@dextinity/site-vite-rsc > @vitejs/plugin-rsc/…` (and the library's own browser dependencies), excluding the library from `optimizeDeps` and adding it to `ssr.noExternal` so its `"use client"` files are found; the library is built with `tsc` (keeps the directives and `import.meta.env`/`hot`/`viteRsc`, which Vite's library mode would replace). The test app (`e2e/fixture`) moves into the library and tests the published entries.
5. **Server actions** are not supported (documented), no design constraints for them.
6. **Project app**: `dextinitySite({ app: "./src/handler.ts" })` resolves a virtual module (e.g. `virtual:dextinity-site/app`) imported by the library entries.
7. **Split** like `@dextinity/site-nextjs`: the library contains the framework (entries, `renderPage`, router and `Link`, request context, error handling, server, fetch cache) and the Dextinity integrations (site and block preview, persisted queries, GraphQL fetch), and re-exports `@dextinity/site-react`. Routes, layouts, pages, blocks, site configs, redirects and predefined pages stay in the project.

To be checked against audi6 (second consumer, not reachable from the session that decided this) before #20.

### #20 Create the package with a Vite plugin preset (done)

`packages/site/site-vite-rsc`, set up like `site-nextjs`; since #21 built with `tsc` like `mail-react`, as Vite's library mode replaces `import.meta.env.DEV` and removes `import.meta.hot`. Published from the start (changeset), re-exports `@dextinity/site-react` and exports `dextinitySite({ entries })` from `@dextinity/site-vite-rsc/vite`: `rsc()`, `react()`, `envDir: false`, client `assetsDir: "_assets"`, the `optimizeDeps.include` remapping for plugin-rsc, the package excluded from `optimizeDeps` and in `noExternal` of the server environments (unit tests with Vite's `resolveConfig`). `entries` is temporary, #21 replaces it with `app`. The demo and the test app use the preset; their own settings (alias, mails entry, `prop-types`/`swiper`, persisted queries plugin, see #31) stay in their configs.

### #21 Move the entries and the framework core into the package (done, covers #22, #24, #25, #26 and the core of #23)

The entries import almost all of `src/framework`, and the demo must use the same module instances, so the whole framework moved: `@dextinity/site-vite-rsc` exports `Link`, the router hooks, `notFound()`, `redirect()` and `reportError()`; `@dextinity/site-vite-rsc/server` exports `renderPage()`, `handleError`, `trailingSlashRedirectMiddleware`, `noStoreCacheControl` and the request context. `dextinitySite({ app })` resolves `virtual:dextinity-site/app` to the project's Hono app. The request context keeps `visibility` and `sitePreview`; the project's scope goes into `setRequestData()`/`getRequestData()`, typed by module augmentation of `RequestContextData` (the demo's `getSiteContext()` in `src/util/siteContext.ts` builds on it). `renderPage()` loads `@vitejs/plugin-rsc/rsc/server` on use, as it only works in Vite's RSC environment and middlewares importing `./server` must work in unit tests. The unit tests and the HTTP test app moved into the package; CI builds the package before `test:e2e`.

### #27 Add a `Metadata` component (done)

`Metadata` (`@dextinity/site-vite-rsc`) renders description, robots, canonical, alternate links and the Open Graph tags with flat props named like the CMS SEO block, and resolves relative URLs against `baseUrl`, as crawlers and share previews need absolute URLs (replaces `src/util/absoluteUrl.ts` from #7). The `<title>` stays separate. Only the CMS pages (`Page.tsx`) use it; their head tags are unchanged.

### #28 Move the server into the package (done)

`createRequestListener({ dev, server })` (`@dextinity/site-vite-rsc/node`), the counterpart to Next.js' `getRequestHandler()`: Vite in middleware mode with HMR on the project's server during development, the build in `dist/rsc` with compression in production. Like the Next.js site, the project keeps its `server.ts` with tracing (loaded before `node:http`), metrics, the CDN origin check and `listen`. `staticFilesMiddleware` (cache durations tied to the preset's `_assets`) and `errorResponseCacheControlMiddleware` moved into `@dextinity/site-vite-rsc/server`, the security headers stay in the project, their values are project-specific.

### #29 Move the fetch cache into the package (done)

The Next.js site cached with Next.js and attached Valkey through a project-level `cache-handler.ts` copied into every project. Now `@dextinity/site-vite-rsc/server` exports `createCachingFetch(fetch, { revalidateInSeconds, store })` (stale-while-revalidate, identical concurrent requests merged, no caching of errors), the `FetchCacheStore` interface, `createMemoryFetchCacheStore()` (LRU) and `createValkeyFetchCacheStore({ connection, fallback })` (ioredis, uses `fallback` while Valkey is unavailable). The metrics keep their names (`fetchcache.get.hit/miss/fallback`, `fetchcache.set`, `fetchcache.get.age`) and are recorded with `@opentelemetry/api` (meter `@dextinity/site-vite-rsc`, was `nestjs-otel`). The demo only configures the store from its `VALKEY_*` variables (`src/util/fetchCacheStore.ts`). `CACHE_HANDLER_DEBUG` logging was dropped.

### #30 Add a server GraphQL fetch (done)

`createServerGraphQLFetch({ url, headers, cache })` (`@dextinity/site-vite-rsc/server`) creates one GraphQL fetch for the whole site. Each query reads the visibility of the current request, sends the API's preview headers in the site and block preview (`invisiblePages` → `Pages:Unpublished`, `invisibleBlocks` → also `Blocks:Invisible`) and bypasses the fetch cache there, so editors always see the current content (the Next.js site rendered the site preview in draft mode); published content goes through `createCachingFetch()`. The demo exports the instance as `graphQLFetch` from `src/util/graphQLClient.ts` instead of the `createGraphQLFetch()` factory called in every component. The middlewares keep `createGraphQLFetchMiddleware()` without preview and fetch cache, they cache their results themselves.

### #31 Move the persisted queries Vite plugin into the package (done)

`persistedQueriesPlugin({ persistedQueriesPath, include })` (`@dextinity/site-vite-rsc/vite`) replaces the queries in client code with their hashes and writes the hash file for the BFF route (`persistedQueryRoute()` from `@dextinity/site-react`). It's a separate plugin instead of part of `dextinitySite()`, as not every site uses persisted queries. Its logic stays separate from site-react's webpack loader, which is bound to webpack's loader API. #17 also fixed the webpack loader for changed fragments, the same fix is in the plugin.

### #32 Render `SitePreviewProvider` in `renderPage()` (done)

In the admin's site preview, `SitePreviewProvider` marks the page as site preview for the blocks (`ExternalLinkBlock` sends external links to the admin, `CookieSafe` shows embeds without consent) and reports the location to the admin on each navigation. The old Next.js demo rendered `SitePreviewProvider` from site-nextjs in its domain layout in draft mode; through the middleware rewrite, that covered every page and its 404, but not Next.js' error page. The Vite demo had a copy, rendered in `LanguageLayout`, so the root 404 (e.g. `/de`) lost it. Now `renderPage()` wraps every page it renders (page, 404, 500) when `getSitePreview()` is set; the provider isn't exported, and projects only set the site preview in their middleware (#34). Copied from site-nextjs instead of shared through site-react, as only the router hooks differ.

### #44 Make error reporting configurable

`reportError()` (now in the package) only logs; projects used to edit it to report to an error tracking service (e.g. Sentry). Add a way to set the reporter, e.g. an option or `setErrorReporter()`, used by `renderPage`, `handleError`, `GlobalErrorBoundary` and the SSR entry. The fallback texts of `GlobalErrorBoundary` are English, as it replaces the document outside of the site's providers.

### #21–#32 Move into the package

| #   | What                                                                                                                                                 | From (demo/site)                                                    | Blocked by          |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------- |
| 21  | RSC, SSR and browser entries (project only provides its Hono app, via the `app` option, #19.6)                                                       | `src/framework/entry.{rsc,ssr,browser}.tsx`                         | done (#21)          |
| 22  | `/_rsc` prefix handling                                                                                                                              | `src/framework/rscRequest.ts`, `entry.rsc.tsx`                      | done (#21)          |
| 23  | Request context core (request, isRsc, cookies, visibility, site preview, typed slot for the project's scope, #19.2)                                  | `src/framework/requestContext.ts`                                   | done (#21, #34)     |
| 24  | `renderPage`, `notFound()`, `redirect()`                                                                                                             | `src/framework/render.tsx`, `navigation.ts`                         | done (#21)          |
| 25  | Router hooks + `Link` + `useRouter`                                                                                                                  | `src/framework/RouterProvider.tsx`, `Link.tsx`                      | done (#21)          |
| 26  | Error boundary, error and not found handling                                                                                                         | (from #2)                                                           | done (#21), see #44 |
| 27  | `Metadata` component with base URL resolution, replaces `absoluteUrl`                                                                                | inline in `src/documents/pages/Page.tsx`, `src/util/absoluteUrl.ts` | done (#27)          |
| 28  | Production and dev server (`createServer({ staticDir, securityHeaders, cdnOriginCheckSecret })`, Vite middleware mode in dev, metrics/tracing hooks) | `server.ts`                                                         | done (#28)          |
| 29  | Fetch cache (store interface, Valkey/LRU, stale-while-revalidate, metrics)                                                                           | `src/util/fetchCache.ts`, `fetchCacheStore.ts`                      | done (#29)          |
| 30  | `createServerGraphQLFetch({ url, headers })` reading visibility from the context                                                                     | `src/util/graphQLClient.ts`                                         | done (#30)          |
| 31  | Persisted queries Vite plugin (counterpart to site-react's webpack loader)                                                                           | `vitePersistedQueriesPlugin.ts`                                     | done (#31)          |
| 32  | `SitePreviewProvider`                                                                                                                                | `src/util/SitePreviewProvider.tsx`                                  | done (#32)          |

### #45 Move the CDN origin check into a middleware

`server.ts` still compares the `x-cdn-origin-check` header with `CDN_ORIGIN_CHECK_SECRET` itself (403 without the right header, copied from the Next.js site), so every project copies it. Move it into a Hono middleware in `@dextinity/site-vite-rsc/server`, e.g. `cdnOriginCheckMiddleware({ secret })`, registered first in the project's app so it also covers the static files served by `staticFilesMiddleware` in production (during development Vite serves its files before the app, where the check isn't needed). Compare in constant time (`crypto.timingSafeEqual`) instead of `!==`. Then `server.ts` only keeps tracing, metrics and `listen`.

## Library `@dextinity/site-react` (framework-independent, also usable by site-nextjs; needs changesets)

### #33 Add `PixelImageBlock` and a responsive `Image` with srcset (done, in site-vite-rsc)

The Next.js site rendered DAM images with site-nextjs' `PixelImageBlock` on `next/image`, which took the widths from `next.config`; site-react's `Image` has no srcset and its video blocks need `renderPreviewImage`, so the Vite demo had its own copies. Added to `@dextinity/site-vite-rsc` instead of site-react, like site-nextjs: `Image` (srcset with next/image's width selection, lazy loading, `placeholderColor`, `fill`, `preload` for the LCP image with React's `preload()`), `PixelImageBlock` on it, `VideoPreviewImage`, and `DamVideoBlock`, `YouTubeVideoBlock` and `VimeoVideoBlock` with an optional `renderPreviewImage`; they replace the site-react exports of the same name. The widths must be the ones the API resizes to, so `ImageConfigProvider` with `images` of `dextinity-config.json` is required in the root layout, without it the images throw. The styles are inline, as the package is built with `tsc`, which can't ship CSS modules. The demo's server-rendered image tags are unchanged apart from the styles. The package now generates its block types like site-nextjs and type-checks with `Bundler` resolution, as site-react's declarations use extensionless imports, which `NodeNext` doesn't resolve, so most site-react types were `any` in the package.

### #34 Move the site preview handling into the package (done, in site-vite-rsc, completes #23)

The demo had a Hono port of site-nextjs' `sitePreviewRoute` and `previewParams()` (`src/util/sitePreview.ts`, `src/app/site-preview/route.ts`): JWT verification with `SITE_PREVIEW_SECRET`, the `__dextinity_site_preview` cookie, the open-redirect check and reading the `x-block-preview` header. Added to `@dextinity/site-vite-rsc/server` instead of site-react, like #33: `sitePreviewRoute` starts the site preview, `sitePreviewMiddleware` sets the visibility, the site preview and the preview scope of each request, `getPreviewScope()` returns the scope. The secret stays in `SITE_PREVIEW_SECRET`, like site-nextjs. The project only resolves its site from the scope (`siteContextMiddleware`), `jose` moved from the demo into the package.

### #35 Add sitemap and robots helpers (done, in site-vite-rsc)

The Next.js site returned `MetadataRoute.Sitemap`/`Robots` objects from `sitemap.ts`/`robots.ts` and Next.js rendered them; the Vite demo rendered them itself, without hreflang alternates, images, videos or `Date` values. `sitemapResponse()` and `robotsResponse()` (`@dextinity/site-vite-rsc/server`) take the same shapes and render them like Next.js (output compared with Next.js' `resolveSitemap`/`resolveRobots`), but escape the values, which Next.js doesn't. The demo's `sitemap()` is the old Next.js function again; querying the page tree stays in the project, as it depends on its documents.
