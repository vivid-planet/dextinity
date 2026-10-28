---
"@dextinity/site-react": patch
---

Keep the headers of a `Request` passed to `fetch` in the block preview

`BlockPreviewProvider` wraps `window.fetch` to add the `X-Block-Preview` header.
When `fetch` was called with a `Request` object, as `openapi-fetch` and other libraries do, the wrapper dropped all headers set on the `Request`.
Now the headers of the `Request` and of `init` are merged, with `init` taking precedence.
