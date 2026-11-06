---
"@dextinity/cms-admin": major
---

Show the items of blocks, list, and columns blocks in the `BlockList` of `@dextinity/ui`

`createBlocksBlock`, `createListBlock` and `createColumnsBlock` keep their options and state, but render their items as `Block`s in a `BlockList`: drag a block by its grip or move it with the arrow keys, add one between two blocks or at the end, select blocks for the bulk actions in the header, and copy, paste below, duplicate or delete one from its menu. Deleting shows a toast with Undo instead of a snackbar. A block's title is its preview text, its summary the block type, and its icon a thumbnail of its first image.

- `AdditionalItemContextMenuItems` is rendered inside the item's `Menu` of `@dextinity/ui` and must return `MenuItem`s of `@dextinity/ui` instead of MUI `MenuItem`s. The menu closes when an item is chosen, so a dialog rendered next to the item would disappear with it: open it with the new `openDialog` prop instead, and call `close` when it's done:

    ```tsx
    AdditionalItemContextMenuItems: ({ item, onChange, openDialog }) => (
        <MenuItem
            label="Visibility rules"
            icon={<Icon name="visibility-rules" />}
            onClick={() => openDialog((close) => <VisibilityRulesDialog item={item} onChange={onChange} onClose={close} />)}
        />
    ),
    ```

- `AdditionalItemContent` is shown in the item's header, next to its actions, e.g. as a `Chip` of `@dextinity/ui`.
- `BlockRow` renders a `Block` of `@dextinity/ui` and must be placed in a `BlockList`. Its props changed: it takes the `block` and its `state` and the callbacks of the menu (`onOpen`, `onCopy`, `onPaste`, `onDuplicate`, `onDelete`, `onVisibleChange`, `onCheckedChange`) instead of `renderPreviewContent`, `index`, `moveBlock`, `visibilityButton` and `onAddNewBlock`.
- The blocks no longer use react-dnd. Blocks can't be dragged between different lists anymore. Keep the `DndProvider` only if your project still uses react-dnd elsewhere (e.g. the page tree).
- `AddBlockDrawer` shows the `BlockPicker` of `@dextinity/ui` in a `Drawer`, with category filters and the recently used block types. MUI `Drawer` props and theme overrides no longer apply.
- The dialog shown when the clipboard can't be pasted is a `Dialog` of `@dextinity/ui`.
