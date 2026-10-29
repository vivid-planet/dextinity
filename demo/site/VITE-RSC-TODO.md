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

### #12 Memoize fetches per request (dropped)

Measured the GraphQL requests of 7 page types, each normally and in the site preview (which bypasses the fetch cache): every request ran exactly once per page request (2–4 per page). The duplicates of the Next.js site came from `generateMetadata` and the page loading the same data, which Next.js memoized; with the metadata rendered in the page component, they're gone. Concurrent identical requests are already de-duplicated by the fetch cache. If duplicates appear later, use React's `cache()`, which is scoped to the render in the RSC environment, instead of a custom memo. Ref: audi6 `requestContext.ts` (`fetchMemo`).

## Navigation

### #13 Replace global click interception with a `Link` component and router API (done)

`framework/entry.browser.tsx` intercepted clicks on every `<a>`, with a path list for the exceptions (`/dam/`, `/api/`), so every non-page link outside that list needed a full page load as fallback. Now client navigation is opt-in: `framework/Link.tsx` renders an `<a>` and navigates on the client for plain left clicks on same-origin links (`isClientNavigationClick`; modifier keys, `target`, `download`, other origins and hash changes on the current page stay with the browser), `useRouter()` from `framework/RouterProvider.tsx` offers `push`/`replace`/`refresh` (with `scroll: false`). The demo's internal links use `Link`; DAM files, external links, skip links and the error page stay plain `<a>`. Verified in dev and production: navigation, back/forward and redirects keep the page, plain `<a>` and Ctrl+click load the page in the browser. Ref: audi6 `framework/Link.tsx`, `navigation.tsx`.

### #14 Add abort, pending state, scroll restoration, route announcer (done, prefetch deferred)

Measured before: superseded navigations kept loading, and when one failed, its full page load fallback opened the page the user had left; back from a short page to a long one ended at the short page's height (the browser restored the position on `popstate`, before the page was rendered); no feedback while loading; nothing announced to screen readers, focus stayed on the clicked link. Now `entry.browser.tsx` aborts superseded navigations (not after the payload is displayed, as it may still stream), stores the scroll position per history entry (`framework/scrollPositions.ts`, `history.scrollRestoration = "manual"`, kept in `sessionStorage` for reloads; fragment changes on the current page don't refetch), runs the navigation as a transition with `useNavigationPending()` (the demo shows `layout/NavigationProgress.tsx` after 200 ms; the router moved into the same context), and announces the title of the new page in a live region and moves the focus to the start of the document (`framework/announceNavigation.ts`). Verified in dev and production. **Prefetch deferred**: all pages are dynamic, prefetching costs a server render per link; if navigations feel slow, prefetch on intent only (hover/focus/touchstart on `Link`, ≤30 s, used once, not in the site preview). Ref: React Router `ScrollRestoration`, Next.js `RouteAnnouncer`.

### #37 Stream the RSC payload with Next.js-style fallbacks (option D)

TODO in `framework/render.tsx` (`renderRscPayload`). Needed once pages use Suspense: decide the status only up to the SSR shell, afterwards inject `noindex` meta for not found and meta refresh for redirects, error boundaries around layouts (not found in place, client-side redirect). Public `notFound()`/`redirect()` API stays. Refs: Next.js `app-render.js` + `make-get-server-inserted-html.js`, React Router `server.ssr.js` (redirect transform).

### #38 Answer redirects of RSC requests with a redirect payload instead of 3xx

Today RSC requests get a 3xx that `fetch` follows; `entry.rsc.tsx` rewrites `Location` to keep `/_rsc`. External targets fail with CORS → console error → full page load (target requested twice). Turn every 3xx of an RSC request (renderPage, middlewares, Hono handlers) into status 202 + payload `{ type: "redirect", location, status }` with `no-store`; `RscPayload` becomes a union; the browser entry navigates (same origin client-side with `replaceState`, else `location.assign`). Makes #4 obsolete. Depends on #39. Ref: React Router `generateRedirectResponse` / `routeRSCServerRequest`.

### #42 Switch the scroll restoration back to `"auto"` on `pagehide`

Like React Router (`useScrollRestoration`) and TanStack Router (`setupScrollRestoration`): set `history.scrollRestoration = "auto"` on `pagehide` and `"manual"` again on `pageshow` with `persisted`, so the browser restores reloads and returns from other sites natively (it retries until the page is loaded) instead of the early `window.scrollTo()` in `setUpScrollRestoration()`, which can be capped while images or CSS are still loading. Keep the `sessionStorage` positions: after a reload, back to an entry created before it is a same-document traversal that `"manual"` doesn't restore (measured in Chromium).

### #43 Replace the scroll restoration with the Navigation API (revisit 2027)

`navigateEvent.intercept({ handler, scroll: "after-transition" })` lets the browser restore its own positions after the handler's promise resolves, including reloads and fragments, and `focusReset` covers the focus part of `announceNavigation`. That would remove `framework/scrollPositions.ts`, the history keys and the fragment special case. Baseline since January 2026 (Chrome 102, Firefox 147, Safari 26.2), but about 88% of all users in Europe in October 2026 (`caniuse-lite`; iOS Safari < 26.2 is the largest gap) and known WebKit scroll bugs with `intercept`. Revisit when it reaches 93% (browser support rule); a fallback would keep today's code, so adopting it earlier doesn't simplify anything. Neither Next.js, React Router nor TanStack use it yet. Next.js keeps `"auto"` and renders back/forward from its client cache, which fails on cache misses (vercel/next.js#49087, #50105).

## Other

### #15 Make missing or duplicate titles visible instead of a central title fallback (done)

React doesn't de-duplicate `<title>`, so each page has to render its own (`src/layout/DefaultTitle.tsx` for pages without one), which is easy to forget. A central fallback isn't possible cleanly: React writes server-rendered titles in the order it encounters them and inserts client-rendered ones before the existing title, so a fallback would only lose against the page's title when rendered after the content, and every page's HTML would contain two `<title>` elements (invalid HTML). Next.js, React Router and TanStack declare titles at route level with loader data, which doesn't fit pages loading their data inside the server component (see #27). Now `renderPage` reports pages whose HTML doesn't contain exactly one `<title>` during development (`framework/titleCountCheck.ts`), and the pages with data render a real title (news and product detail, product list, not found, error); `DefaultTitle` remains for the news index and the block preview.

### #16 Remove `'unsafe-inline'` for scripts (optional, not a regression)

The old Next.js demo had the identical CSP with `'unsafe-inline'` (Next.js writes its payload as inline `self.__next_f.push()` scripts too). Measured inline scripts: the bootstrap `import()` (`bootstrapScriptContent`) and 9–13 RSC payload chunks (`rsc-html-stream`) per page; JSON-LD data blocks aren't subject to CSP, no React Suspense scripts. A nonce per response (React `nonce`, `injectRSCPayload(…, { nonce })`) conflicts with the CDN caching of public pages (the same nonce would be served to every visitor, the spec requires one per response); hashes need the whole HTML buffered. Preferred: no executable inline scripts, i.e. the browser entry via `bootstrapModules` and the RSC payload as JSON data blocks (`<` escaped) read by the browser entry after `DOMContentLoaded`, then `script-src-elem 'self'` plus the reCAPTCHA hosts. Once #37 streams Suspense boundaries, React's inline `$RC()` scripts need a nonce again.

### #17 Pick up changed persisted queries in dev without restart (separate PR against `main`)

`persistedQueryRoute` (site-react) loads `dist/persisted-queries.json` once per process. Reproduced: a changed query answers `PersistedQueryNotFound` until restart, a changed fragment is silently sent in its old version. Not caused by the migration, `@dextinity/site-nextjs/server` re-exports the same route. Fixed in site-react in a separate pull request against `main` (reload when the file's modification time changes, outside production); pick it up here with the next merge of `main`.

### #18 Add unit tests and HTTP tests against a test app for the framework code (done)

- Unit tests (Vitest, `pnpm test:unit`): `framework/navigation.ts`, `framework/rscRequest.ts`, `framework/requestContext.ts`, `util/fetchCache.ts` (store mocked). Each fix adds its unit tests here (#3, #7, #39).
- HTTP tests (Playwright `request` fixture, no browser, `pnpm test:e2e`, CI job "Test (e2e)"): `e2e/fixture/` is a test app that runs the real framework entries with its own Hono routes (`@src/handler` aliased in `e2e/fixture/vite.config.ts`), against the dev server and the production build (`vite preview`). Covers rendering, request context, `/_rsc`, navigation errors (#1) and error handling (#2). Add a route to `e2e/fixture/handler.tsx` and a test per fix (#3, #4, #6, #38, #39).
- Still open: router path splitting and sitemap/robots output (need the demo's API), see also #40.
- Ref: plugin-rsc `e2e/fixture.ts` (`useFixture` with dev/build modes).

### #40 Add browser tests against the test app

Playwright with a browser against the same test app (`e2e/fixture/`): client navigation without full reload, title/meta update, back/forward, hydration without console errors, navigation to a 404/redirect (full load, final URL, #1/#4/#38), `GlobalErrorBoundary` fallback and reset (#2). `Link` vs. plain `<a>` (#13), abort, scroll restoration incl. fragments and reload, pending state, announcement and focus (#14, scenarios as measured there) and later CSP violations (#16). CI needs `playwright install chromium-headless-shell` like the Storybook job. Optionally also a few smoke tests against the real demo (needs Docker + API, run manually or nightly). With an empty Vite cache (always in CI), dev discovers dependencies of client components late and reloads the page ("Outdated Optimize Dep"); if that makes the tests flaky, add the `"use client"` files to `environments.client.optimizeDeps.entries` (measured during #10: removes the reload).

### #41 Fix back navigation to a full page load in dev

In dev, back to a page that was left with a full page load (e.g. a plain `<a>`) breaks the page: Chrome takes the response of the SSR stylesheet `<link>` for `*.module.scss` from the cache for the JS module import of the same URL ("Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/css""), a client component fails to load, and the error boundary renders. Pre-existing, dev only, production works. Check which URLs plugin-rsc injects for CSS in dev (Vite itself requests CSS links with `?direct`) and whether a `Vary: Accept` or a distinct URL fixes it.

### #39 Only allow http(s) and relative redirect targets

Redirect targets also come from the CMS (external link `targetUrl` of redirect entries, Link documents). Once the browser performs redirects itself (#38), a `javascript:` URL would execute. Validate in `redirect()` (`framework/navigation.ts`) and when creating the redirect payload. Ref: React Router `hasInvalidProtocol`.

### #36 Rewrite the description of [vivid-planet/dextinity#6779](https://github.com/vivid-planet/dextinity/pull/6779)

The description generated by the Claude Code UI doesn't follow `AGENTS.md` (restates the diff, example code doesn't match the router). Rewrite per `.github/pull_request_template.md`.

## Library `@dextinity/site-vite-rsc`

Counterpart to `@dextinity/site-nextjs`: re-exports `@dextinity/site-react` and adds the Vite/RSC/Hono specific parts, so projects mainly swap the import.

### #19 Decide the open design questions (done)

1. **Hono** is a `peerDependency`: the library exports `renderPage(c, …)` and its middlewares as Hono middlewares; the entries only need `{ fetch(request) }` from the project's app.
2. **Request context**: `visibility` and `sitePreview` exist for every site and belong to the library (context, middleware, `getVisibility()`/`getSitePreview()` or similar). The scope (e.g. `domain`) is project-specific: a site may have a single domain without it in the scope, or name it differently. The project resolves its scope in its own middleware and stores it in the context via a typed slot (module augmentation of an interface like `RequestContextData`, as Hono's `ContextVariableMap`); the preview scope from the JWT is passed through untyped.
3. **Versions**: `@vitejs/plugin-rsc` is an exact `dependency` of the library (upgrades come with library releases); `react`, `react-dom`, `react-server-dom-webpack` and `vite` are `peerDependencies`. Projects pin `react-server-dom-webpack` to exactly their React version (plugin-rsc 0.5.38 vendors 19.3.1, the demo uses React 19.3.0); optionally warn at startup when they differ.
4. **Packaging** lives in the plugin preset (#20): remapping `optimizeDeps.include` to `@dextinity/site-vite-rsc > @vitejs/plugin-rsc/…` (and the library's own browser dependencies), excluding the library from `optimizeDeps` and adding it to `ssr.noExternal` so its `"use client"` files are found; the library is built with `tsc` (keeps the directives and `import.meta.env`/`hot`/`viteRsc`, which Vite's library mode would replace). The test app (`e2e/fixture`) moves into the library and tests the published entries.
5. **Server actions** are not supported (documented), no design constraints for them.
6. **Project app**: `dextinitySite({ app: "./src/handler.ts" })` resolves a virtual module (e.g. `virtual:dextinity-site/app`) imported by the library entries.
7. **Split** like `@dextinity/site-nextjs`: the library contains the framework (entries, `renderPage`, router and `Link`, request context, error handling, server, fetch cache) and the Dextinity integrations (site and block preview, persisted queries, GraphQL fetch), and re-exports `@dextinity/site-react`. Routes, layouts, pages, blocks, site configs, redirects and predefined pages stay in the project.

To be checked against audi6 (second consumer, not reachable from the session that decided this) before #20.

### #20 Create the package with a Vite plugin preset (done)

`packages/site/site-vite-rsc`, set up like `site-nextjs`; since #21 built with `tsc` like `mail-react`, as Vite's library mode replaces `import.meta.env.DEV` and removes `import.meta.hot`. Published from the start (changeset), re-exports `@dextinity/site-react` and exports `dextinitySite({ entries })` from `@dextinity/site-vite-rsc/vite`: `rsc()`, `react()`, `envDir: false`, client `assetsDir: "_assets"`, the `optimizeDeps.include` remapping for plugin-rsc, the package excluded from `optimizeDeps` and in `noExternal` of the server environments (unit tests with Vite's `resolveConfig`). `entries` is temporary, #21 replaces it with `app`. The demo and the test app use the preset; their own settings (alias, mails entry, `prop-types`/`swiper`, persisted queries plugin until #31) stay in their configs.

### #21 Move the entries and the framework core into the package (done, covers #22, #24, #25, #26 and the core of #23)

The entries import almost all of `src/framework`, and the demo must use the same module instances, so the whole framework moved: `@dextinity/site-vite-rsc` exports `Link`, the router hooks, `notFound()`, `redirect()` and `reportError()`; `@dextinity/site-vite-rsc/server` exports `renderPage()`, `handleError`, `trailingSlashRedirectMiddleware`, `noStoreCacheControl` and the request context. `dextinitySite({ app })` resolves `virtual:dextinity-site/app` to the project's Hono app. The request context keeps `visibility` and `sitePreview`; the project's scope goes into `setRequestData()`/`getRequestData()`, typed by module augmentation of `RequestContextData` (the demo's `getSiteContext()` in `src/util/siteContext.ts` builds on it). `renderPage()` loads `@vitejs/plugin-rsc/rsc/server` on use, as it only works in Vite's RSC environment and middlewares importing `./server` must work in unit tests. The unit tests and the HTTP test app moved into the package; CI builds the package before `test:e2e`.

### #44 Make error reporting configurable

`reportError()` (now in the package) only logs; projects used to edit it to report to an error tracking service (e.g. Sentry). Add a way to set the reporter, e.g. an option or `setErrorReporter()`, used by `renderPage`, `handleError`, `GlobalErrorBoundary` and the SSR entry. The fallback texts of `GlobalErrorBoundary` are English, as it replaces the document outside of the site's providers.

### #21–#32 Move into the package

| #   | What                                                                                                                                                 | From (demo/site)                                                    | Blocked by                                   |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------- |
| 21  | RSC, SSR and browser entries (project only provides its Hono app, via the `app` option, #19.6)                                                       | `src/framework/entry.{rsc,ssr,browser}.tsx`                         | done (#21)                                   |
| 22  | `/_rsc` prefix handling                                                                                                                              | `src/framework/rscRequest.ts`, `entry.rsc.tsx`                      | done (#21)                                   |
| 23  | Request context core (request, isRsc, cookies, visibility, site preview, typed slot for the project's scope, #19.2)                                  | `src/framework/requestContext.ts`                                   | core done (#21), preview resolution: #32/#34 |
| 24  | `renderPage`, `notFound()`, `redirect()`                                                                                                             | `src/framework/render.tsx`, `navigation.ts`                         | done (#21)                                   |
| 25  | Router hooks + `Link` + `useRouter`                                                                                                                  | `src/framework/RouterProvider.tsx`, `Link.tsx`                      | done (#21)                                   |
| 26  | Error boundary, error and not found handling                                                                                                         | (from #2)                                                           | done (#21), see #44                          |
| 27  | `Metadata` component with base URL resolution, replaces `absoluteUrl`                                                                                | inline in `src/documents/pages/Page.tsx`, `src/util/absoluteUrl.ts` | #20, #7                                      |
| 28  | Production and dev server (`createServer({ staticDir, securityHeaders, cdnOriginCheckSecret })`, Vite middleware mode in dev, metrics/tracing hooks) | `server.ts`                                                         | #20, #11                                     |
| 29  | Fetch cache (store interface, Valkey/LRU, stale-while-revalidate, metrics)                                                                           | `src/util/fetchCache.ts`, `fetchCacheStore.ts`                      | #20, #12                                     |
| 30  | `createServerGraphQLFetch({ url, headers })` reading visibility from the context                                                                     | `src/util/graphQLClient.ts`                                         | #29                                          |
| 31  | Persisted queries Vite plugin (counterpart to site-react's webpack loader)                                                                           | `vitePersistedQueriesPlugin.ts`                                     | #20, #17                                     |
| 32  | `SitePreviewProvider`                                                                                                                                | `src/util/SitePreviewProvider.tsx`                                  | #25                                          |

## Library `@dextinity/site-react` (framework-independent, also usable by site-nextjs; needs changesets)

### #33 Add `PixelImageBlock` and a responsive `Image` with srcset

Exists twice today (site-nextjs on `next/image`, demo in `src/common/blocks/PixelImageBlock.tsx`); site-react's `Image` has no srcset. Make `VideoPreviewImage` and the video blocks use it by default so `renderPreviewImage` becomes optional again (removes `src/common/helpers/VideoPreviewImage.tsx`). Ref: audi6 `framework/image/Image.tsx` (next/image width algorithm, blur placeholder, `priority`).

### #34 Add framework-independent site preview server helpers

From `src/util/sitePreview.ts` and `src/app/site-preview/route.ts`: JWT verification, cookie, `sitePreviewRoute(request)`, `getPreviewParams(request)` on standard Request/Response in `@dextinity/site-react/server`. site-nextjs could build on it. Ref: audi6 `framework/sitePreview.ts`.

### #35 Add sitemap and robots helpers

From `src/app/sitemap.ts` and `src/app/robots.ts`: generate `sitemap.xml`/`robots.txt` as `Response`. Ref: audi6 `framework/metadataRoutes.ts`.
