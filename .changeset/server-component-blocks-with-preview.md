---
"@dextinity/site-react": minor
"@dextinity/site-nextjs": minor
---

Allow blocks using `withPreview` to be server components

`withPreview` no longer requires its block to be a client component.
It only renders the client-side `Preview` wrapper when the block data contains `adminMeta`, which is only the case in the admin's block preview.
On real pages, the block renders as a server component, so its raw data isn't serialized into the RSC payload and its code isn't shipped to the browser.

`BlocksBlock`, `ListBlock`, `OneOfBlock` and `OptionalBlock`, as well as the `DamVideoBlock`, `VimeoVideoBlock` and `YouTubeVideoBlock` of `@dextinity/site-nextjs`, can also be rendered from server components now.

`PixelImageBlock`, `SvgImageBlock`, `DamFileDownloadLinkBlock` and the `InternalLinkBlock` of `@dextinity/site-nextjs` are no longer client components. `PixelImageBlock` now only sends the computed image props to the browser instead of the whole image data.

Remove the `"use client"` directive from blocks that only needed it because of `withPreview`:

```diff
-"use client";
 import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";

 export const HeadingBlock = withPreview(
     ({ data }: PropsWithData<HeadingBlockData>) => {
         /* ... */
     },
     { label: "Heading" },
 );
```

Blocks must stay shared components (no hooks, not async), as they are still rendered on the client in the block preview.
