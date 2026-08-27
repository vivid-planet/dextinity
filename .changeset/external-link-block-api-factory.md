---
"@dextinity/cms-api": minor
---

Add `createExternalLinkBlock` factory

The admin-side factory of the same name hides an option from the editor but keeps it in the block's data. Where an option should not exist at all — absent from `block-meta.json` and the generated types, and rejected when sent as input — use the API factory instead.

**Example**

```ts
import { createExternalLinkBlock } from "@dextinity/cms-api";

export const UrlLinkBlock = createExternalLinkBlock({ supports: [] }, "UrlLink");
```

Unlike in the admin, the block name is mandatory. A block's field set is part of what its name promises — the name ties stored data, the generated types, the admin block and the site component together, so one name means one field set. A block created with a reduced field set is a block of its own, not a variant of `ExternalLinkBlock`, and needs a matching admin block and site component under that same name.

`ExternalLinkBlock` is unchanged and keeps all three fields, so nothing existing is affected.

Removing a field takes it out of the contract, not out of the database: values already stored under that block name stay in its JSON, untyped, until a migration removes them. Replacing an existing `external` target with a block of your own also changes the key of the surrounding `OneOfBlock`, so stored content needs a migration on that surrounding block.
