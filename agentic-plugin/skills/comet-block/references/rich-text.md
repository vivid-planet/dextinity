# RichText Block Rules

Detailed rules for creating and configuring RichText blocks in Comet. Load this file when a block contains a rich text field.

---

## Overview

Two usage modes:

1. **Shared project-wide `RichTextBlock`** — defined once in `common/blocks/` and reused wherever full rich text is needed.
2. **Scoped `RichTextBlock`** — a locally defined `createRichTextBlock(...)` call inside the composite block file, configured for a specific purpose (single-line eyebrow, heading-only field, etc.).

The API block is always the shared one. Per-field configuration is **Admin-only**.

---

## API Side

The API block is project-wide regardless of how many Admin-side scoped variants exist.

```ts
// api/src/common/blocks/rich-text.block.ts
import { createRichTextBlock } from "@comet/cms-api";
import { LinkBlock } from "@src/common/blocks/link.block";

export const RichTextBlock = createRichTextBlock({ link: LinkBlock });
```

Options: `link` (required — the inline link block) and `indexSearchText` (optional boolean, defaults to `true`).

Use as a child block in composite blocks:

```ts
import { RichTextBlock } from "@src/common/blocks/rich-text.block";

class MyBlockData extends BlockData {
    @ChildBlock(RichTextBlock)
    description: BlockDataInterface;
}

class MyBlockInput extends BlockInput {
    @ChildBlockInput(RichTextBlock)
    description: ExtractBlockInput<typeof RichTextBlock>;

    transformToBlockData(): MyBlockData {
        return blockInputToData(MyBlockData, this);
    }
}
```

---

## Admin Side

```ts
import { createRichTextBlock } from "@comet/cms-admin";
```

Admin options: `link` (required), `rte` (partial `IRteOptions` — spread over defaults), `minHeight` (pixels, default ~150px), `tags`.

### Key `rte` options

| Option              | Purpose                                                           |
| ------------------- | ----------------------------------------------------------------- |
| `supports`          | Array of toolbar features to enable (see values below)            |
| `maxBlocks`         | Max paragraphs — set to `1` for single-line fields                |
| `standardBlockType` | Default block type, e.g. `"header-one"` or `"paragraph-standard"` |
| `blocktypeMap`      | Add custom block types or relabel existing ones                   |

**Available `supports` values:** `"bold"`, `"italic"`, `"underline"`, `"strikethrough"`, `"sub"`, `"sup"`, `"header-one"` through `"header-six"`, `"ordered-list"`, `"unordered-list"`, `"blockquote"`, `"history"`, `"link"`, `"links-remove"`, `"non-breaking-space"`, `"soft-hyphen"`.

**Default set** includes all of the above except `"underline"` and `"blockquote"`.

**Link rule:** when a `link` block is configured, always include `"link"` and `"links-remove"` in `supports` unless the field is intentionally link-free.

---

## Configuration Patterns

### Pattern 1: Shared Full RichTextBlock

Defined once per project in `common/blocks/`. No `rte` overrides needed for a standard full-featured editor.

```tsx
// admin/src/common/blocks/RichTextBlock.tsx
import { createRichTextBlock } from "@comet/cms-admin";
import { LinkBlock } from "./LinkBlock";

export const RichTextBlock = createRichTextBlock({ link: LinkBlock });
```

When projects need custom paragraph variants, configure `standardBlockType` and `blocktypeMap`:

> **Note:** `"paragraph-standard"` and `"paragraph-small"` below are **examples only**. The actual block type keys are entirely project-defined. Always check the project's `RichTextBlock` definition to see which custom block types are in use — or whether custom block types are used at all.

```tsx
export const RichTextBlock = createRichTextBlock({
    link: LinkBlock,
    rte: {
        standardBlockType: "paragraph-standard",
        blocktypeMap: {
            "paragraph-standard": {
                label: <FormattedMessage id="richTextBlock.paragraphStandard" defaultMessage="Paragraph Standard" />,
            },
            "paragraph-small": {
                label: <FormattedMessage id="richTextBlock.paragraphSmall" defaultMessage="Paragraph Small" />,
                renderConfig: {
                    element: (props) => <Typography paragraph variant="body2" {...props} />,
                },
            },
        },
    },
});
```

### Pattern 2: Single-Line Inline Field

For eyebrows, subtitles, captions — any field that should be a single line of formatted text.

Key settings:

- `maxBlocks: 1` — prevents Enter from creating new paragraphs
- `minHeight: 0` — compact editor height

```tsx
const DescriptionRichTextBlock = createRichTextBlock({
    link: LinkBlock,
    rte: {
        maxBlocks: 1,
        supports: ["bold", "italic", "sub", "sup", "non-breaking-space", "soft-hyphen", "link", "links-remove"],
    },
    minHeight: 0,
});
```

### Pattern 3: Heading-Only Field

For single-line heading/title fields where the user selects a heading level from a dropdown.

Key settings:

- `maxBlocks: 1` + `minHeight: 0` — single compact line
- `standardBlockType: "header-one"` — new content defaults to heading 1
- `blocktypeMap` — only add if the project uses custom heading label names. **Check existing RTE blocks in the project** to see how heading levels are labelled and match that convention. If no custom labels are used, omit `blocktypeMap`.

```tsx
const HeadlineRichTextBlock = createRichTextBlock({
    link: LinkBlock,
    rte: {
        maxBlocks: 1,
        supports: [
            "header-one",
            "header-two",
            "header-three",
            "header-four",
            "header-five",
            "header-six",
            "bold",
            "italic",
            "sub",
            "sup",
            "non-breaking-space",
            "soft-hyphen",
        ],
        standardBlockType: "header-one",
    },
    minHeight: 0,
});
```

### Pattern 4: Limited Feature Set

When the full RTE is too powerful for the context but multiline content is still needed.

```tsx
const BaseRichTextBlock = createRichTextBlock({
    link: ExternalLinkBlock,
    rte: {
        supports: ["bold", "italic", "header-one", "header-two", "header-three", "link", "links-remove"],
    },
});
```

---

## `blocktypeMap` Patterns

### Adding Custom Block Types

Custom block types are arbitrary strings outside Draft.js defaults. Define them in `blocktypeMap` and set `standardBlockType` if the custom type should be the default.

> **Note:** `"paragraph-standard"` and `"paragraph-small"` below are **examples only**. Block type keys are entirely project-defined — always look at the project's `RichTextBlock` definition to see what custom types are actually configured.

```tsx
blocktypeMap: {
    "paragraph-standard": {
        label: <FormattedMessage id="richTextBlock.paragraphStandard" defaultMessage="Paragraph Standard" />,
    },
    "paragraph-small": {
        label: <FormattedMessage id="richTextBlock.paragraphSmall" defaultMessage="Paragraph Small" />,
        renderConfig: {
            element: (props) => <Typography paragraph variant="body2" {...props} />,
        },
    },
},
```

When `standardBlockType` is set to something other than `"unstyled"`, the `"unstyled"` block type is hidden from the dropdown.

### Relabeling Existing Block Types

Override just `label` to rename existing types without changing behavior:

```tsx
blocktypeMap: {
    "header-one": {
        label: <FormattedMessage id="headingBlock.size600" defaultMessage="Size 600" />,
    },
},
```

---

## Naming Conventions

**Shared RichTextBlock:**

- API: `api/src/common/blocks/rich-text.block.ts`
- Admin: `admin/src/common/blocks/RichTextBlock.tsx`
- Site: `site/src/common/blocks/RichTextBlock.tsx`
- Export name: `RichTextBlock`

**Scoped RichTextBlock:** name descriptively as `{Purpose}RichTextBlock` (e.g., `EyebrowRichTextBlock`, `HeadlineRichTextBlock`, `DescriptionRichTextBlock`). Define as a non-exported `const` inside the composite block file:

```tsx
// Inside admin/src/documents/pages/blocks/TeaserItemBlock.tsx

const DescriptionRichTextBlock = createRichTextBlock({
    link: LinkBlock,
    rte: { maxBlocks: 1, supports: ["bold", "italic", "sub", "sup", "non-breaking-space", "soft-hyphen", "link", "links-remove"] },
    minHeight: 0,
});

export const TeaserItemBlock = createCompositeBlock({
    name: "TeaserItem",
    blocks: {
        description: {
            block: DescriptionRichTextBlock,
            title: <FormattedMessage id="teaserItemBlock.description" defaultMessage="Description" />,
        },
    },
});
```

---

## Site Side

```tsx
import { hasRichTextBlockContent, type PropsWithData, withPreview } from "@comet/site-nextjs";
import { type RichTextBlockData } from "@src/blocks.generated";
```

Use `hasRichTextBlockContent` to conditionally render:

```tsx
{
    hasRichTextBlockContent(description) && <RichTextBlock data={description} />;
}
```

When custom block types are added in the Admin, add matching entries in the site's `blocks` renderer map. The keys must exactly match what is defined in the project's Admin-side `RichTextBlock` configuration — `"paragraph-standard"` and `"paragraph-small"` below are **examples only**:

```tsx
blocks: {
    "paragraph-standard": createTextBlockRenderFn({ bottomSpacing: true }),
    "paragraph-small": createTextBlockRenderFn({ variant: "paragraph200", bottomSpacing: true }),
},
```

Do **not** wrap `RichTextBlock` in a `Typography` component — the block already defines its own typography through its renderers; wrapping produces conflicting styles.

---

## Decision Guide

| Scenario                                                      | Use Shared | Create Scoped              |
| ------------------------------------------------------------- | ---------- | -------------------------- |
| General content area with full formatting                     | Yes        | No                         |
| Short description or subtitle (single-line, basic formatting) | No         | Yes — single-line pattern  |
| Heading with size dropdown                                    | No         | Yes — heading-only pattern |
| Eyebrow text                                                  | No         | Yes — single-line pattern  |
| Email campaign with different link block                      | No         | Yes — different link block |
| Content area with fewer features than default                 | No         | Yes — limited feature set  |

**Rule of thumb:** if the field needs `maxBlocks`, a custom `supports` set, a custom `standardBlockType`, or a different `link` block — create a scoped RichTextBlock.

---

## Common Pitfalls

1. **Forgetting `minHeight: 0`** with `maxBlocks: 1` — editor area is unnecessarily tall for a single-line field.
2. **Adding custom block types in Admin without updating the site** — site renderers must include all custom block type keys or content using those types renders as nothing.
3. **Setting `standardBlockType` to a custom type without defining it in `blocktypeMap`** — the dropdown label renders incorrectly.
4. **Trying to customize the API block per-field** — the API block is shared; all per-field customization is Admin-only.
5. **Exporting scoped RichTextBlocks** — they must remain private (`const` without `export`) in the composite block file.
6. **Omitting `"link"` and `"links-remove"` when a link block is configured** — editors cannot add or remove links without these in `supports`.
7. **Wrapping `RichTextBlock` in `Typography` on the site** — produces double-wrapped, incorrectly styled output.
