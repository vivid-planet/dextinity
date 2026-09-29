---
"@dextinity/cms-admin": minor
---

Add `createExternalLinkBlock` factory

The `ExternalLinkBlock` offers "Open in new window" and "No follow" besides the URL, even where neither has an effect. The factory disables an option by passing `false`, both are enabled by default. `ExternalLinkBlock` is now created from the factory and still exported, so this is non-breaking.

**Example**

```tsx
import { createExternalLinkBlock, createLinkBlock, InternalLinkBlock } from "@dextinity/cms-admin";

export const LinkBlock = createLinkBlock({
    supportedBlocks: {
        internal: InternalLinkBlock,
        external: createExternalLinkBlock({ openInNewWindow: false, noFollow: false }),
    },
});
```

Without a name of its own, the block keeps the name and the data of the `ExternalLinkBlock`: a disabled option is only hidden from the editor, stored values are kept, and the API block and the site component are unaffected.

With a name of its own, the block is paired with an API block created by `createExternalLinkBlock` from `@dextinity/cms-api`, and a disabled option isn't part of its data either. Use the same name and disable the same options as there:

```tsx
export const UrlLinkBlock = createExternalLinkBlock({ name: "UrlLink", openInNewWindow: false, noFollow: false });
```

**Redirects no longer offer "Open in new window" and "No follow"**

A redirect resolves to an HTTP redirect, which has neither a `target` nor a `rel` attribute, so both options were without effect there. Stored values are left untouched.
