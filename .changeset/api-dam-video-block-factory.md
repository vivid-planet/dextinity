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
The name is passed as the second parameter, the same `nameOrOptions` the other block factories take, so it can carry a `migrate` option as well.

**Example**

```ts
import { createDamVideoBlock } from "@dextinity/cms-api";

// For a site that only reads the video's URL
export const TeaserVideoBlock = createDamVideoBlock({ supports: [] }, "TeaserVideo");
```

Use the same `supports` and the same name for the Admin block.

**Migrations**

The factory brings its own migration, so a block created by it migrates content that was stored before the block had a preview image — even when no `migrate` is passed. This matters when the factory replaces a block that a project already has: without it, content that was never migrated keeps no preview image although the block declares one.

That migration occupies version 1, so own migrations start with 2. The factory throws when a passed `version` or `toVersion` is 1.

```ts
export const TeaserVideoBlock = createDamVideoBlock(
    { supports: ["controls"] },
    { name: "TeaserVideo", migrate: { version: 2, migrations: typeSafeBlockMigrationPipe([AddSomethingMigration]) } },
);
```
