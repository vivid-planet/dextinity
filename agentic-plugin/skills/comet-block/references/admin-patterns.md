# Admin Block Patterns

Admin blocks live in `admin/src/`, typically under `documents/pages/blocks/` or `common/blocks/`. File names use PascalCase: `{BlockName}Block.tsx`.

---

## Imports

```tsx
import {
    BlockCategory,
    createCompositeBlock,
    createCompositeBlockSelectField,
    createCompositeBlockSwitchField,
    createCompositeBlockTextField,
} from "@comet/cms-admin";
import { type MyBlockData } from "@src/blocks.generated";
import { FormattedMessage } from "react-intl";
```

Image blocks (`DamImageBlock`, `PixelImageBlock`, `SvgImageBlock`) are imported from `@comet/cms-admin`.

---

## createCompositeBlock

```tsx
export const MyBlock = createCompositeBlock(
    {
        name: "My", // PascalCase, no "Block" suffix; must match API
        displayName: <FormattedMessage id="myBlock.displayName" defaultMessage="My" />,
        category: BlockCategory.TextAndContent, // only when used inside a blocks block
        blocks: {
            /* ... */
        },
    },
    (block) => {
        block.previewContent = (state) => [{ type: "text", content: state.title }];
        return block;
    },
);
```

The second argument (override function) is optional. Always return the block from it.

---

## Block Configuration Object Keys

Each key in `blocks` maps to a property from the API. The value is a configuration object with:

- `block` — the block instance or field helper (required)
- `title` — section heading above the block; use `FormattedMessage`
- `hiddenInSubroute` — hide when user navigates into a sub-route (see below)
- `nested` — render as a nested page with a navigation button instead of inline
- `paper` — wrap in a card container
- `divider` — show a divider below (only inside a paper container)
- `hiddenForState` — `(state) => boolean`; conditionally hide based on block state

### `label` vs `title` — mutually exclusive

- Field helpers (`createCompositeBlockTextField`, `createCompositeBlockSelectField`, `createCompositeBlockSwitchField`) accept a `label` prop that renders inline with the field.
- The block configuration entry has a `title` prop that renders as a section heading above the block.
- **Never set both.** When the helper has a `label`, omit `title` on the entry. When the helper has no `label`, provide `title` on the entry.

```tsx
// Correct: label on the helper, no title on the entry
title: {
    block: createCompositeBlockTextField({
        label: <FormattedMessage id="myBlock.title" defaultMessage="Title" />,
    }),
},

// Correct: no label on the helper, title on the entry
image: {
    block: DamImageBlock,
    title: <FormattedMessage id="myBlock.image" defaultMessage="Image" />,
},
```

### `fullWidth` default

`createCompositeBlockTextField`, `createCompositeBlockSelectField`, and `createCompositeBlockSwitchField` all default `fullWidth` to `true`. Do not pass it explicitly unless overriding to `false`.

---

## hiddenInSubroute Rules

When a composite block contains sub-route children (list blocks, blocks blocks, one-of blocks), the admin renders them in a nested route. Sibling entries that are not sub-route blocks must be hidden while the user is inside the sub-route, otherwise the layout breaks.

**Rule:** Set `hiddenInSubroute: true` on every entry that is **not** itself a sub-route block. **Never set it on list/blocks/one-of block entries** — they must stay visible to show their sub-route content.

```tsx
blocks: {
    // Non-sub-route entries: hide in sub-route
    title: {
        block: createCompositeBlockTextField({
            label: <FormattedMessage id="myBlock.title" defaultMessage="Title" />,
        }),
        hiddenInSubroute: true,
    },
    variant: {
        block: createCompositeBlockSelectField<MyBlockData["variant"]>({
            defaultValue: "primary",
            options: variantOptions,
            label: <FormattedMessage id="myBlock.variant" defaultMessage="Variant" />,
        }),
        hiddenInSubroute: true,
    },
    // Sub-route entry: do NOT set hiddenInSubroute
    items: {
        block: MyItemsListBlock,
    },
},
```

If the composite has **no** sub-route children, omit `hiddenInSubroute` entirely.

---

## BlockCategory Enum

Import from `@comet/cms-admin`. Only set when the block is used inside a blocks block.

| Value               | Typical use                           |
| ------------------- | ------------------------------------- |
| `TextAndContent`    | Text, headings, rich text, accordions |
| `Media`             | Images, videos, galleries             |
| `Navigation`        | Links, CTAs, anchors                  |
| `Teaser`            | Teasers, stage blocks                 |
| `StructuredContent` | Data-driven / structured content      |
| `Layout`            | Columns, spacers, layout wrappers     |
| `Form`              | Form blocks                           |
| `Other`             | Default when no category fits         |

Set via the `category` option or in the override function:

```tsx
(block) => {
    block.category = BlockCategory.Media;
    return block;
};
```

---

## previewContent Callback

Controls the collapsed preview row of a block inside list/blocks blocks. Set in the override function.

```tsx
// Show a string field
block.previewContent = (state) => [{ type: "text", content: state.title }];

// Handle optional fields
block.previewContent = (state) => (state.title !== undefined ? [{ type: "text", content: state.title }] : []);

// Nothing to show
block.previewContent = () => [];
```

Always set `previewContent` for blocks shown inside list or blocks blocks. Always guard optional fields to avoid returning undefined as content.

---

## FormattedMessage ID Conventions

All user-facing strings use `FormattedMessage` from `react-intl`. Always provide `defaultMessage`.

| Context               | ID pattern                             | Example                           |
| --------------------- | -------------------------------------- | --------------------------------- |
| Block display name    | `{blockName}Block.displayName`         | `featureItemBlock.displayName`    |
| Field label / title   | `{blockName}Block.{fieldName}`         | `featureItemBlock.title`          |
| Select option label   | `{blockName}Block.{fieldName}.{value}` | `featureItemBlock.alignment.left` |
| List block item name  | `{blockName}Block.itemName`            | `featureListBlock.itemName`       |
| List block items name | `{blockName}Block.itemsName`           | `featureListBlock.itemsName`      |

IDs use camelCase dot-separated segments. The block name segment uses the full block name with "Block" suffix (`featureItemBlock`, not `featureItem`).

---

## Naming Conventions

| Element                      | Convention                             | Example                              |
| ---------------------------- | -------------------------------------- | ------------------------------------ |
| File name                    | PascalCase ending in `Block.tsx`       | `ProductCardBlock.tsx`               |
| Exported constant            | `{BlockName}Block`                     | `ProductCardBlock`                   |
| `name` option                | PascalCase, **no** "Block" suffix      | `"ProductCard"`                      |
| Keys in `blocks`             | camelCase, matching API property names | `callToActionList`, `titleHtmlTag`   |
| Keys in `supportedBlocks`    | camelCase, matching API and Site keys  | `richText`, `heading`, `featureList` |
| FormattedMessage IDs         | camelCase dot-separated                | `productCardBlock.displayName`       |
| Locally-scoped helper blocks | Descriptive PascalCase                 | `DescriptionRichTextBlock`           |
