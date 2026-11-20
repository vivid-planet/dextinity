---
"@dextinity/site-react": patch
---

Only send the `X-Block-Preview` header to the preview's own host when `fetch` gets a `Request`

`BlockPreviewProvider` wraps `window.fetch` to add the `X-Block-Preview` header to requests to the preview's own host.
When `fetch` was called with a `Request` object, the wrapper didn't read the URL from the `Request` and added the header to every request, including requests to other hosts.
This exposed the content scope JWT to other hosts and made CORS preflights fail on hosts that don't allow the header, for instance when MapLibre loads its map style.
