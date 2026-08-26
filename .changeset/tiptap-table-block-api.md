---
"@dextinity/cms-api": minor
---

Add `createTipTapTableBlock` and table support for the TipTap rich text block

`createTipTapTableBlock` creates a TipTap block whose document consists of exactly one table. The document's content expression pins the table in place, so validation rejects any content that isn't a single table: rows and columns can be added and removed, the table itself cannot be deleted. The table is also kept out of the `block` group so it cannot be nested inside its own cells, and a row must always contain at least one cell.

It takes the same options as `createTipTapRichTextBlock` (`supports`, `textBlockStyles`, `inlineStyles`, `placeholders`, `link`, `childBlocks`, `listLevelMax`), which apply to the content inside the cells. `maxTextBlocks` and `migrateFromDraftJs` are omitted because the document holds exactly one table. Headings are not part of the default `supports`, because a table's header row already carries the emphasis a heading would.

**Example**

```ts
import { createTipTapTableBlock } from "@dextinity/cms-api";

export const TipTapTableBlock = createTipTapTableBlock({ link: LinkBlock }, "TipTapTable");
```

`createTipTapRichTextBlock` additionally accepts `"table"` in `supports`, which allows tables between the other top-level nodes of a rich text block:

```ts
createTipTapRichTextBlock({ supports: ["bold", "heading", "table"] });
```
