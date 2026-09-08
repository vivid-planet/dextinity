---
"@dextinity/cli": patch
"@dextinity/site-react": patch
"@dextinity/site-nextjs": patch
---

Make the generated `TipTapNode` type compatible with TipTap's `JSONContent`

`TipTapNode["type"]` is optional now, matching `JSONContent["type"]`. Both types can be used interchangeably, so no cast is needed when passing a rich text block's content to a TipTap utility or when rendering a `JSONContent` value with `renderTipTapRichText`.

**Example**

```ts
import { generateHTML } from "@tiptap/core";
import type { TipTapRichTextBlockData } from "@src/blocks.generated";

function renderToHtml(data: TipTapRichTextBlockData) {
    return generateHTML(data.tipTapContent, extensions);
}
```
