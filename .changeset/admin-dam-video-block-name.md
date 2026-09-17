---
"@dextinity/cms-admin": minor
---

Add `name` option to `createDamVideoBlock`

A `DamVideoBlock` created with a custom `supports` needs a name of its own, because `DamVideo` is taken by the exported `DamVideoBlock`. The name must match the name of the block created with `createDamVideoBlock` in the API.

**Example**

```tsx
import { createDamVideoBlock } from "@dextinity/cms-admin";

export const TeaserVideoBlock = createDamVideoBlock({ name: "TeaserVideo", supports: [] });
```
