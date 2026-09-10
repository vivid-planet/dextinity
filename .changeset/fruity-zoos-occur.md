---
"@comet/cms-admin": patch
---

Fix block editor keeping the previously selected block's content

Clicking a block in the block preview opens that block's editor in the block list. When the newly selected block had the same type as the previously selected one, React reused the already mounted admin component instead of remounting it. Editors that build internal state on mount, most notably the TipTap rich text block whose document is created once from the initial content, therefore kept showing the previous block's content.

The admin component rendered by `createBlocksBlock` and `createListBlock` is now keyed by the selected block, so it remounts whenever the selection changes.
