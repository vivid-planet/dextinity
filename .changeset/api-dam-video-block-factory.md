---
"@dextinity/cms-api": minor
---

Add `createDamVideoBlock` factory

The `DamVideoBlock` always stores everything it has (autoplay, loop, show controls, preview image), even for sites that don't use any of it. `createDamVideoBlock` is the API counterpart of the Admin factory of the same name: pass what the site supports via `supports`, anything left out is part of neither the block's data nor its input, so it doesn't show up in `blocks.generated.ts` and isn't stored for new content.
Values that were stored before an option was left out are kept and saved again, so narrowing `supports` doesn't remove them from existing content.

`supports` takes:

- `"controls"` — autoplay, loop and show controls, offered together
- `"previewImage"` — the poster image

`DamVideoBlock` is now created from the factory with both supported and still exported next to it, so this is non-breaking. Since it occupies the block name `DamVideo`, a block created with the factory needs a name of its own.

**Example**

```ts
import { createDamVideoBlock } from "@dextinity/cms-api";

// For a site that only reads the video's URL
export const TeaserVideoBlock = createDamVideoBlock({ supports: [] }, "TeaserVideo");
```

Use the same `supports` and the same name for the Admin block.
