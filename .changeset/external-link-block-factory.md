---
"@dextinity/cms-admin": minor
---

Add `createExternalLinkBlock` factory

The `ExternalLinkBlock` always offers editors "Open in new window" and "No follow", even where neither has any effect — an internal application that is always embedded in an iframe, for instance. Pass what the block should offer via `supports`; anything left out isn't rendered in the admin component. `ExternalLinkBlock` is now created from the factory with defaults and still exported next to it, so this is non-breaking.

**Example**

```tsx
import { createExternalLinkBlock, createLinkBlock, InternalLinkBlock } from "@dextinity/cms-admin";

export const LinkBlock = createLinkBlock({
    supportedBlocks: {
        internal: InternalLinkBlock,
        external: createExternalLinkBlock({ supports: [] }),
    },
});
```

Values that are already stored are kept as they are, the editor just can't change them anymore. Both fields stay part of the block's data either way, so the API block and the site component are unaffected. An option that is left out keeps its default — it isn't forced to a different value. To always open external links in a new tab, do so in the site implementation instead.

**Redirects no longer offer "Open in new window" and "No follow"**

A redirect resolves to an HTTP redirect, which has neither a `target` nor a `rel` attribute, so both options were without effect there. They are now hidden from the redirects form. Stored values are left untouched.
