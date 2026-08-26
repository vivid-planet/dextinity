---
title: Theme & Base Components
---

## Setting Up a Theme

The theme controls layout dimensions, typography, colors, and responsive breakpoints across all mail components. Use `createTheme()` to build one:

```ts
import { createTheme } from "@dextinity/mail-react";

const theme = createTheme();
```

### Overriding Defaults

Pass a partial overrides object to customize any part of the theme.

```ts
import { createBreakpoint, createTheme } from "@dextinity/mail-react";

const theme = createTheme({
    sizes: {
        bodyWidth: 700,
        contentIndentation: { default: 40, mobile: 20 },
    },
    breakpoints: {
        mobile: createBreakpoint(480),
    },
    text: {
        fontFamily: "Georgia, serif",
        fontSize: "18px",
    },
    list: {
        indent: 16,
        markerGap: { default: 12, mobile: 8 },
        unorderedMarker: "▪",
        // 97 is the code of "a", so nested items are lettered a), b), c)
        orderedMarker: ({ index, depth }) =>
            depth === 0 ? `${index + 1})` : `${String.fromCharCode(97 + index)})`,
    },
    colors: {
        background: {
            body: "#EAEAEA",
            content: "#FAFAFA",
        },
    },
});
```

### Adding Custom Breakpoints

The built-in breakpoints are `default` and `mobile`. To add more, augment the `ThemeBreakpoints` interface and pass the new breakpoint to `createTheme`.

Breakpoint values must be created with `createBreakpoint()`, which produces an object containing the pixel width and a ready-to-use media query string.

Once augmented, the new key automatically becomes available in all responsive theme values, e.g. `sizes.contentIndentation` and the `list` spacing tokens.

```ts title="theme.ts"
import { createBreakpoint, createTheme, type ThemeBreakpoint } from "@dextinity/mail-react";

export const theme = createTheme({
    breakpoints: {
        tablet: createBreakpoint(540),
    },
    sizes: {
        contentIndentation: {
            default: 40,
            tablet: 30,
            mobile: 20,
        },
    },
});

declare module "@dextinity/mail-react" {
    interface ThemeBreakpoints {
        tablet: ThemeBreakpoint;
    }
}
```

### Adding Custom Colors

Augment `ThemeBackgroundColors` or `ThemeColors` to add project-specific color tokens:

```ts title="theme.ts"
import { createTheme } from "@dextinity/mail-react";

export const theme = createTheme({
    colors: {
        background: { highlight: "#FFF3CD" },
        brand: { primary: "#0066CC", secondary: "#004499" },
    },
});

declare module "@dextinity/mail-react" {
    interface ThemeBackgroundColors {
        highlight: string;
    }

    interface ThemeColors {
        brand: { primary: string; secondary: string };
    }
}
```

## MjmlMailRoot

`MjmlMailRoot` is the root element for every email template. It renders the full MJML skeleton (`<mjml>`, `<mj-head>`, `<mj-body>`) and provides the theme to all descendant components.

### In Storybook

The Storybook decorator wraps every story in `MjmlMailRoot` automatically — you don't need to use it in story code. To pass a custom theme, set it via `parameters.theme`:

```tsx title="src/stories/MyStory.stories.tsx"
export const MyStory: StoryObj = {
    parameters: {
        theme: createTheme({ sizes: { bodyWidth: 500 } }),
    },
    render: () => (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlText>Narrower email at 500px</MjmlText>
            </MjmlColumn>
        </MjmlSection>
    ),
};
```

### Outside Storybook

When rendering emails outside Storybook, wrap your content in `MjmlMailRoot` yourself and use `renderMailHtml` to convert the React tree to HTML — see [Rendering](./4-rendering.md) for full details.

```tsx title="src/emails/WelcomeEmail.tsx"
import { MjmlColumn, MjmlMailRoot, MjmlSection, MjmlText, createTheme } from "@dextinity/mail-react";

const theme = createTheme({
    colors: { background: { body: "#EAEAEA" } },
});

function WelcomeEmail() {
    return (
        <MjmlMailRoot theme={theme}>
            <MjmlSection indent>
                <MjmlColumn>
                    <MjmlText>Welcome!</MjmlText>
                </MjmlColumn>
            </MjmlSection>
        </MjmlMailRoot>
    );
}
```

When no `theme` prop is provided, `MjmlMailRoot` uses the default theme (equivalent to `createTheme()` with no arguments).

`MjmlMailRoot` also accepts an optional `config` prop that can be used to expose, e.g., environment-specific values to descendants via `useConfig`. See [Configuration](./5-customization.md#configuration).

### What MjmlMailRoot Configures

From the theme, `MjmlMailRoot` automatically sets:

- **Body width** — from `theme.sizes.bodyWidth`
- **Body background** — from `theme.colors.background.body`
- **MJML breakpoint** — from `theme.breakpoints.mobile`, controlling when columns stack vertically
- **Base font family** — from `theme.text.fontFamily`
- **Zero default padding** — so components start with no padding

### Extending `<MjmlHead>` and `<MjmlAttributes>`

Two optional slot props let consumers contribute content the theme can't express:

- `head` — `ReactNode` appended inside `<MjmlHead>` after the registered styles block (e.g. `<MjmlFont>`, `<MjmlConditionalComment>`, `<MjmlPreview>`)
- `attributes` — `ReactNode` appended inside `<MjmlAttributes>` after the default `<MjmlAll>` (e.g. `<MjmlClass>` or per-element defaults)

## MjmlSection

`MjmlSection` wraps the MJML section with theme integration. It automatically applies `theme.colors.background.content` as the background color — unless the section is rendered inside an [`MjmlWrapper`](#mjmlwrapper), in which case the wrapper's background is used instead. To change the default for all sections, set it in the theme:

```ts
const theme = createTheme({
    colors: { background: { content: "#F8F8F8" } },
});
```

To override it for a single section, use the `backgroundColor` prop directly:

```tsx
<MjmlSection backgroundColor="#FF0000">
    <MjmlColumn>
        <MjmlText>Red background section</MjmlText>
    </MjmlColumn>
</MjmlSection>
```

### Indentation

The `indent` prop applies theme-based left and right padding so content doesn't touch the email edges:

```tsx
<MjmlSection indent>
    <MjmlColumn>
        <MjmlText>Indented content with padding from the theme</MjmlText>
    </MjmlColumn>
</MjmlSection>
```

The indentation values come from `theme.sizes.contentIndentation`, which supports responsive values. To customize:

```ts
const theme = createTheme({
    sizes: { contentIndentation: { default: 48, mobile: 24 } },
});
```

### Disabling Responsive Stacking

By default, columns in a section stack vertically on mobile. To keep them side-by-side at all viewport widths, use `disableResponsiveBehavior`:

```tsx
<MjmlSection disableResponsiveBehavior>
    <MjmlColumn>
        <MjmlText>First column</MjmlText>
    </MjmlColumn>
    <MjmlColumn>
        <MjmlText>Second column</MjmlText>
    </MjmlColumn>
</MjmlSection>
```

This wraps the children in an `MjmlGroup`, preventing the columns from stacking.

**CSS class names:** `.mjmlSection`, `.mjmlSection--indented` (when `indent` is set).

## MjmlWrapper

`MjmlWrapper` groups multiple `MjmlSection`s that share a background. Like a section, it must be a direct child of the body; sections go inside the wrapper.

When a theme is present, `MjmlWrapper` applies `theme.colors.background.content` as its default `backgroundColor`. Sections rendered inside a wrapper suppress their own theme-default background so the wrapper's color shows through. An explicit `backgroundColor` on an inner `MjmlSection` still wins.

Use this to paint a different background behind a group of sections — for example, a footer with its own color:

```tsx
<MjmlWrapper backgroundColor="#2d4a6e">
    <MjmlSection indent>
        <MjmlColumn>
            <MjmlText color="#ffffff">First row</MjmlText>
        </MjmlColumn>
    </MjmlSection>
    <MjmlSection indent>
        <MjmlColumn>
            <MjmlText color="#ffffff">Second row</MjmlText>
        </MjmlColumn>
    </MjmlSection>
</MjmlWrapper>
```

For a region that also needs different default text color or variants, combine `MjmlWrapper` with a scoped `ThemeProvider` (see [Scoped Theming](#scoped-theming) below).

## Text

`MjmlText`, `HtmlText`, and `HtmlInlineLink` share a theme-driven text styling system. Styles are defined once in the theme and applied consistently across all three.

### Variants

Variants are named typography presets. Define them in your theme file alongside the `TextVariants` module augmentation for type-safety:

```ts title="theme.ts"
import { createTheme } from "@dextinity/mail-react";

export const theme = createTheme({
    text: {
        variants: {
            heading: { fontSize: "32px", fontWeight: 700, lineHeight: "40px" },
            body: { fontSize: "16px", lineHeight: "24px" },
            caption: { fontSize: "12px", lineHeight: "16px", color: "#666666" },
        },
    },
});

declare module "@dextinity/mail-react" {
    interface TextVariants {
        heading: true;
        body: true;
        caption: true;
    }
}
```

The `declare module` block restricts the `variant` prop to the defined names — TypeScript will error on typos or unknown variants.

```tsx title="ExampleTexts.tsx"
<MjmlText variant="heading">Large heading text</MjmlText>
<MjmlText variant="body">Regular body text</MjmlText>
<MjmlText variant="caption">Small caption text</MjmlText>
```

Variant styles are merged on top of the base theme text styles — any property not set by the variant inherits from the base.

#### Responsive Variants

Variant properties accept responsive values that change at different breakpoints:

```ts
const theme = createTheme({
    text: {
        variants: {
            heading: {
                fontSize: { default: "32px", mobile: "24px" },
                lineHeight: { default: "40px", mobile: "30px" },
                bottomSpacing: { default: "24px", mobile: "16px" },
                fontWeight: 700,
            },
        },
    },
});
```

#### Default Variant

Set `defaultVariant` in the theme to apply a variant to all text components that don't specify one explicitly:

```ts
const theme = createTheme({
    text: {
        defaultVariant: "body",
        variants: {
            body: { fontSize: "14px", lineHeight: "22px" },
            heading: { fontSize: "28px", fontWeight: 700 },
        },
    },
});
```

```tsx
<MjmlText>Uses the "body" variant automatically</MjmlText>
<MjmlText variant="heading">Explicit heading variant</MjmlText>
```

### Bottom Spacing

Use `bottomSpacing` to add consistent spacing below text elements. The spacing value comes from the theme:

```tsx
<MjmlText bottomSpacing>First paragraph with spacing below</MjmlText>
<MjmlText bottomSpacing>Second paragraph with spacing below</MjmlText>
<MjmlText>Last paragraph, no extra spacing</MjmlText>
```

The base spacing value is set via `theme.text.bottomSpacing`:

```ts
const theme = createTheme({
    text: { bottomSpacing: "20px" },
});
```

Variants can override this value individually (see [Responsive Variants](#responsive-variants) above).

### MjmlText

`MjmlText` is an [MJML component](./1-email-basics.md#mjml-components-vs-html-components) — use it inside `MjmlColumn` following the standard MJML layout model.
The `variant` and `bottomSpacing` props require a `ThemeProvider` or `MjmlMailRoot` ancestor to work.

**CSS class names:** `.mjmlText`, `.mjmlText--{variant}` (per variant), `.mjmlText--bottomSpacing`.

### HtmlText

`HtmlText` is a themed text component for use inside [MJML ending tags](./1-email-basics.md#ending-tags) (`MjmlRaw`, `MjmlText`) or custom HTML structures where MJML components can't be used. It renders a plain HTML element.

It supports the same `variant` and `bottomSpacing` props as `MjmlText`:

```tsx
<MjmlSection>
    <MjmlColumn>
        <MjmlRaw>
            <tr>
                <HtmlText>Themed text in a row of the column's table</HtmlText>
            </tr>
        </MjmlRaw>
    </MjmlColumn>
</MjmlSection>
```

#### Rendering as a Different Element

`HtmlText` renders a `<td>` by default. Use the `element` prop to render a different HTML element:

```tsx
<HtmlText element="div">Rendered as a div</HtmlText>
```

**CSS class names:** `.htmlText`, `.htmlText--{variant}` (per variant), `.htmlText--bottomSpacing`.

### HtmlInlineLink

`HtmlInlineLink` renders an `<a>` element for use inside `MjmlText` or `HtmlText`. It ensures that links inherit their parent's font styles — even on Outlook Desktop, which normally overrides link typography with its own defaults.

```tsx
<MjmlText>
    Visit our <HtmlInlineLink href="https://example.com">website</HtmlInlineLink> for more
    information.
</MjmlText>
```

The link automatically picks up the font family, size, line height, weight, and color from the parent text component — there is no separate theme configuration for links. To change link typography, customize the parent text styles or variants in the theme. The link defaults to `target="_blank"` and `text-decoration: underline`.

#### Outlook Workaround

Outlook Desktop ignores `<style>` blocks and applies its own "Hyperlink" style to `<a>` tags, overriding inherited CSS properties. To counter this, `HtmlInlineLink` sets explicit inline styles for font properties (sourced from the parent text component's context). Since Outlook does respect inline styles, the link renders with the correct typography.

On modern email clients, the component registers a responsive CSS reset so the link adapts correctly when responsive variant overrides apply at smaller viewports.

#### Custom Color

To set a custom link color that persists across all viewports, use `!important` in the style prop. This is necessary because the component's responsive reset uses `inherit !important` — without `!important` on your override, the reset would take precedence:

```tsx
<MjmlText>
    Click{" "}
    <HtmlInlineLink href="https://example.com" style={{ color: "#0066cc !important" }}>
        here
    </HtmlInlineLink>{" "}
    to continue.
</MjmlText>
```

**CSS class name:** `.htmlInlineLink`.

## Image

`MjmlImage` and `HtmlImage` are responsive — the image scales down to fit narrow viewports.

**CSS class names:** `.mjmlImage`, `.htmlImage`.

## Divider

`MjmlDivider` and `HtmlDivider` render a themed horizontal line. Set `height`, `backgroundColor`, and `backgroundImage` directly as props, or define named `variant`s under `theme.divider` with an optional `defaultVariant`.

```tsx
const theme = createTheme({
    divider: {
        defaultVariant: "thin",
        variants: {
            thin: { height: 1, backgroundColor: "#999999" },
            thick: { height: { default: 12, mobile: 8 }, backgroundColor: "#222222" },
        },
    },
});

<MjmlDivider variant="thick" />;
```

A `backgroundImage` (typically a gradient) renders on top of `backgroundColor`. Clients that ignore `background-image` fall back to the solid color, so set both when using a gradient.

**CSS class names:** `.mjmlDivider`, `.htmlDivider`, and `.mjmlDivider--{variant}` / `.htmlDivider--{variant}`.

## Button

`MjmlButton` and `HtmlButton` render a themed button. Use `MjmlButton` inside an `MjmlColumn`; use `HtmlButton` inside an [ending tag](./1-email-basics.md#ending-tags) or outside the MJML context. Both default `href` to `#` and `target` to `_blank`. Style them through `theme.button` — base styles plus named `variant`s with an optional `defaultVariant`.

```ts title="theme.ts"
const theme = createTheme({
    button: {
        defaultVariant: "primary",
        variants: {
            primary: { backgroundColor: "#5B4FC7", color: "#FFFFFF" },
            gradient: {
                backgroundColor: "#5B4FC7",
                backgroundImage: "linear-gradient(90deg, #5B4FC7, #9C5BC7)",
            },
        },
    },
});
```

```tsx
<MjmlButton variant="gradient" href="https://example.com">
    Click me
</MjmlButton>
```

The `variant` prop requires a `ThemeProvider` or `MjmlMailRoot` ancestor. Set `fullWidth` to make the button span its container.

`theme.button.padding` is the inner spacing around the label. On `MjmlButton`, the separate `padding` prop is the outer spacing between the button and the surrounding content.

A `backgroundImage` (typically a gradient) renders on top of `backgroundColor`. Clients that ignore `background-image`, such as Outlook, fall back to the solid color, so set both when using a gradient. Outlook ignores `border-radius` as well, so a rounded button renders with square corners there (see [Email Basics](./1-email-basics.md)).

**CSS class names:** `.mjmlButton`, `.htmlButton`, `.mjmlButton--{variant}` / `.htmlButton--{variant}`, and `.mjmlButton--fullWidth` / `.htmlButton--fullWidth`.

## Scoped Theming

`ThemeProvider` makes a theme available to its children via React context. `MjmlMailRoot` uses it internally, so you don't need it for the top-level theme. Its main use case is **scoped theming** — applying a different theme to a subsection of the email.

:::tip
If all you need to change is the **background color** behind a group of sections, reach for [`MjmlWrapper`](#mjmlwrapper) instead — no theme cloning required.
:::

### Creating a Dark Section

A common pattern is wrapping a section in a `ThemeProvider` with a modified theme to create a visually distinct area, such as a dark-background footer. Copy the project's theme and override only what needs to change — this preserves the rest of the theme (font family, sizes, breakpoints, variants, etc.):

```tsx
import { MjmlColumn, MjmlSection, MjmlText, ThemeProvider } from "@dextinity/mail-react";

import { theme } from "./theme";

const darkSectionTheme = {
    ...theme,
    colors: {
        ...theme.colors,
        background: {
            ...theme.colors.background,
            content: "#1A1A2E",
        },
    },
    text: {
        ...theme.text,
        color: "#FFFFFF",
    },
};

function EmailWithDarkFooter() {
    return (
        <>
            <MjmlSection indent>
                <MjmlColumn>
                    <MjmlText>Regular content using the root theme.</MjmlText>
                </MjmlColumn>
            </MjmlSection>

            <ThemeProvider theme={darkSectionTheme}>
                <MjmlSection indent>
                    <MjmlColumn>
                        <MjmlText>Footer content on a dark background with white text.</MjmlText>
                    </MjmlColumn>
                </MjmlSection>
            </ThemeProvider>
        </>
    );
}
```

Components inside the nested `ThemeProvider` automatically pick up the scoped theme — `MjmlSection` uses the dark background color, and `MjmlText` uses the white text color. Components outside the nested provider continue using the root theme from `MjmlMailRoot`.

### Nesting

`ThemeProvider` is fully nestable. Each provider replaces the theme for its subtree without affecting ancestors or siblings.

:::note
`ThemeProvider` sets a new theme context — it does not merge with the parent theme. Spread the root theme and override only what you need (as shown above) to avoid losing settings like font family or text variants.
:::
