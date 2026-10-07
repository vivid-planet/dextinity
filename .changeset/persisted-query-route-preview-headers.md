---
"@dextinity/site-react": patch
"@dextinity/site-nextjs": patch
---

Stop forwarding preview headers from the client in `persistedQueryRoute`

Previously, `persistedQueryRoute` forwarded the `x-include-invisible-content` and `x-preview-dam-urls` headers of the incoming request to the API.
Since the route usually authenticates against the API with a system user, any visitor could request unpublished pages and invisible blocks.

The headers are now only set based on the new `previewData` option, which must come from a verified source such as the site preview cookie:

```ts
import { persistedQueryRoute, previewParams } from "@dextinity/site-nextjs/server";

async function handler(request: Request) {
    const preview = await previewParams();
    return persistedQueryRoute(request, {
        // ...
        previewData: preview?.previewData,
    });
}
```

Responses for preview requests are sent with `Cache-Control: private, no-store`.
