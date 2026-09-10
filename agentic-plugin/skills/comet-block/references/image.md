# Image Block Selection Rules

Detailed rules for choosing and using the correct image block in Comet. Load this file when a block contains an image or media property.

---

## Overview

Comet provides three built-in image blocks (`DamImageBlock`, `PixelImageBlock`, `SvgImageBlock`) and a project-specific `MediaBlock` pattern. Each block accepts different file types and has different capabilities. Selecting the wrong block leads to editors being unable to upload the file type they need, or missing features like cropping and optimization.

---

## Decision Flowchart

Work through these questions in order. Stop at the first "Yes".

| #   | Question                                                                               | Block                            |
| --- | -------------------------------------------------------------------------------------- | -------------------------------- |
| 1   | Does the field need to support both images **and video**?                              | `MediaBlock` (project-specific)  |
| 2   | Does the field accept **only SVGs** (icons, logos, decorative vector graphics)?        | `SvgImageBlock`                  |
| 3   | Does the field need to **exclude SVGs** (raster only, with cropping and optimization)? | `PixelImageBlock`                |
| 4   | Does the field accept **any image type** (raster + SVG)?                               | `DamImageBlock`                  |
| 5   | Unsure or no specific requirement?                                                     | `DamImageBlock` (safest default) |

---

## Block Comparison

| Block             | Raster (JPEG, PNG, WebP, ...) | SVG | Video | Cropping / Optimization | Source                                                       |
| ----------------- | ----------------------------- | --- | ----- | ----------------------- | ------------------------------------------------------------ |
| `DamImageBlock`   | Yes                           | Yes | No    | Yes (pixel images only) | `@comet/cms-api` / `@comet/cms-admin`                        |
| `PixelImageBlock` | Yes                           | No  | No    | Yes                     | `@comet/cms-api` / `@comet/cms-admin` / `@comet/site-nextjs` |
| `SvgImageBlock`   | No                            | Yes | No    | No (not needed)         | `@comet/cms-api` / `@comet/cms-admin` / `@comet/site-nextjs` |
| `MediaBlock`      | Yes                           | Yes | Yes   | Yes (pixel images only) | Project-specific (not in Comet core)                         |

---

## DamImageBlock

A **one-of block** that wraps both `PixelImageBlock` and `SvgImageBlock`. It automatically detects the uploaded file type and delegates to the appropriate sub-block.

**Accepted file types:** All image types -- pixel images (JPEG, PNG, WebP, GIF, etc.) and SVG.

**When to use:** Default choice for most image fields. Use when editors should be able to upload any image type without restriction. Appropriate for general-purpose fields like "teaser image", "hero image", or "content image".

### Imports

| Layer | Import                                                                                                                                                                   |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| API   | `import { DamImageBlock } from "@comet/cms-api";`                                                                                                                        |
| Admin | `import { DamImageBlock } from "@comet/cms-admin";`                                                                                                                      |
| Site  | **Project-specific wrapper** -- not exported from `@comet/site-nextjs`. Each project creates its own component, typically at `site/src/common/blocks/DamImageBlock.tsx`. |

### Site Implementation

Because `DamImageBlock` is a one-of block, the site component must handle both pixel and SVG sub-types. Check whether the project already has a `DamImageBlock` in `site/src/common/blocks/` before creating one.

Typical pattern:

```tsx
// site/src/common/blocks/DamImageBlock.tsx
"use client";
import { PixelImageBlock, PreviewSkeleton, type PropsWithData, SvgImageBlock, withPreview } from "@comet/site-nextjs";
import { type DamImageBlockData, type PixelImageBlockData, type SvgImageBlockData } from "@src/blocks.generated";
import { type ImageProps as NextImageProps } from "next/image";

type DamImageProps = Omit<NextImageProps, "src" | "width" | "height" | "alt"> & {
    aspectRatio: string | "inherit";
};

export const DamImageBlock = withPreview(
    ({ data: { block }, aspectRatio, ...imageProps }: PropsWithData<DamImageBlockData> & DamImageProps) => {
        if (!block) {
            return <PreviewSkeleton type="media" hasContent={false} />;
        }

        if (block.type === "pixelImage") {
            return <PixelImageBlock data={block.props as PixelImageBlockData} aspectRatio={aspectRatio} {...imageProps} />;
        } else if (block.type === "svgImage") {
            return <SvgImageBlock data={block.props as SvgImageBlockData} />;
        } else {
            return (
                <>
                    Unknown block type: <strong>{block.type}</strong>
                </>
            );
        }
    },
    { label: "Image" },
);
```

### Site Props

| Prop          | Type                  | Description                                                                                        |
| ------------- | --------------------- | -------------------------------------------------------------------------------------------------- |
| `aspectRatio` | `string \| "inherit"` | Aspect ratio for pixel images (e.g., `"16x9"`, `"4x3"`, `"1x1"`, `"inherit"`). Ignored for SVGs.   |
| `sizes`       | `string`              | Responsive sizes attribute for pixel images (e.g., `"100vw"`, `"(max-width: 768px) 100vw, 50vw"`). |
| `fill`        | `boolean`             | When `true`, the image fills its container (Next.js Image `fill` mode).                            |

### Allowed aspect ratios

Allowed values for `aspectRatio` (for pixel/DAM images) are **not arbitrary**. They are defined in the API config:

- **Config location:** `api/src/comet-config.json` (or project equivalent) under `dam.allowedImageAspectRatios`.

When creating or editing a block that uses `DamImageBlock` or `PixelImageBlock` with a specific aspect ratio:

1. If the user requests an aspect ratio (e.g. "21/9", "21x9"), check whether it exists in the project's `allowedImageAspectRatios`.
2. If it **is** in the list, use it (with the same format as in the config, e.g. `"16x9"`).
3. If it **is not** in the list, either:
    - Use the **closest existing value** (e.g. for 21/9 use `"2x1"` if that is allowed), or
    - **Clarify with the user:** use one of the existing ratios or add the new ratio to the API config.

Do not use an aspect ratio string that is not in `allowedImageAspectRatios`; the API/cropping pipeline will not support it.

### Usage Pattern

```ts
// API
@ChildBlock(DamImageBlock)
image: BlockDataInterface;

// Admin
image: {
    block: DamImageBlock,
    title: <FormattedMessage id="myBlock.image" defaultMessage="Image" />,
},

// Site
<DamImageBlock data={image} aspectRatio="16x9" sizes="100vw" />
```

---

## PixelImageBlock

Handles **raster/pixel-based images only**. Supports image optimization via ImgProxy, focal-point-aware cropping, dominant color placeholders, and responsive image generation.

**Accepted file types:** All `image/*` MIME types **except** `image/svg+xml` (JPEG, PNG, WebP, GIF, BMP, TIFF, etc.).

**When to use:** When the image field must exclude SVGs and only accept raster images. Common for fields where cropping and optimization are essential, such as hero backgrounds, card thumbnails, or profile photos. In practice, most projects prefer `DamImageBlock` over using `PixelImageBlock` directly, since `DamImageBlock` includes pixel support and also handles SVGs.

### Imports

| Layer | Import                                                  |
| ----- | ------------------------------------------------------- |
| API   | `import { PixelImageBlock } from "@comet/cms-api";`     |
| Admin | `import { PixelImageBlock } from "@comet/cms-admin";`   |
| Site  | `import { PixelImageBlock } from "@comet/site-nextjs";` |

### Key Features

- Automatic image optimization via ImgProxy
- Crop area with focal point (SMART, CENTER, etc.)
- Dominant color placeholder during loading
- Responsive image generation via Next.js Image
- SEO metadata (alt text, title) from DAM file

### Site Props

| Prop          | Type                  | Required | Description                                                               |
| ------------- | --------------------- | -------- | ------------------------------------------------------------------------- |
| `aspectRatio` | `string \| "inherit"` | Yes      | Aspect ratio (e.g., `"16x9"`) or `"inherit"` for the natural image ratio. |
| `sizes`       | `string`              | No       | Responsive sizes attribute.                                               |
| `fill`        | `boolean`             | No       | Fill mode for Next.js Image (image fills its container).                  |

### Usage Pattern

```ts
// API
@ChildBlock(PixelImageBlock)
photo: BlockDataInterface;

// Admin
photo: {
    block: PixelImageBlock,
    title: <FormattedMessage id="myBlock.photo" defaultMessage="Photo" />,
},

// Site
<PixelImageBlock data={photo} aspectRatio="4x3" />
```

---

## SvgImageBlock

Handles **SVG images only**. Renders the SVG directly via an `<img>` tag without image optimization (SVGs are already resolution-independent).

**Accepted file types:** `image/svg+xml` only.

**When to use:** When the field should only accept SVG files. Ideal for icons, logos, decorative graphics, and other vector content where raster images are not appropriate. Common in blocks like key-facts items where each entry has a small icon.

### Imports

| Layer | Import                                                |
| ----- | ----------------------------------------------------- |
| API   | `import { SvgImageBlock } from "@comet/cms-api";`     |
| Admin | `import { SvgImageBlock } from "@comet/cms-admin";`   |
| Site  | `import { SvgImageBlock } from "@comet/site-nextjs";` |

### Site Props

| Prop     | Type                         | Default  | Description                 |
| -------- | ---------------------------- | -------- | --------------------------- |
| `width`  | `string \| number \| "auto"` | `"100%"` | Width of the rendered SVG.  |
| `height` | `string \| number \| "auto"` | `"auto"` | Height of the rendered SVG. |

### Empty State Check

In the site layer, check `damFile` before rendering to avoid showing a broken image when no SVG is uploaded:

```tsx
{
    icon.damFile && <SvgImageBlock data={icon} width={48} height={48} />;
}
```

### Usage Pattern

```ts
// API
@ChildBlock(SvgImageBlock)
icon: BlockDataInterface;

// Admin
icon: {
    block: SvgImageBlock,
    title: <FormattedMessage id="myBlock.icon" defaultMessage="Icon" />,
},

// Site
{icon.damFile && <SvgImageBlock data={icon} width={48} height={48} />}
```

---

## MediaBlock (Project-Specific)

A **one-of block** that typically combines `DamImageBlock` with one or more video blocks (`DamVideoBlock`, `YouTubeVideoBlock`, `VimeoVideoBlock`). **Not part of Comet core** -- each project defines its own `MediaBlock`.

**Accepted file types:** Depends on the wrapped blocks. Typically includes all image types (via `DamImageBlock`) plus video.

**When to use:** When the content field should accept **both images and video**. Common for hero/stage areas, teaser media, and any visual content area where editors should choose between an image or a video.

### Discovery

Before using `MediaBlock`, check whether the project defines one:

1. Look for `MediaBlock` in `api/src/common/blocks/media.block.ts`
2. Look for `MediaBlock` in `admin/src/common/blocks/MediaBlock.tsx`
3. Look for `MediaBlock` in `site/src/common/blocks/MediaBlock.tsx`

If it does not exist and the block needs image + video support, create one following the one-of block pattern.

### Typical Implementation

**API:**

```ts
// api/src/common/blocks/media.block.ts
import { createOneOfBlock, DamImageBlock, DamVideoBlock, VimeoVideoBlock, YouTubeVideoBlock } from "@comet/cms-api";

export const MediaBlock = createOneOfBlock(
    {
        supportedBlocks: {
            image: DamImageBlock,
            damVideo: DamVideoBlock,
            youTubeVideo: YouTubeVideoBlock,
            vimeoVideo: VimeoVideoBlock,
        },
    },
    "Media",
);
```

**Admin:**

```tsx
// admin/src/common/blocks/MediaBlock.tsx
import {
    BlockCategory,
    type BlockInterface,
    createOneOfBlock,
    DamImageBlock,
    DamVideoBlock,
    VimeoVideoBlock,
    YouTubeVideoBlock,
} from "@comet/cms-admin";
import { FormattedMessage } from "react-intl";

export const MediaBlock: BlockInterface = createOneOfBlock({
    supportedBlocks: { image: DamImageBlock, damVideo: DamVideoBlock, youTubeVideo: YouTubeVideoBlock, vimeoVideo: VimeoVideoBlock },
    name: "Media",
    displayName: <FormattedMessage id="mediaBlock.displayName" defaultMessage="Media" />,
    allowEmpty: false,
    variant: "toggle",
    category: BlockCategory.Media,
});
```

**Site:** Each project implements its own site component. Typically it renders a `OneOfBlock` with supported blocks for image and video.

### Usage Pattern

```ts
// API
@ChildBlock(MediaBlock)
media: BlockDataInterface;

// Admin
media: {
    block: MediaBlock,
    title: <FormattedMessage id="myBlock.media" defaultMessage="Media" />,
},
```

---

## Common Pitfalls

1. **Using `PixelImageBlock` when `DamImageBlock` would be better** -- Unless there is a specific reason to exclude SVGs, prefer `DamImageBlock`. It gives editors more flexibility.
2. **Forgetting the site-side `DamImageBlock` wrapper** -- Unlike `PixelImageBlock` and `SvgImageBlock`, `DamImageBlock` is not exported from `@comet/site-nextjs`. Check whether the project already has a wrapper in `site/src/common/blocks/DamImageBlock.tsx` before creating one.
3. **Not checking for an existing `MediaBlock`** -- When the user asks for "image" support but the context suggests video might also be needed (stage blocks, hero blocks, teaser media), check if the project has a `MediaBlock` and suggest using it.
4. **Missing `aspectRatio` on `PixelImageBlock` in the site** -- `PixelImageBlock` requires an `aspectRatio` prop in the site layer. Omitting it causes layout issues.
5. **Not handling the empty state for `SvgImageBlock`** -- Always check `damFile` before rendering `SvgImageBlock` in the site to avoid broken image placeholders.
6. **Using `DamImageBlock` for icon-only fields** -- When the field is specifically for icons or logos (always SVG), use `SvgImageBlock` to prevent editors from uploading raster images that would not scale properly.

---

## Naming Conventions for Image Properties

The property name in the block should reflect the content type:

| Content               | Property Name      | Block             |
| --------------------- | ------------------ | ----------------- |
| General image         | `image`            | `DamImageBlock`   |
| Icon / logo           | `icon` or `logo`   | `SvgImageBlock`   |
| Photo (raster only)   | `photo` or `image` | `PixelImageBlock` |
| Media (image + video) | `media`            | `MediaBlock`      |
