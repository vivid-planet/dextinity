---
"@dextinity/cms-api": minor
"@dextinity/cms-admin": minor
---

Add `createExternalLinkBlock` factory

The `ExternalLinkBlock` always has the options "Open in new window" and "No follow" besides the URL, even where neither has an effect. The factory disables an option by passing `false`, both are enabled by default. A disabled option is neither offered in the editor nor part of the block: it is absent from `block-meta.json` and the generated types, and sending it as input is rejected by validation. `ExternalLinkBlock` is now created from the factory and still exported, so this is non-breaking.

**Example**

```ts
// API
import { createExternalLinkBlock } from "@dextinity/cms-api";

export const UrlLinkBlock = createExternalLinkBlock({ openInNewWindow: false, noFollow: false }, "UrlLink");
```

```tsx
// Admin
import { createExternalLinkBlock } from "@dextinity/cms-admin";

export const UrlLinkBlock = createExternalLinkBlock({ name: "UrlLink", openInNewWindow: false, noFollow: false });
```

Create the API and the admin block with the same name and the same options disabled, and add a site component.

A block created by the API factory carries the migrations shipped with the `ExternalLinkBlock` as vendor migrations, so it can replace the `ExternalLinkBlock` in an existing project: it reads the content the `ExternalLinkBlock` stored, and its own migrations start with version 1. Values stored for a disabled option aren't passed on to the admin or the site, and are dropped the next time an editor saves the block.

**Redirects no longer offer "Open in new window" and "No follow"**

A redirect resolves to an HTTP redirect, which has neither a `target` nor a `rel` attribute, so both options were without effect there. The external target of redirects is now a `RedirectsExternalLink` block without them, in the API and the admin. Stored redirects load as before.
