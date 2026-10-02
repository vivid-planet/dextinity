---
"@dextinity/cms-api": minor
---

Add `createExternalLinkBlock` factory

The `ExternalLinkBlock` always has the options `openInNewWindow` and `noFollow` besides the URL, even for sites that use neither. The factory removes an option from the block by passing `false`, both are enabled by default. A disabled option is absent from `block-meta.json` and the generated types, and sending it as input is rejected by validation.

**Example**

```ts
import { createExternalLinkBlock } from "@dextinity/cms-api";

export const UrlLinkBlock = createExternalLinkBlock({ openInNewWindow: false, noFollow: false }, "UrlLink");
```

The block name is mandatory, since a block with other fields is a block of its own. It needs an admin block created with the same name and options, and a site component. `ExternalLinkBlock` is now created from the factory and still exported, so this is non-breaking.

A block created by the factory carries the migrations shipped with the `ExternalLinkBlock` as vendor migrations, so it can replace the `ExternalLinkBlock` in an existing project: it reads the content the `ExternalLinkBlock` stored, and its own migrations start with version 1. Values stored for a disabled option aren't passed on to the admin or the site, and are dropped the next time an editor saves the block.

**Redirects no longer store "Open in new window" and "No follow"**

A redirect resolves to an HTTP redirect, which has neither a `target` nor a `rel` attribute, so both options were without effect there. The external target of `RedirectsModule` is now a `RedirectsExternalLink` block without them. Stored redirects load as before.
