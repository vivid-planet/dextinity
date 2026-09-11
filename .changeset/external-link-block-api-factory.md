---
"@dextinity/cms-api": minor
---

Add `createExternalLinkBlock` factory

The `ExternalLinkBlock` has three fields: the target URL plus the options `openInNewWindow` and `noFollow`. Where an option has no meaning — an internal application that is always embedded in an iframe, or redirects, where neither affects the resulting HTTP redirect — the factory leaves it out of the block entirely. Pass the options the block should have via `supports`; an option left out is absent from `block-meta.json` and from the generated `…BlockData` / `…BlockInput` types, and sending it as input is rejected by validation.

**Example**

```ts
import { createExternalLinkBlock } from "@dextinity/cms-api";

export const UrlLinkBlock = createExternalLinkBlock({ supports: [] }, "UrlLink");
```

The block name is mandatory. A block's field set is part of what its name promises — the name ties stored data, the generated types, the admin block and the site component together, so one name means one field set. A block created with a reduced field set is a block of its own, not a variant of `ExternalLinkBlock`, and needs a matching admin block and site component under that same name.

`ExternalLinkBlock` is unchanged and keeps all three fields, so nothing existing is affected.

Removing a field takes it out of the contract, not out of the database: values already stored under that block name stay in its JSON, untyped, until a migration removes them. Replacing an existing `external` target with a block of your own also changes the key of the surrounding `OneOfBlock`, so stored content needs a migration on that surrounding block.
