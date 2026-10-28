---
"@dextinity/cms-api": minor
---

Replace images with an invalid license with a fallback image

When the license feature is enabled (`enableLicenseFeature`), `PixelImageBlock` renders a fallback image instead of an image whose license has expired or isn't valid yet.
The fallback image is set per DAM scope in the DAM settings.
It is delivered under its own URL and with its own crop area, the crop area set in the block is ignored.
If no fallback image is set, the block renders no image.

`SvgImageBlock`, `DamVideoBlock` and `DamFileDownloadLinkBlock` render no file if its license is invalid, and `DamVideoBlock` leaves out captions with an invalid license.

The GraphQL fields `DamFile.fileUrl`, `DamFileImage.url` and `DamFileImage.urlTemplate` return the fallback image's URL for a pixel image with an invalid license.
`DamFileImage.url` and `DamFileImage.urlTemplate` return `null` if no fallback image is set.

None of this applies to requests for preview DAM URLs, so the Admin keeps showing the original file.

The public file and image URLs of a file with an invalid license respond with `410 Gone`.
