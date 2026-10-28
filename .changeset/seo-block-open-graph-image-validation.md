---
"@dextinity/cms-api": patch
---

Report each validation error in the `openGraphImage` of the SEO block once

The field had an additional `@ValidateNested()` next to `@ChildBlockInput()`, which already adds it, so the image was validated twice.
