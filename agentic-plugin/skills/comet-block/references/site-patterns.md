# Site Block Patterns

Comet-specific conventions for the site layer. All site blocks live in `{BlockName}Block.tsx` (PascalCase) under `site/src/`, typically `documents/pages/blocks/` or `common/blocks/`.

Skip site block creation when the project has no `site` directory.

---

## Imports

```tsx
import {
    BlocksBlock,
    hasRichTextBlockContent,
    ListBlock,
    OneOfBlock,
    OptionalBlock,
    PreviewSkeleton,
    type PropsWithData,
    SvgImageBlock,
    type SupportedBlocks,
    withPreview,
} from "@comet/site-nextjs";
import { type MyBlockData } from "@src/blocks.generated";
```

`@src/blocks.generated` types are auto-generated from the API layer — always import with `type`, never maintain manually.

---

## withPreview

Wrap **every** site block with `withPreview`. This enables the admin preview overlay. The `label` appears in the overlay.

```tsx
export const MyBlock = withPreview(
    ({ data: { title, image } }: PropsWithData<MyBlockData>) => (
        <div>
            <h2>{title}</h2>
            <DamImageBlock data={image} aspectRatio="16x9" />
        </div>
    ),
    { label: "My Block" },
);
```

**Exception:** Top-level `PageContentBlock` and `PageContent`-wrapper variants are **not** wrapped with `withPreview` — they delegate to the inner block which is already wrapped.

---

## DamImageBlock Site Wrapper

The site layer does **not** use `DamImageBlock` from a `@comet` package. It uses the site-specific wrapper, typically at `@src/common/blocks/DamImageBlock`:

```tsx
// Wrong: import from cms-api
import { DamImageBlock } from "@comet/cms-api";

// Correct: import site wrapper
import { DamImageBlock } from "@src/common/blocks/DamImageBlock";
```

Always pass `aspectRatio`. Optionally pass `sizes` for responsive images:

```tsx
<DamImageBlock data={image} aspectRatio="16x9" sizes="(max-width: 768px) 100vw, 50vw" />
```

---

## Guarding Optional Content

**Rich text** — always use `hasRichTextBlockContent`. Never render a `RichTextBlock` without this guard:

```tsx
{
    hasRichTextBlockContent(description) && <RichTextBlock data={description} />;
}
```

**SVG image blocks** — check `damFile`:

```tsx
{
    icon.damFile && <SvgImageBlock data={icon} width={48} height={48} />;
}
```

**Nullable strings** — standard JS truthiness:

```tsx
{
    title && <h2>{title}</h2>;
}
```

`BlocksBlock`, `ListBlock`, `OneOfBlock`, and `OptionalBlock` handle their own empty states — no guard needed.

---

## BlocksBlock (PageContentBlock)

Define `supportedBlocks` as a **module-level constant**, never inside the component body (prevents recreation on every render).

Keys must exactly match the API and Admin layer keys.

```tsx
const supportedBlocks: SupportedBlocks = {
    richText: (props) => <StandaloneRichTextBlock data={props} />,
    heading: (props) => <StandaloneHeadingBlock data={props} />,
    media: (props) => <StandaloneMediaBlock data={props} />,
};

export const PageContentBlock = ({ data }: PropsWithData<PageContentBlockData>) => {
    return <BlocksBlock data={data} supportedBlocks={supportedBlocks} />;
};
```

---

## ListBlock

Pass the entire `data` object (not `data.blocks`). To access item count, use `data.blocks.length` alongside the `ListBlock`:

```tsx
export const FeatureListBlock = withPreview(
    ({ data }: PropsWithData<FeatureListBlockData>) => (
        <div style={{ "--list-item-count": data.blocks.length }}>
            <ListBlock data={data} block={(block) => <FeatureItemBlock data={block} />} />
        </div>
    ),
    { label: "Feature List" },
);
```

---

## OneOfBlock and OptionalBlock

See [block-types.md](block-types.md) for full usage. Quick reference:

- `OneOfBlock` — renders the selected block from a mutually exclusive set. Returns `null` when nothing is selected.
- `OptionalBlock` — renders a block with a visibility toggle. Returns `null` when `visible` is `false`.

Both accept a `supportedBlocks` map defined at module level.

---

## Standalone and PageContent Wrapper Pattern

When a block appears in both `PageContentBlock` (needs layout wrapper) and other contexts (layout provided by parent), export two components:

```tsx
// Inner block — used standalone or nested; always withPreview
export const StandaloneHeadingBlock = withPreview(
    ({ data: { heading } }: PropsWithData<StandaloneHeadingBlockData>) => (
        <div>
            <HeadingBlock data={heading} />
        </div>
    ),
    { label: "Heading" },
);

// PageContent wrapper — adds layout; NOT withPreview (delegates to inner)
export const PageContentStandaloneHeadingBlock = (props: PropsWithData<StandaloneHeadingBlockData>) => (
    <PageLayout grid>
        <div className={styles.pageLayoutContent}>
            <StandaloneHeadingBlock {...props} />
        </div>
    </PageLayout>
);
```

Register the `PageContent`-prefixed variant in the `PageContentBlock` `supportedBlocks` map and the plain variant wherever the block appears nested in other blocks.

---

## "use client" Directive

Add `"use client"` at the top of the file when the block uses:

- React hooks (`useState`, `useEffect`, `useRef`, `useId`, `useContext`, etc.)
- Event handlers (`onClick`, `onChange`, etc.)
- Client-only library imports
- `usePreview()` from `@comet/site-nextjs`

Most simple composite and list blocks do **not** need `"use client"`.

---

## Naming Conventions

| Element                | Convention                                               | Example                             |
| ---------------------- | -------------------------------------------------------- | ----------------------------------- |
| File name              | PascalCase ending in `Block.tsx`                         | `ProductCardBlock.tsx`              |
| Exported constant      | `{BlockName}Block`                                       | `ProductCardBlock`                  |
| `withPreview` label    | Short human-readable name                                | `"Stage"`, `"Feature Item"`         |
| `supportedBlocks` keys | camelCase, matching API and Admin keys exactly           | `richText`, `heading`               |
| CSS module file        | `{BlockName}Block.module.scss`                           | `ProductCardBlock.module.scss`      |
| Data type import       | `type {BlockName}BlockData` from `@src/blocks.generated` | `type ProductCardBlockData`         |
| PageContent wrapper    | `PageContent{BlockName}Block`                            | `PageContentStandaloneHeadingBlock` |
| Local/nested blocks    | Descriptive PascalCase, not exported                     | `AccordionContentBlock`             |
