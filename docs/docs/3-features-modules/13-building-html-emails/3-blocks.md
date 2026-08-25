---
title: Blocks
---

`@dextinity/mail-react` ships basic block components to render Dextinity CMS block data types. Where the [base components](./2-components-and-theme.md) handle generic layout and typography, block components are tied to specific `*BlockData` shapes from the CMS schema.

:::info
For background on the broader Dextinity block system — what blocks are, how they're authored, and how block data flows from API to admin to site — see [Blocks](../../2-core-concepts/2-blocks/index.md) in the core concepts.
:::

## Pixel-image blocks

Two components render `PixelImageBlockData` from the CMS — one for MJML context, one for raw HTML.

| Component             | Renders                 | Use within                                                                        |
| --------------------- | ----------------------- | --------------------------------------------------------------------------------- |
| `MjmlPixelImageBlock` | re-exported `MjmlImage` | an `MjmlColumn` (standard MJML layout model)                                      |
| `HtmlPixelImageBlock` | raw `<img>`             | raw HTML or [MJML ending tags](./1-email-basics.md#ending-tags) such as `MjmlRaw` |

Inside `MjmlRaw` in an `MjmlColumn`, `HtmlPixelImageBlock` needs its own `<tr>` and `<td>` — see [Start Raw Content Inside a Column With `<tr>`](./1-email-basics.md#start-raw-content-inside-a-column-with-tr).

```tsx
import { MjmlColumn, MjmlPixelImageBlock, MjmlSection } from "@dextinity/mail-react";

<MjmlSection indent>
    <MjmlColumn>
        <MjmlPixelImageBlock data={pixelImageData} width={536} />
    </MjmlColumn>
</MjmlSection>;
```

### Configuration

Both blocks read `validSizes` and `baseUrl` from `config.pixelImageBlock`. In a typical Dextinity project, `validSizes` is the union of `dextinityConfig.images.imageSizes` and `dextinityConfig.images.deviceSizes`; `baseUrl` is the API URL.

```tsx title="src/emails/WelcomeEmail.tsx"
import { MjmlMailRoot, type Config } from "@dextinity/mail-react";

const config: Config = {
    pixelImageBlock: {
        validSizes: [...dextinityConfig.images.imageSizes, ...dextinityConfig.images.deviceSizes],
        baseUrl: process.env.API_URL,
    },
};

<MjmlMailRoot config={config}>
    {/* Pixel-image blocks anywhere in the tree read this config */}
</MjmlMailRoot>;
```

### Render width

The `width` prop is the desktop render width — the width at which the image displays in the default breakpoint. The block picks an actual source size from `config.pixelImageBlock.validSizes`, accounting for retina displays.

```tsx
<MjmlPixelImageBlock data={pixelImageData} width={536} />
```

Use `largestPossibleRenderWidth` when an image stretches wider on a narrower breakpoint than its desktop render width — e.g. in a two-column layout that stacks on mobile. The default is `theme.sizes.bodyWidth`.

```tsx
<MjmlPixelImageBlock data={pixelImageData} width={300} largestPossibleRenderWidth={420} />
```

### Aspect ratio

By default, the rendered aspect ratio comes from the DAM crop area. The `aspectRatio` prop overrides it — useful when the same image renders at different ratios across templates. Accepts a number or a `"WxH"` / `"W:H"` / `"W/H"` string.

```tsx
<MjmlPixelImageBlock data={pixelImageData} width={536} aspectRatio="16x9" />
```

### Responsive scaling

On viewports narrower than the default body width, both blocks automatically scale the rendered image to fit its container.

## Rich-text blocks

The `createRichTextBlock` factory creates components that render `RichTextBlockData` (draft-js raw content) from the CMS. It returns one component for the MJML context and one for raw HTML, both driven by the same configuration.

| Component           | Renders each draft block as | Use within                                                                        |
| ------------------- | --------------------------- | --------------------------------------------------------------------------------- |
| `MjmlRichTextBlock` | `MjmlText`                  | an `MjmlColumn` (standard MJML layout model)                                      |
| `HtmlRichTextBlock` | `HtmlText` (`<div>`)        | raw HTML or [MJML ending tags](./1-email-basics.md#ending-tags) such as `MjmlRaw` |

Inside `MjmlRaw` in an `MjmlColumn`, `HtmlRichTextBlock` needs its own `<tr>` and `<td>` — see [Start Raw Content Inside a Column With `<tr>`](./1-email-basics.md#start-raw-content-inside-a-column-with-tr).

Call the factory once — at the top level of a file, not inside a component — and export the returned components:

```tsx title="src/emails/blocks/richText.ts"
import { createRichTextBlock } from "@dextinity/mail-react";

export const { MjmlRichTextBlock, HtmlRichTextBlock } = createRichTextBlock({
    blockTypes: {
        "header-one": { variant: "heading1" },
        "header-two": { variant: "heading2" },
        "paragraph-standard": { variant: "body" },
    },
});
```

Usage sites then pass only the block data:

```tsx
<MjmlSection indent>
    <MjmlColumn>
        <MjmlRichTextBlock data={richTextData} />
    </MjmlColumn>
</MjmlSection>
```

### Block type configuration

The `blockTypes` option maps the application's draft block types to the styling of the text component that renders them. Each entry accepts a theme [text variant](./2-components-and-theme.md), plain style values (`color`, `fontSize`, `fontWeight`, …), a `className`, and a `list` kind.

The factory works without any configuration: `createRichTextBlock()` renders every draft block with the base `theme.text` styles, as do block types missing from `blockTypes`. This makes the block usable before any text variants exist in the theme.

Style values in `blockTypes` don't support responsive values — define a theme variant for responsive styling, or set a `className` and register responsive CSS via `registerStyles`. For a list block type, such a rule has to target `.<className> .richTextBlock__listItemText`, because the list's cells carry their own font styles.

An entry's `list` property selects the list renderer instead of the paragraph one. A draft block has only one block type, so a list in a second text variant needs a custom block type. The application adds that block type to its RTE, and its entry here declares the kind of list:

```tsx
export const { MjmlRichTextBlock, HtmlRichTextBlock } = createRichTextBlock({
    blockTypes: {
        "unordered-list-item": { variant: "copy" },
        "unordered-list-item-large": { variant: "copyLarge", list: "unordered" },
        "ordered-list-item-large": { variant: "copyLarge", list: "ordered" },
    },
});
```

`unordered-list-item` and `ordered-list-item` are draft-js's own list types. They default to their kind, so they render as lists without a `list` entry. Every other block type is a paragraph unless it sets one.

:::note
Draft-js handles the nesting level of `unordered-list-item` and `ordered-list-item` only. An editor cannot indent a custom list block type.
:::

### Link types

`LINK` entities reference a link block (`{ type, props }`). The `external` link type is built in and renders as `HtmlInlineLink`. Add the application's other link types via the `linkTypes` option — a resolver per link block type that receives the link block's props and returns the `href`, or `undefined` to render the text without a link. Annotate each resolver's parameter with the application's generated block-data type so the props are typed without redeclaring their shape:

```tsx
import type { PhoneLinkBlockData } from "@src/blocks.generated";

export const { MjmlRichTextBlock, HtmlRichTextBlock } = createRichTextBlock({
    linkTypes: {
        phone: (props: PhoneLinkBlockData) => (props.phone ? `tel:${props.phone}` : undefined),
    },
});
```

Link types without a resolver render their text as plain text.

### Inline styles

Inline style ranges (`BOLD`, `ITALIC`, `SUB`, `SUP`, `STRIKETHROUGH`) render with built-in renderers. The `inline` option maps a draft-js inline style name to a renderer and merges over those built-ins, so you can override one while the others keep their defaults:

```tsx
export const { MjmlRichTextBlock, HtmlRichTextBlock } = createRichTextBlock({
    inline: {
        BOLD: (children, { key }) => (
            <strong key={key} style={{ fontWeight: "bold", color: "#cc0000" }}>
                {children}
            </strong>
        ),
    },
});
```

The same option renders **custom** inline styles an application adds to its RTE via `customInlineStyles` on `IRteOptions` (see `@dextinity/admin-rte`). The style name you configure there — for example `HIGHLIGHT` — is stored verbatim in the content's inline style ranges but carries no styling of its own, so the email defines how it looks:

```tsx
export const { MjmlRichTextBlock, HtmlRichTextBlock } = createRichTextBlock({
    inline: {
        HIGHLIGHT: (children, { key }) => (
            <span key={key} style={{ backgroundColor: "#ff0000", color: "#ffffff" }}>
                {children}
            </span>
        ),
    },
});
```

:::note
Register the renderer under the exact style name used in the RTE. Prefer inline HTML elements known to render across email clients — `<span>`, `<strong>`, `<em>` — and set explicit styles rather than relying on a tag's defaults, which email clients apply inconsistently.
:::

### Multiple configurations

Each factory call is independent, so an application can create differently-configured pairs and name them by use case:

```tsx
export const {
    MjmlRichTextBlock: MjmlHeadlineRichTextBlock,
    HtmlRichTextBlock: HtmlHeadlineRichTextBlock,
} = createRichTextBlock({
    blockTypes: {
        "header-one": { variant: "heading1" },
        "header-two": { variant: "heading2" },
    },
});
```

### Rendering behavior

- Each draft block renders as its own text component; spacing between blocks comes from the theme's `bottomSpacing`, and the last block gets none.
- Each list renders as a table inside one text component, with a row per item, a marker cell and a text cell — the indent and the marker gap are cell padding, which is the only spacing Outlook on Windows applies reliably.
- Consecutive draft blocks form one list only while their block type stays the same. Two list block types that follow each other render as two tables, and the numbered one starts again at `1.`
- A nested level takes its font styles from the list around it, because MJML cannot place one text component inside another.
- List spacing comes from the theme's `list.indent` (before the marker), `list.markerGap` (between the marker and the text) and `list.itemSpacing` (between items, and above a nested level's first item), all responsive and all applying to every list the block renders. To override it, register a rule scoped to a list's type, depth or variant modifier with `{ inline: true }`, which has MJML write the declaration into the cell's `style` attribute at compile time so it also reaches Outlook.
- The markers come from the theme's `list.unorderedMarker` and `list.orderedMarker`, each either a fixed node (`unorderedMarker: "▪"`) or a function receiving the item's `index`, counting from zero within its own list, and `depth`, the nesting level of that list.
- A marker must be a plain HTML element, not an MJML component. A marker wider than the others widens the marker column and moves the text edge with it.
- Headings are styled text, not semantic `<h1>` elements, matching the text components' design.
- Empty draft blocks are skipped; when the data contains no text at all, the block renders nothing.
- Rendered elements carry `richTextBlock__text`, `richTextBlock__list`, `richTextBlock__listItem`, `richTextBlock__listItemMarker`, `richTextBlock__listItemText`, and `richTextBlock__link` class names for targeting with [registerStyles](./2-components-and-theme.md). The list table also carries `richTextBlock__list--ordered` or `richTextBlock__list--unordered`, and `richTextBlock__list--depth<Level>` naming its nesting level, counting the outermost as zero, with `richTextBlock__list--nested` on every level below that one. Only the outermost table names the text variant its items render with, such as `richTextBlock__list--variantBody`, and a rule scoped to that modifier applies to the nested levels as well. The rows carry `richTextBlock__listItem--itemSpacing`, or `richTextBlock__listItem--blockSpacing` on the last row when spacing follows the list, and `richTextBlock__listItem--itemSpacingAbove` on a nested level's first row, which carries the item spacing as `padding-top`. The cells restate the text styles inline, so a rule targeting list text needs `!important`.
