---
"@dextinity/cms-api": patch
"@dextinity/cms-admin": patch
---

Use the crop area of the DAM file for a `PixelImage` block whose `cropArea` is `null`

The block input accepts `"cropArea": null`, but building the image URL then failed with "Cannot read properties of null (reading 'focalPoint')", breaking every later load of the content.
`null` is now treated like a missing crop area, both in the API and in the admin's `PixelImageBlock`, which previously showed such a block as having a custom crop.
The `cropArea` of `ImageInterface` and of the block's data and input is now typed as `ImageCropArea | null` to reflect this.

**Possible type errors**

Code that reads `cropArea` from an `ImageInterface`, for instance from `FilesService#findImageToDeliver`, and only checks for `undefined` before using it now gets a type error.
Handle `null` the same way, for instance:

```ts
const cropArea = image.cropArea ?? image.file.image?.cropArea;
```
