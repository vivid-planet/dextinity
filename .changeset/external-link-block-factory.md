---
"@dextinity/cms-admin": minor
---

Add `createExternalLinkBlock` factory

The `ExternalLinkBlock` offers "Open in new window" and "No follow" besides the URL, even where neither has an effect. The factory disables an option by passing `false`, both are enabled by default. A disabled option is neither offered in the editor nor part of the block's data. `ExternalLinkBlock` is now created from the factory and still exported, so this is non-breaking.

**Example**

```tsx
import { createExternalLinkBlock } from "@dextinity/cms-admin";

export const UrlLinkBlock = createExternalLinkBlock({ name: "UrlLink", openInNewWindow: false, noFollow: false });
```

Pair the block with an API block created by `createExternalLinkBlock` from `@dextinity/cms-api`, with the same name and the same options disabled.

**Redirects no longer offer "Open in new window" and "No follow"**

A redirect resolves to an HTTP redirect, which has neither a `target` nor a `rel` attribute, so both options were without effect there. The external target of the redirects form is now a `RedirectsExternalLink` block without them.
