---
title: Layout Patterns
---

This page provides ready-to-use layout recipes that combine the concepts from [Email Basics](./1-email-basics.md), [Theme & Base Components](./2-components-and-theme.md), and [Customization](./5-customization.md) into complete, tested patterns.

## How Column Gaps Work in MJML

MJML has no `gap` property. Column padding reduces the **content area inside** the column — it doesn't add space between the column cells themselves. To create a visual gap between adjacent columns, apply padding to their inner edges: `paddingRight` on the left column and `paddingLeft` on the right column. The sum of the two becomes the visible gap.

Do **not** apply equal padding on all sides of every column — this adds extra spacing on the outer edges that compounds with the section's `indent` padding, pushing content inward beyond the theme's `contentIndentation`.

### CSS Targeting for Column Padding

MJML compiles column padding to an inner `<td>`, not the outer `<div>` that receives the `className`. To override column padding in responsive styles, target the inner cell:

```css
.myColumn > table > tbody > tr > td {
    padding-left: 0 !important;
}
```

Properties like `margin-bottom` that apply to the column wrapper itself use the plain class name without the table path. All responsive overrides require `!important` because MJML applies styles inline, and inline styles take precedence over `<style>` block rules.

:::tip
Use `theme.breakpoints.mobile.belowMediaQuery` (or `theme.breakpoints.default.belowMediaQuery`) instead of hardcoded media queries to keep responsive styles in sync with the theme's breakpoint configuration.
:::

## Symmetric Two-Column Layout

Two equal-width columns with a gap between them, stacking vertically on mobile.

```
┌───────────────────────────────────────────────────────────┐
│ MjmlSection indent                                        │
│ ┌──────────────────────────┐ ┌──────────────────────────┐ │
│ │ MjmlColumn               │ │ MjmlColumn               │ │
│ │ paddingRight={halfGap}   │ │ paddingLeft={halfGap}    │ │
│ │                          │ │                          │ │
│ │  content area            │ │  content area            │ │
│ │                          │ │                          │ │
│ └──────────────────────────┘ └──────────────────────────┘ │
│                        ←── gap ──→                        │
└───────────────────────────────────────────────────────────┘
```

### The Pattern

For two equal columns, apply half the desired gap to each column's inner edge. Both columns have the same total padding (half the gap on one side), so MJML's default equal-width distribution produces equal content areas — no explicit `width` props are needed:

```tsx
const TwoColumnsSection = () => {
    const columnGap = 20;
    const halfGap = columnGap / 2;

    return (
        <MjmlSection indent className="twoColumnsSection">
            <MjmlColumn className="twoColumnsSection__leftColumn" paddingRight={halfGap}>
                <MjmlText>Left column content.</MjmlText>
            </MjmlColumn>
            <MjmlColumn className="twoColumnsSection__rightColumn" paddingLeft={halfGap}>
                <MjmlText>Right column content.</MjmlText>
            </MjmlColumn>
        </MjmlSection>
    );
};
```

### Responsive Stacking

On mobile, the columns stack vertically. Reset the gap padding so content stretches full-width, and add a vertical margin to replace the horizontal gap:

```ts
registerStyles(
    (theme) => css`
        ${theme.breakpoints.mobile.belowMediaQuery} {
            .twoColumnsSection__leftColumn > table > tbody > tr > td {
                padding-right: 0 !important;
            }

            .twoColumnsSection__rightColumn > table > tbody > tr > td {
                padding-left: 0 !important;
            }

            .twoColumnsSection__leftColumn {
                margin-bottom: 20px;
            }
        }
    `,
);
```

For three or more equal-width columns, see [Multi-Column Symmetric Layouts](#multi-column-symmetric-layouts).

## Asymmetric Two-Column Layout

A fixed-width column paired with a fluid column that takes the remaining space. Common for image-plus-text layouts, icon rows, or sidebar patterns.

```
┌───────────────────────────────────────────────────────────┐
│ MjmlSection indent                                        │
│ ┌──────────┐ ┌──────────────────────────────────────────┐ │
│ │  120px   │ │ fluid (sectionInnerWidth - 120px)        │ │
│ │  fixed   │ │ paddingLeft={gap}                        │ │
│ └──────────┘ └──────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

### Why Explicit Widths Are Required

MJML does not give columns "remaining space" when some columns have widths and others don't. It always divides the container width equally among all columns (`containerWidth / numberOfColumns`). To get a fixed-plus-fluid layout, **set explicit widths on both columns** and derive the fluid column's width from the theme:

```tsx
const SMALL_COLUMN_WIDTH = 120;
const COLUMN_GAP = 20;

const sectionIndent = getDefaultFromResponsiveValue(theme.sizes.contentIndentation);
const sectionInnerWidth = theme.sizes.bodyWidth - 2 * sectionIndent;
const fluidColumnWidth = sectionInnerWidth - SMALL_COLUMN_WIDTH;
```

`getDefaultFromResponsiveValue` extracts the default (desktop/inline) value from a responsive theme property like `contentIndentation`.

### The Pattern

The gap is created by padding on the fluid column's inner edge — the same principle as the symmetric layout, just applied to one side:

```tsx
<MjmlSection indent>
    <MjmlColumn
        className="imageTextLayout__smallColumn"
        width={`${SMALL_COLUMN_WIDTH}px`}
        verticalAlign="middle"
    >
        <MjmlImage src="..." alt="..." width={SMALL_COLUMN_WIDTH} />
    </MjmlColumn>
    <MjmlColumn
        className="imageTextLayout__fluidColumn"
        width={`${fluidColumnWidth}px`}
        paddingLeft={`${COLUMN_GAP}px`}
        verticalAlign="middle"
    >
        <MjmlText>Content that fills the remaining space.</MjmlText>
    </MjmlColumn>
</MjmlSection>
```

To place the small column on the right instead, swap the column order and move the gap padding to `paddingRight` on the fluid column.

### Two-Breakpoint Responsive Behavior

Fixed-width columns create an overflow problem between the desktop `bodyWidth` and the mobile stacking breakpoint — the total fixed width can exceed the viewport. The solution uses two `belowMediaQuery` breakpoints stacked via CSS cascade order:

```ts
registerStyles(
    (theme) => css`
        ${theme.breakpoints.default.belowMediaQuery} {
            .imageTextLayout__fluidColumn {
                width: calc(100% - ${SMALL_COLUMN_WIDTH}px) !important;
                max-width: calc(100% - ${SMALL_COLUMN_WIDTH}px) !important;
            }
        }

        ${theme.breakpoints.mobile.belowMediaQuery} {
            .imageTextLayout__fluidColumn {
                width: 100% !important;
                max-width: 100% !important;
            }

            .imageTextLayout__smallColumn {
                margin-bottom: 10px;
            }

            .imageTextLayout__fluidColumn > table > tbody > tr > td {
                padding-left: 0 !important;
            }
        }
    `,
);
```

The `default.belowMediaQuery` block makes the fluid column responsive via `calc()` while keeping the two-column layout intact. The `mobile.belowMediaQuery` block (later in source order) overrides it to stack columns at full width. This cascade-based approach is the idiomatic pattern — never use hardcoded `@media (min-width: X) and (max-width: Y)` range queries.

### Controlling Mobile Stack Order

By default, MJML stacks columns in source order on mobile. If you need a column that appears on the right on desktop to stack on top on mobile (e.g., an image that should appear above the text), use `direction="rtl"` on the section to flip the visual order on desktop while keeping the desired stacking order in the source:

```tsx
<MjmlWrapper padding={`0 ${sectionIndent}px`} backgroundColor={theme.colors.background.content}>
    <MjmlSection direction="rtl">
        <MjmlColumn className="layout__smallColumn" width={`${SMALL_COLUMN_WIDTH}px`}>
            <MjmlImage src="..." alt="..." width={SMALL_COLUMN_WIDTH} />
        </MjmlColumn>
        <MjmlColumn
            className="layout__fluidColumn"
            width={`${fluidColumnWidth}px`}
            paddingRight={`${COLUMN_GAP}px`}
        >
            <MjmlText>This appears on the left on desktop, below the image on mobile.</MjmlText>
        </MjmlColumn>
    </MjmlSection>
</MjmlWrapper>
```

Two important details:

1. **`MjmlWrapper` replaces `indent`** — when using `direction="rtl"`, applying `indent` directly on the section causes a 1px line artifact in Outlook. Instead, wrap the section in `MjmlWrapper` and apply the indentation as padding. Set the `backgroundColor` on the wrapper to match the content background.
2. **Source order = mobile stack order** — the small column is first in the JSX, so it stacks on top on mobile. `direction="rtl"` only affects the visual (left-to-right) order on desktop.

## Multi-Column Symmetric Layouts

Three or more equal-width columns use the same gap-via-inner-padding principle as the two-column layout, but require explicit `width` props: inner columns carry padding on **both** sides while outer columns only have it on one. Without compensation, the inner columns would end up with narrower content areas.

```
┌─────────────────────────────────────────────────────────────────┐
│ MjmlSection indent                                              │
│ ┌───────────────┐ ┌─────────────────┐ ┌───────────────┐         │
│ │ outer         │ │ inner (wider)   │ │ outer         │         │
│ │ paddingR:½gap │ │ paddingL:½gap   │ │ paddingL:½gap │         │
│ │               │ │ paddingR:½gap   │ │               │         │
│ └───────────────┘ └─────────────────┘ └───────────────┘         │
│             ←── gap ──→         ←── gap ──→                     │
└─────────────────────────────────────────────────────────────────┘
```

### Width Formula

```tsx
const columnGap = 20;
const halfColumnGap = columnGap / 2;

const availableContentWidth =
    theme.sizes.bodyWidth - 2 * getDefaultFromResponsiveValue(theme.sizes.contentIndentation);

const contentWidthPerColumn =
    (availableContentWidth - (numberOfColumns - 1) * columnGap) / numberOfColumns;

const outerColumnWidth = `${((contentWidthPerColumn + halfColumnGap) / availableContentWidth) * 100}%`;
const innerColumnWidth = `${((contentWidthPerColumn + columnGap) / availableContentWidth) * 100}%`;
```

Outer columns get a width accounting for half-gap padding; inner columns are wider to absorb a full gap (half on each side). Percentages — rather than pixels — keep MJML's responsive fallback math predictable.

### Pattern — Three Columns

```tsx
<MjmlSection indent className="threeColumnsSection">
    <MjmlColumn
        className="threeColumnsSection__column"
        width={outerColumnWidth}
        paddingRight={halfColumnGap}
    >
        <MjmlText>First</MjmlText>
    </MjmlColumn>
    <MjmlColumn
        className="threeColumnsSection__column"
        width={innerColumnWidth}
        paddingLeft={halfColumnGap}
        paddingRight={halfColumnGap}
    >
        <MjmlText>Second</MjmlText>
    </MjmlColumn>
    <MjmlColumn
        className="threeColumnsSection__column"
        width={outerColumnWidth}
        paddingLeft={halfColumnGap}
    >
        <MjmlText>Third</MjmlText>
    </MjmlColumn>
</MjmlSection>
```

### Pattern — Four or More Columns

Same formula; the inner-column is simply repeated. For four columns, the two middle columns both use `innerColumnWidth` with padding on both sides; the first and last use `outerColumnWidth` with padding only on the inner side.

### Responsive Stacking

Below the desktop breakpoint, the compensated inline widths no longer make sense: they were calibrated for a specific container width, and inner columns would otherwise render visibly wider than outer ones. A flex reset on the section's inner `<td>` neutralizes those widths so columns size equally.

The one design decision is **when to collapse to a stack** — and that's per-component. A dense 3-column row might need to stack at mobile; a 4-column row would be too cramped below the default breakpoint.

```ts
registerStyles(
    (theme) => css`
        ${theme.breakpoints.default.belowMediaQuery} {
            .threeColumnsSection > table > tbody > tr > td {
                display: flex !important;
                gap: 20px !important;
            }
            .threeColumnsSection__column {
                flex: 1 1 0% !important;
                width: auto !important;
                max-width: none !important;
                display: block !important;
            }
            .threeColumnsSection__column > table > tbody > tr > td {
                padding-left: 0 !important;
                padding-right: 0 !important;
            }
        }

        ${theme.breakpoints.mobile.belowMediaQuery} {
            .threeColumnsSection > table > tbody > tr > td {
                flex-direction: column !important;
            }
            .threeColumnsSection__column {
                flex: none !important;
                width: 100% !important;
                max-width: 100% !important;
            }
        }
    `,
);
```

| Stack at           | When to use                                                              | Change from the example above                                                                      |
| ------------------ | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Mobile             | Columns remain readable while narrowing (typical for 3 columns).         | Use as-is.                                                                                         |
| Default breakpoint | Columns would be too cramped below `bodyWidth` (typical for 4+ columns). | Merge the `mobile.belowMediaQuery` rules into `default.belowMediaQuery` and drop the mobile block. |

### Non-Stacking Rows

For short fixed-value rows — numeric data, icon strips — that remain readable even when narrow, keep columns side-by-side at every viewport. Add `disableResponsiveBehavior` on the section to suppress MJML's own mobile auto-stack:

```tsx
<MjmlSection indent disableResponsiveBehavior className="iconStrip">
    {/* …columns as in the Three-Column pattern above… */}
</MjmlSection>
```

The inline width compensation still needs to be neutralized so columns render at equal widths. Apply the same flex reset as in [Responsive Stacking](#responsive-stacking), with one adjustment: `disableResponsiveBehavior` wraps the columns in an `MjmlGroup` `<div>`, so the container selector goes one level deeper (`… > td > div`). Drop the `mobile.belowMediaQuery` block entirely — columns never stack.

```ts
.iconStrip > table > tbody > tr > td > div {
    display: flex !important;
    gap: 20px !important;
}
/* column rules identical to Responsive Stacking */
```

## Breakpoint Content Switch

Sometimes you cannot make both views from the same HTML, because the mobile view needs a different structure than the desktop view. Then put both layouts in the email and hide one of them.

:::tip
First try to make one layout that works at each width. Two layouts make twice as much markup, and columns already stack below `theme.breakpoints.mobile`.
:::

The switch has two parts:

- The **default layout** is not hidden. It shows if the email client removes the `<style>` block, so make it the complete layout.
- The **mobile layout** is hidden with inline styles. A media query then hides the default layout and shows the mobile layout.

### The Pattern

Make a component for each layout, and start it at its `MjmlSection`. Then the call site shows only the switch. Put the hiding styles on a `<div>` around the section: a section becomes a table, and `max-height` does not work on a table.

```tsx
<MailHeaderDefaultLayout className="mailHeader__defaultLayout" />

<MjmlHtml html={`<div class="mailHeader__mobileLayout" style="display:none;max-height:0;overflow:hidden;font-size:0;line-height:0;">`} />
<MailHeaderMobileLayout />
<MjmlHtml html="</div>" />
```

Each of these properties stops a different email client:

| Property                          | Client                                                        |
| --------------------------------- | ------------------------------------------------------------- |
| `display: none`                   | Apple Mail, modern webmail, and the new Outlook               |
| `max-height: 0; overflow: hidden` | Yahoo Mail and old Gmail, which remove inline `display: none` |
| `font-size: 0; line-height: 0`    | A client that still shows the text                            |
| `mso-hide: all` on each element   | Classic Outlook on Windows                                    |

### Hiding in Classic Outlook

Classic Outlook shows both layouts if only the `<div>` has the hiding styles. Add `mso-hide: all` to each element in the mobile layout, and write it inline. `{ inline: true }` tells MJML to write the property into each `style` attribute.

```ts
registerStyles(
    css`
        .mailHeader__mobileLayout,
        .mailHeader__mobileLayout * {
            mso-hide: all;
        }
    `,
    { inline: true },
);
```

Write only `mso-hide: all` on those elements. `display: none` there breaks the tables, because the media query must then set `display` again on each `<tr>` and `<td>`.

:::warning
Do not use a conditional comment (`<!--[if !mso]>`) to hide a layout. MJML puts its own `[if mso]` comments around each section, and their `<![endif]-->` closes your comment too early. `MjmlConditionalComment` selects an email client, not a screen width.
:::

### Showing the Mobile Layout

Put the media query in a second `registerStyles` call, because MJML cannot inline a media query.

```ts
registerStyles(
    (theme) => css`
        ${theme.breakpoints.default.belowMediaQuery} {
            .mailHeader__defaultLayout {
                display: none !important;
            }

            .mailHeader__mobileLayout {
                display: block !important;
                max-height: none !important;
                overflow: visible !important;
                font-size: inherit !important;
                line-height: inherit !important;
            }
        }
    `,
);
```

:::warning
The media query must cancel each hiding style. `display: block` with `max-height: 0` still shows nothing. `overflow: visible` is also necessary, because Yahoo Mail adds `overflow-x` and `overflow-y` if it finds `max-height`.
:::

Do not put the switch breakpoint below `theme.breakpoints.mobile`. The default layout then stacks its columns before the media query hides it. If you must, add `disableResponsiveBehavior` to its section. For `belowMediaQuery`, see [The `belowMediaQuery` Pattern](./5-customization.md#the-belowmediaquery-pattern).

## Grouping Sections with a Shared Background

When multiple sections need to share a background — for example, a multi-row footer with its own color — wrap them in `MjmlWrapper`. The wrapper owns the background; inner `MjmlSection`s suppress their own theme-default `backgroundColor` so the wrapper's color shows through.

```tsx
<MjmlWrapper backgroundColor="#2d4a6e">
    <MjmlSection indent>
        <MjmlColumn>
            <MjmlText color="#ffffff">Footer row 1</MjmlText>
        </MjmlColumn>
    </MjmlSection>
    <MjmlSection indent>
        <MjmlColumn>
            <MjmlText color="#ffffff">Footer row 2</MjmlText>
        </MjmlColumn>
    </MjmlSection>
</MjmlWrapper>
```

A few things worth knowing:

- `MjmlWrapper` applies `theme.colors.background.content` as its default background when a theme is present, so the `backgroundColor` prop is only needed when the wrapper should differ from the theme default.
- An explicit `backgroundColor` on an inner `MjmlSection` still wins — use that only when a single section inside the wrapper needs to stand out.
- For a region that also needs different default text color or variants, combine `MjmlWrapper` with a scoped `ThemeProvider` (see [Scoped Theming](./2-components-and-theme.md#scoped-theming)). Text components pick up the scoped theme while the wrapper provides the background.
