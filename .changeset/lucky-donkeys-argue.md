---
"@dextinity/cms-admin": minor
---

Allow locking the crop area to a fixed aspect ratio in `PixelImageBlock` and `DamImageBlock`

A project decides the aspect ratio the image is rendered at in the site, while the crop dialog lets editors drag the crop area into any shape. imgproxy then crops further inside the crop area to reach that aspect ratio, cutting off parts the editor deliberately included.

Add `createPixelImageBlock` and `createDamImageBlock`, which take the aspect ratio the site renders the image at. The crop area can then only be dragged and resized at that aspect ratio, so editors see the shape the site displays.

**Example**

```tsx
const TeaserImageBlock = createDamImageBlock({ aspectRatio: "16x9" });
```

`aspectRatio` accepts a number, or a string in `16x9`, `16/9` or `16:9` notation, so it can be written the same way as the site's `aspectRatio` prop.

The image field and the crop dialog name the aspect ratio. The dialog warns that "Use inherited DAM settings?" drops it, because the crop area in the DAM has no aspect ratio constraint, and "Reset crop area" restores the largest crop area at that aspect ratio instead of the whole image.

`PixelImageBlock` and `DamImageBlock` stay exported and unchanged.
