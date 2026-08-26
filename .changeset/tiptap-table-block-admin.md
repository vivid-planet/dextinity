---
"@dextinity/cms-admin": minor
---

Add `createTipTapTableBlock` and table support for the TipTap rich text block

`createTipTapTableBlock` creates a block that is a single TipTap editor containing one table. Editors type directly into the cells, and a new **Table** toolbar menu offers insert row above/below, delete row, insert column left/right, delete column, toggle header row, and merge/split cells. _Delete row_ and _Delete column_ are disabled when they would remove the last row or column, and the table itself cannot be deleted — it is the document's only allowed child, so ProseMirror rejects every transaction that would remove it.

It takes the same options as `createTipTapRichTextBlock` (except `maxTextBlocks`), which apply to the content inside the cells, plus `name`, `defaultRows` (default `3`), `defaultColumns` (default `3`) and `headerRow` (default `true`). Headings are not part of the default `supports`, because a table's header row already carries the emphasis a heading would.

**Example**

```tsx
import { createTipTapTableBlock } from "@dextinity/cms-admin";

export const TipTapTableBlock = createTipTapTableBlock({ link: LinkBlock });
```

`createTipTapRichTextBlock` additionally accepts `"table"` in `supports`, which allows editors to insert tables between the other top-level nodes of a rich text block.
