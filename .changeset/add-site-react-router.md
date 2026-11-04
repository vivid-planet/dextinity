---
"@dextinity/site-react-router": minor
---

Add `@dextinity/site-react-router`, the site package for React Router with React Server Components

It's the counterpart of `@dextinity/site-nextjs` for sites built with the RSC Framework Mode of React Router 8. It re-exports `@dextinity/site-react` and adds what Next.js provides itself:

- `Image`, `ImageConfigProvider` and the blocks based on them: `PixelImageBlock`, `DamVideoBlock`, `YouTubeVideoBlock`, `VimeoVideoBlock`, `VideoPreviewImage`
- `createMeta()`, which converts the metadata of a page to the `meta` of a route
- `SitePreviewProvider`, and `sitePreviewRoute()` and `previewParams()` in `@dextinity/site-react-router/server`
- `createCachingFetch()` and `createMemoryFetchCacheStore()`, a fetch cache like the data cache of Next.js
- `robotsResponse()` and `sitemapResponse()` for the `robots.txt` and `sitemap.xml` routes
- `runWithRequestContext()` and `getRequestContext()`, which make the context of the middlewares available to server components
- `createRSCResponseRenderer()`, `preventCachingOfErrorResponse()` and `trailingSlashRedirect()` for the error reporting, the caching and the redirects of the responses in `entry.rsc.tsx`
- `createStaticFileHandler()` and `cdnOriginCheck()` for the server in `@dextinity/site-react-router/node`
- `persistedQueriesPlugin()` for Vite in `@dextinity/site-react-router/vite`

**Example**

```tsx
// src/entry.rsc.tsx
const renderer = createRSCResponseRenderer({ renderToReadableStream, reportError });
const response = await runWithRequestContext(requestContext, () =>
    matchRSCServerRequest({ /* ... */ requestContext, onError: renderer.onError, generateResponse: renderer.generateResponse }),
);
return renderer.completeResponse(request, response);
```

See `demo/site-react-router` for a complete site.
