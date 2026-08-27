---
"@dextinity/cms-admin": minor
---

Add `createExternalLinkBlock` factory

The `ExternalLinkBlock` always offers editors "Open in new window" and "No follow", even where neither has any effect — an internal application that is always embedded in an iframe, for instance. Pass what the editor should be offered via `supports`; anything left out isn't rendered in the admin component. `ExternalLinkBlock` is now created from the factory with defaults and still exported next to it, so this is non-breaking.

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

Values that are already stored are kept as they are, the editor just can't change them anymore. A field left out of `supports` stays part of the block's data, so the API block and the site component are unaffected. An option that is left out keeps its default — it isn't forced to a different value. To always open external links in a new tab, do so in the site implementation instead.

**Pairing with an API block of your own**

`supports` is about the editor, not about the data. To pair the block with an API block created by `createExternalLinkBlock` from `@dextinity/cms-api`, which has fewer fields, use `fields` and `name` instead:

```tsx
export const UrlLinkBlock = createExternalLinkBlock({ fields: [], name: "UrlLink" });
```

`fields` decides which options the block's data has, `supports` which of those the editor may set, defaulting to `fields`. `supports` has to be a subset of `fields`, and the factory throws at creation time if it isn't. Both must match the API block exactly: sending a field it doesn't have is rejected by validation, and so is omitting one it has.

**Redirects no longer offer "Open in new window" and "No follow"**

A redirect resolves to an HTTP redirect, which has neither a `target` nor a `rel` attribute, so both options were without effect there. They are now hidden from the redirects form. Stored values are left untouched.
