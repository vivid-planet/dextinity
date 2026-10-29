---
"@dextinity/cms-api": patch
"@dextinity/cms-admin": patch
---

Reject a `null` crop area in the `PixelImage` block input and handle content that already contains one

The block input accepted `"cropArea": null`, but building the image URL then failed with "Cannot read properties of null (reading 'focalPoint')", breaking every later load of the content.
The block input now only allows a missing crop area to inherit the crop area of the DAM file.
For content saved before, `null` is treated like a missing crop area, both in the API and in the admin's `PixelImageBlock`, which previously showed such a block as having a custom crop.
