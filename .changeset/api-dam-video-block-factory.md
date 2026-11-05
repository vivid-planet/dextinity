---
"@dextinity/cms-api": minor
---

Add `createDamVideoBlock` factory

The `DamVideoBlock` always stores everything it has (autoplay, loop, show controls, preview image), even for sites that don't use any of it. `createDamVideoBlock` is the API counterpart of the Admin factory of the same name: disable what the site doesn't use, and it is part of neither the block's data nor its input, so it doesn't show up in `blocks.generated.ts` and isn't stored for new content.
Values that were stored before an option was disabled survive reading, so disabling an option leaves existing content untouched, but they are dropped the next time an editor saves the block.

The options are enabled by default and disabled by passing `false`:

- `controls` — autoplay, loop and show controls, offered together
- `previewImage` — the poster image

`DamVideoBlock` is now created from the factory with both enabled and still exported next to it, so this is non-breaking. Since it occupies the block name `DamVideo`, a block created with the factory needs a name of its own.
The name is passed as the second parameter, the same `nameOrOptions` the other block factories take, so it can carry a `migrate` option as well.

**Example**

```ts
import { createDamVideoBlock } from "@dextinity/cms-api";

// For a site that only reads the video's URL
export const TeaserVideoBlock = createDamVideoBlock({ controls: false, previewImage: false }, "TeaserVideo");
```

Use the same options and the same name for the Admin block.

**Preview image of existing content**

A block created by the factory defaults a missing preview image to an empty one when the preview image is enabled. This matters when the factory replaces a block a project already has: content stored before the block had a preview image loads as a child block instead of leaving the field undefined, which the block's own meta declares as always present.

The default applies on read, so it also reaches content whose version is already the block's latest — for instance content stored while the preview image was disabled, before it was enabled again.
