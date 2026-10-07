---
"@dextinity/cms-admin": patch
"@dextinity/cms-api": patch
---

Fix images breaking with "Missing crop dimensions"

Clicking into the crop area without dragging cleared the selected crop area in the DAM's crop settings and in the image block's crop dialog. Saving afterwards stored a crop area that had a focal point but no dimensions. Such a crop area cannot be cropped: images using it fail to render with `Missing crop dimensions` when `aspectRatio="inherit"` is used, and their image URLs resolve to an invalid crop.

Crop areas without dimensions are now rejected by the API, existing ones in the DAM are reset to the full image by a migration, and existing ones in image blocks fall back to the DAM's crop settings.
