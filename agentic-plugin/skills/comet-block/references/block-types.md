# Block Types Overview

Comet provides five core block types. Choose based on how content editors interact with the block.

## Decision Guide

| Question                                      | Block Type          |
| --------------------------------------------- | ------------------- |
| Fixed set of named fields/child blocks?       | **Composite block** |
| Multiple items of the same type (array)?      | **List block**      |
| Flexible content area with many block types?  | **Blocks block**    |
| Choose exactly one from several alternatives? | **One-of block**    |
| Single block that can be toggled on/off?      | **Optional block**  |

**Common combinations:**

- A **list block** wraps a **composite block** as its item (e.g., `FeatureListBlock` wraps `FeatureItemBlock`).
- A **blocks block** contains multiple **composite blocks** and **list blocks** as supported blocks.
- A **composite block** may use a **one-of block** or **optional block** as a child property.
- A **one-of block** is commonly used inside a **composite block** for media selection or link types.

---

## Composite Block

A composite block groups a fixed set of named properties. Each property is either a **field** (string, number, enum, boolean) or a **child block**.

**When to use:** Most custom blocks are composite blocks. Use when the block has a known, fixed structure -- e.g., a teaser with a title, image, description, and link.

**API:** Define `BlockData` and `BlockInput` classes manually, then export with `createBlock`.

```ts
class FeatureItemBlockData extends BlockData {
    @ChildBlock(SvgImageBlock)
    icon: BlockDataInterface;

    @BlockField()
    title: string;

    @ChildBlock(RichTextBlock)
    description: BlockDataInterface;
}

class FeatureItemBlockInput extends BlockInput {
    @ChildBlockInput(SvgImageBlock)
    icon: ExtractBlockInput<typeof SvgImageBlock>;

    @BlockField()
    @IsString()
    title: string;

    @ChildBlockInput(RichTextBlock)
    description: ExtractBlockInput<typeof RichTextBlock>;

    transformToBlockData(): FeatureItemBlockData {
        return blockInputToData(FeatureItemBlockData, this);
    }
}

export const FeatureItemBlock = createBlock(FeatureItemBlockData, FeatureItemBlockInput, "FeatureItem");
```

**Admin:** Use `createCompositeBlock` to compose child blocks and fields.

```tsx
export const FeatureItemBlock = createCompositeBlock(
    {
        name: "FeatureItem",
        displayName: <FormattedMessage id="featureItemBlock.displayName" defaultMessage="Feature Item" />,
        blocks: {
            icon: {
                block: SvgImageBlock,
                title: <FormattedMessage id="featureItemBlock.icon" defaultMessage="Icon" />,
            },
            title: {
                block: createCompositeBlockTextField({
                    label: <FormattedMessage id="featureItemBlock.title" defaultMessage="Title" />,
                }),
            },
            description: {
                block: RichTextBlock,
                title: <FormattedMessage id="featureItemBlock.description" defaultMessage="Description" />,
            },
        },
    },
    (block) => {
        block.previewContent = (state) => [{ type: "text", content: state.title }];
        return block;
    },
);
```

**Site:** Plain React component with `PropsWithData` and `withPreview`.

```tsx
export const FeatureItemBlock = withPreview(
    ({ data: { icon, title, description } }: PropsWithData<FeatureItemBlockData>) => (
        <div>
            <SvgImageBlock data={icon} />
            <strong>{title}</strong>
            {hasRichTextBlockContent(description) && <RichTextBlock data={description} />}
        </div>
    ),
    { label: "Feature Item" },
);
```

---

## List Block

A list block wraps a **single child block type** and allows editors to add multiple instances of that block.

**When to use:** When the editor should be able to add, remove, and reorder multiple items of the same type -- e.g., a list of teasers, accordion items, slider slides.

**Important:** You cannot define a `BlockDataInterface` or `ExtractBlockInput` as an array. Always create a list block wrapping an item block to represent an array of blocks.

**API:** `createListBlock({ block: FeatureItemBlock }, "FeatureList")`

**Admin:** `createListBlock({ name: "FeatureList", block: FeatureItemBlock, itemName: ..., itemsName: ... })`

**Site:** `<ListBlock data={data} block={(props) => <FeatureItemBlock data={props} />} />`

---

## Blocks Block

A blocks block allows editors to **pick from multiple different block types** and add them in any order.

**When to use:** For flexible content areas -- e.g., `PageContentBlock` that supports rich text, images, teasers, accordions, and more. Use when you need two or more supported block types; for a single type use a list block instead.

**Key rule:** The keys in `supportedBlocks` must be **identical across all three layers** (API, Admin, Site). Use camelCase.

**API:** `createBlocksBlock({ supportedBlocks: { richText: ..., heading: ..., media: ... } }, "PageContent")`

**Admin:** `createBlocksBlock({ name: "PageContent", supportedBlocks: { ... } })`

**Site:** `<BlocksBlock data={data} supportedBlocks={supportedBlocks} />`

---

## One-of Block

A one-of block lets the editor **choose exactly one block type** from a set of options. Only the selected block is active.

**When to use:** When content requires choosing between mutually exclusive alternatives -- e.g., a `MediaBlock` that is either an image, a DAM video, a YouTube video, or a Vimeo video.

**Difference from blocks block:** A blocks block allows adding many items of different types in a list. A one-of block allows picking **one** active type.

**API:**

```ts
export const MediaBlock = createOneOfBlock(
    {
        supportedBlocks: {
            image: DamImageBlock,
            damVideo: DamVideoBlock,
            youTubeVideo: YouTubeVideoBlock,
        },
    },
    "Media",
);
```

**Admin:** Use `createOneOfBlock` with UI configuration. The `variant` option controls presentation:

- `"select"` (default) -- dropdown select field
- `"radio"` -- radio button group
- `"toggle"` -- toggle button group (best for 2--4 options)

Set `allowEmpty: false` to require a selection (no "None" option).

```tsx
export const MediaBlock = createOneOfBlock({
    supportedBlocks: { image: DamImageBlock, damVideo: DamVideoBlock, youTubeVideo: YouTubeVideoBlock },
    name: "Media",
    displayName: <FormattedMessage id="mediaBlock.displayName" defaultMessage="Media" />,
    allowEmpty: false,
    variant: "toggle",
    category: BlockCategory.Media,
});
```

**Site:** Use the `OneOfBlock` component with a module-level `SupportedBlocks` map.

```tsx
const supportedBlocks: SupportedBlocks = {
    image: (data) => <DamImageBlock data={data} />,
    damVideo: (data) => <DamVideoBlock data={data} />,
    youTubeVideo: (data) => <YouTubeVideoBlock data={data} />,
};

export const MediaBlock = withPreview(({ data }: PropsWithData<MediaBlockData>) => <OneOfBlock data={data} supportedBlocks={supportedBlocks} />, {
    label: "Media",
});
```

---

## Optional Block

An optional block wraps a **single block** and adds a visibility toggle.

**When to use:** When content is truly optional and should have an explicit on/off switch. Use sparingly -- prefer empty-state handling over optional blocks. Only use `createOptionalBlock` when there is a clear UX need for an explicit toggle.

**API:** `createOptionalBlock(RichTextBlock)` -- used as a child block inside a composite block.

**Admin:** `createOptionalBlock(RichTextBlock, { title: <FormattedMessage ... /> })`

**Site:** `<OptionalBlock data={content} block={(props) => <RichTextBlock data={props} />} />`
