---
"@dextinity/cms-api": patch
---

Reject `null` for the optional fields of the `PixelImage` and `SvgImage` block inputs

The block inputs accepted `"cropArea": null` and `"damFileId": null`, although the block types only allow omitting these fields.
Content like that saved without an error, but building the image URL then failed with "Cannot read properties of null (reading 'focalPoint')", breaking every later load of the content.
Omit the field instead of passing `null`.
