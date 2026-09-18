# Block Registration Patterns

"Registering a block" means adding it to a **blocks block** (`createBlocksBlock`) so editors can select and use it in a content area. A newly created block is not available in the admin UI until it is registered in at least one blocks block. Registration must happen consistently across all three layers (API, Admin, Site).

---

## Registration Targets

Most Comet projects have a hierarchy of blocks blocks:

| Target                    | Purpose                                                                                                     | Typical Includes                                                                                                        |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **PageContentBlock**      | Top-level page content area. Editors build page content by adding blocks here.                              | All general-purpose blocks, including `columns`, `contentGroup`, `pageTreeIndex`, and any full-width page-level blocks. |
| **ContentGroupBlock**     | A grouped content section with a shared background color or visual wrapper. Used inside `PageContentBlock`. | Same as `PageContentBlock`, minus `contentGroup` (no self-nesting), `pageTreeIndex`, and page-level-only blocks.        |
| **ColumnsContentBlock**   | Content inside a single column of a `ColumnsBlock`. More restricted due to limited width.                   | Reduced set: `accordion`, `anchor`, `richText`, `space`, `heading`, `callToActionList`, `media`.                        |
| **AccordionContentBlock** | Content inside an accordion item. Very restricted.                                                          | Minimal set: `richText`, `heading`, `space`, `callToActionList`.                                                        |

Not all projects have all of these. Discover the project's blocks blocks by searching for `createBlocksBlock` usages.

---

## Default Registration Target

When the user does not specify where to register a block:

1. **Always add to `PageContentBlock`** -- the main content area.
2. **Also add to `ContentGroupBlock`** if it exists and the block is a general-purpose content block.
3. **Do not add to `ColumnsContentBlock`** or `AccordionContentBlock` unless explicitly requested.

Blocks that should typically **not** be added to `ContentGroupBlock`:

- `contentGroup` -- would cause self-nesting
- `pageTreeIndex` -- page-level navigation block
- Any full-width or page-level-only block (e.g., a hero block)
- Any block that is a layout container wrapping other blocks blocks

Blocks that should typically **not** be added to `ColumnsContentBlock`:

- `teaser`, `featureList`, `columns` -- too wide or complex for column layouts
- `contentGroup`, `pageTreeIndex` -- page-level blocks

---

## Consistent Keys Across Layers

The key used to register a block in `supportedBlocks` must be **identical across API, Admin, and Site**. The key is **camelCase** and typically matches the block's purpose or name (without "Block").

```ts
// API
supportedBlocks: { featureList: FeatureListBlock }

// Admin
supportedBlocks: { featureList: FeatureListBlock }

// Site
const supportedBlocks: SupportedBlocks = {
    featureList: (props) => <FeatureListBlock data={props} />,
};
```

A mismatch in keys causes data loss or runtime errors.

**Common key conventions:**

| Block                             | Typical Key        |
| --------------------------------- | ------------------ |
| `StandaloneRichTextBlock`         | `richText`         |
| `StandaloneHeadingBlock`          | `heading`          |
| `StandaloneMediaBlock`            | `media`            |
| `StandaloneCallToActionListBlock` | `callToActionList` |
| `ColumnsBlock`                    | `columns`          |
| `ContentGroupBlock`               | `contentGroup`     |
| `FeatureListBlock`                | `featureList`      |
| `TeaserBlock`                     | `teaser`           |
| `SpaceBlock`                      | `space`            |
| `AccordionBlock`                  | `accordion`        |
| `AnchorBlock`                     | `anchor`           |
| `ProductListBlock`                | `productList`      |

For new blocks, derive the key from the block name in camelCase without "Block" (e.g., `ProductListBlock` -> `productList`).

---

## Step-by-Step: Registering a Block

To register `FeatureListBlock` in `PageContentBlock`:

**1. API layer** -- add import and key to `supportedBlocks`:

```ts
import { FeatureListBlock } from "@src/documents/pages/blocks/feature-list.block";

export const PageContentBlock = createBlocksBlock(
    {
        supportedBlocks: {
            // ... existing blocks ...
            featureList: FeatureListBlock,
        },
    },
    "PageContent",
);
```

**2. Admin layer** -- same key:

```tsx
import { FeatureListBlock } from "@src/documents/pages/blocks/FeatureListBlock";

export const PageContentBlock = createBlocksBlock({
    name: "PageContent",
    supportedBlocks: {
        // ... existing blocks ...
        featureList: FeatureListBlock,
    },
});
```

**3. Site layer** -- same key, **render function** syntax:

```tsx
import { FeatureListBlock } from "@src/documents/pages/blocks/FeatureListBlock";

const supportedBlocks: SupportedBlocks = {
    // ... existing blocks ...
    featureList: (props) => <FeatureListBlock data={props} />,
};
```

In the Site layer, the value is a **render function** `(props) => <Component data={props} />`. Some blocks use a `PageContent`-prefixed wrapper for layout purposes (e.g., `heading: (props) => <PageContentStandaloneHeadingBlock data={props} />`). Use the wrapper variant if it exists.

---

## Registering in Multiple Targets

When a block should be in both `PageContentBlock` and `ContentGroupBlock`, add it to both. The `ContentGroupBlock` has its own inner blocks block (typically `ContentGroupContentBlock` or `ContentBlock`) defined locally inside the `ContentGroupBlock` file.

Repeat the same key in all targets. Repeat the pattern in Admin and Site layers for each target.

---

## ContentGroupBlock Structure

`ContentGroupBlock` is a **composite block** wrapping a blocks block as a child. It is itself registered inside `PageContentBlock`:

```
PageContentBlock (blocks block)
├── contentGroup: ContentGroupBlock (composite block)
│   ├── backgroundColor (select field)
│   └── content: ContentGroupContentBlock (blocks block)
│       ├── accordion, anchor, space, teaser, richText, heading, ...
│       └── (same as PageContentBlock minus contentGroup, pageTreeIndex, and page-level-only blocks)
├── columns: ColumnsBlock (composite block)
│   └── columns[].content: ColumnsContentBlock (blocks block)
│       └── accordion, anchor, richText, space, heading, callToActionList, media
├── accordion, richText, heading, media, featureList, teaser, ...
└── pageTreeIndex, and any other page-level-only blocks
```

---

## Discovering Registration Targets

1. **Search for `createBlocksBlock`** across the API directory to find all blocks blocks.
2. **Check `PageContentBlock`** first -- it is the primary registration target.
3. **Check `ContentGroupBlock`** -- if it exists and has similar blocks, also register there.
4. **Inspect `ColumnsBlock`** and `AccordionBlock` -- only add blocks there if they suit constrained-width contexts.
5. **Use the same key** in all targets.
