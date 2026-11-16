---
"@dextinity/cms-admin": major
---

Remove the deprecated `supports` option of `createDamVideoBlock`

Use `controls` and `previewImage` instead, and create the paired API block with `createDamVideoBlock` and the same options:

```diff
-createDamVideoBlock({ name: "TeaserVideo", supports: ["controls"] });
+createDamVideoBlock({ name: "TeaserVideo", previewImage: false });
```
