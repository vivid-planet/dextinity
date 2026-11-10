---
"@dextinity/cms-api": patch
---

Reject `null` for the optional fields of the block inputs

The block inputs used `@IsOptional()`, which also accepts `null`, although the block types only allow omitting these fields.
Content like that saved without an error but could break later on, for instance, a `PixelImage` block with `"cropArea": null` failed to build its image URL with "Cannot read properties of null (reading 'focalPoint')", breaking every later load of the content.
The optional fields of all built-in blocks now use `@IsUndefinable()`. Omit the field instead of passing `null`.
