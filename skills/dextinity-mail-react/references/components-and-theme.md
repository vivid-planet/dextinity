# Components & Theme Reference

Theme system, module augmentation, scoped theming, and the component behavior for `@dextinity/mail-react` that its types and TSDoc don't capture on their own. For prop names, types, and defaults, read the types and their TSDoc.

## Table of Contents

1. [Theme tokens](#theme-tokens)
2. [Module Augmentation Interfaces](#module-augmentation-interfaces)
3. [MjmlMailRoot](#mjmlmailroot)
4. [MjmlSection](#mjmlsection)
5. [MjmlWrapper](#mjmlwrapper)
6. [Text Components](#text-components)
7. [HtmlInlineLink](#htmlinlinelink)
8. [Image](#image)
9. [Divider](#divider)
10. [Button](#button)
11. [Scoped Theming](#scoped-theming)
12. [MJML Component Re-exports](#mjml-component-re-exports)

---

## Theme tokens

`createTheme(overrides?)` merges partial overrides into the default theme; every token is optional and the `Theme` type lists them. Defaults live in `createTheme`. One behavior isn't visible from the types: **the default breakpoint derives from `sizes.bodyWidth`** unless `breakpoints.default` is overridden — they describe the same boundary, so setting them apart silently desyncs the layout.

### Breakpoints

Breakpoint values are created with `createBreakpoint(pixelWidth)`:

```ts
createBreakpoint(420);
// → { value: 420, belowMediaQuery: "@media (max-width: 419px)" }
```

The `belowMediaQuery` string is ready to use in `registerStyles` calls.

### Responsive Values

Many theme properties accept responsive values — objects keyed by breakpoint name:

```ts
const theme = createTheme({
    sizes: {
        contentIndentation: { default: 40, tablet: 30, mobile: 20 },
    },
    list: {
        indent: { default: 24, tablet: 16, mobile: 8 },
    },
});
```

The `default` key provides the base value (rendered inline). Other keys generate media query overrides automatically.

### List Markers

`list.unorderedMarker` and `list.orderedMarker` set the markers of the lists the RichText block renders: a fixed node, or a function receiving the item's zero-based `index` and the `depth` of its list. Use plain HTML and React elements, not MJML components:

```tsx
const theme = createTheme({
    list: {
        unorderedMarker: ({ depth }) => ["▪", "–", "·"][depth % 3],
        // 97 is the code of "a", so nested items are lettered a., b., c.
        orderedMarker: ({ index, depth }) => (depth === 0 ? `${index + 1}.` : `${String.fromCharCode(97 + index)}.`),
    },
});
```

---

## Module Augmentation Interfaces

These interfaces are empty by default, designed for consumers to extend via `declare module`. Place augmentations in your theme file alongside `createTheme()`, generally below the `createTheme` call.

### TextVariants

Controls the `variant` prop on `MjmlText` and `HtmlText`:

```ts
const theme = createTheme({
    text: {
        defaultVariant: "body",
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

Variant properties accept responsive values:

```ts
heading: {
    fontSize: { default: "32px", mobile: "24px" },
    lineHeight: { default: "40px", mobile: "30px" },
    bottomSpacing: { default: "24px", mobile: "16px" },
    fontWeight: 700,
},
```

### DividerVariants

Controls the `variant` prop on `MjmlDivider` and `HtmlDivider`:

```ts
const theme = createTheme({
    divider: {
        defaultVariant: "thin",
        variants: {
            thin: { height: 1, backgroundColor: "#999999" },
            thick: { height: { default: 12, mobile: 8 }, backgroundColor: "#222222" },
        },
    },
});

declare module "@dextinity/mail-react" {
    interface DividerVariants {
        thin: true;
        thick: true;
    }
}
```

Variant properties (`height`, `backgroundColor`, `backgroundImage`) accept responsive values.

### ButtonVariants

Controls the `variant` prop on `MjmlButton` and `HtmlButton`:

```ts
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

declare module "@dextinity/mail-react" {
    interface ButtonVariants {
        primary: true;
        gradient: true;
    }
}
```

Variant properties (`color`, `backgroundColor`, `backgroundImage`, `border`, `borderRadius`, `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `padding`) accept responsive values.

### ThemeBreakpoints

Built-in keys are `default` and `mobile`. Add custom breakpoints:

```ts
import { createBreakpoint, type ThemeBreakpoint } from "@dextinity/mail-react";

const theme = createTheme({
    breakpoints: { tablet: createBreakpoint(540) },
    sizes: {
        contentIndentation: { default: 40, tablet: 30, mobile: 20 },
    },
});

declare module "@dextinity/mail-react" {
    interface ThemeBreakpoints {
        tablet: ThemeBreakpoint;
    }
}
```

New breakpoint keys automatically become available in all responsive theme values.

### ThemeBackgroundColors and ThemeColors

Add project-specific color tokens:

```ts
const theme = createTheme({
    colors: {
        background: { highlight: "#FFF3CD", footer: "#1A1A2E" },
        brand: { primary: "#0066CC", secondary: "#004499" },
    },
});

declare module "@dextinity/mail-react" {
    interface ThemeBackgroundColors {
        highlight: string;
        footer: string;
    }
    interface ThemeColors {
        brand: { primary: string; secondary: string };
    }
}
```

---

## MjmlMailRoot

Root element for every email template. Renders the full MJML skeleton (`<mjml>`, `<mj-head>`, `<mj-body>`) and provides the theme to all descendant components.

**What it configures from the theme:**

- Body width from `theme.sizes.bodyWidth`
- Body background from `theme.colors.background.body`
- MJML breakpoint from `theme.breakpoints.mobile` (controls when columns stack)
- Base font family from `theme.text.fontFamily`
- Zero default padding on all components
- Renders all registered styles (`registerStyles`) in the `<head>`

**In Storybook:** the decorator wraps stories automatically — pass a custom theme via `parameters.theme`. **Outside Storybook:** wrap content in `MjmlMailRoot` yourself.

---

## MjmlSection

Full-width horizontal row with theme integration.

**CSS classes:** `.mjmlSection`, `.mjmlSection--indented` (when `indent` is set).

```tsx
<MjmlSection indent>
    <MjmlColumn><MjmlText>Indented content</MjmlText></MjmlColumn>
</MjmlSection>

<MjmlSection disableResponsiveBehavior slotProps={{ group: { width: "100%" } }}>
    <MjmlColumn><MjmlText>Won't stack</MjmlText></MjmlColumn>
    <MjmlColumn><MjmlText>on mobile</MjmlText></MjmlColumn>
</MjmlSection>
```

Indentation values come from `theme.sizes.contentIndentation`, which supports responsive values.

**Inside `MjmlWrapper`:** the theme-default `backgroundColor` is suppressed so the wrapper's background shows through. An explicit `backgroundColor` prop still wins.

---

## MjmlWrapper

Groups multiple `MjmlSection`s that share a background. Must be a direct child of `MjmlBody`; sections go inside.

The wrapper takes the theme's content background by default. Inner `MjmlSection`s suppress their own theme-default background so the wrapper's color shows through; an explicit `backgroundColor` on an inner section still wins.

```tsx
<MjmlWrapper backgroundColor="#dddddd">
    <MjmlSection indent>
        <MjmlColumn>
            <MjmlText>First row</MjmlText>
        </MjmlColumn>
    </MjmlSection>
    <MjmlSection indent>
        <MjmlColumn>
            <MjmlText>Second row</MjmlText>
        </MjmlColumn>
    </MjmlSection>
</MjmlWrapper>
```

Typical uses: multi-section footers with their own color, or grouping sections behind a shared outer padding (e.g., the `direction="rtl"` workaround in [`layout-patterns.md`](layout-patterns.md)). For a region that also needs different default text color or variants, combine `MjmlWrapper` with a scoped `ThemeProvider` — see Scoped Theming below.

---

## Text Components

### MjmlText

MJML text component — use inside `MjmlColumn` following the standard layout model.

**CSS classes:** `.mjmlText`, `.mjmlText--{variant}`, `.mjmlText--bottomSpacing`.

```tsx
<MjmlText variant="heading" bottomSpacing>Large heading with spacing</MjmlText>
<MjmlText variant="body">Regular body text</MjmlText>
<MjmlText>Uses defaultVariant if set in theme</MjmlText>
```

Variant styles merge on top of base theme text styles — properties not set by the variant inherit from the base.

### HtmlText

Themed text for use inside ending tags (`MjmlText`, `MjmlRaw`) or custom HTML structures where MJML components can't be used. Renders a plain HTML element.

**CSS classes:** `.htmlText`, `.htmlText--{variant}`, `.htmlText--bottomSpacing`.

```tsx
<MjmlColumn>
    <MjmlRaw>
        <tr>
            <HtmlText variant="body">Themed text in a row of the column's table</HtmlText>
        </tr>
    </MjmlRaw>
</MjmlColumn>

<MjmlText>
    <HtmlText element="div" variant="caption">Rendered as a div</HtmlText>
</MjmlText>
```

### Bottom Spacing

Use `bottomSpacing` to add consistent vertical spacing below text elements:

```tsx
<MjmlText bottomSpacing>First paragraph with spacing below</MjmlText>
<MjmlText bottomSpacing>Second paragraph with spacing below</MjmlText>
<MjmlText>Last paragraph, no extra spacing</MjmlText>
```

The base spacing value comes from `theme.text.bottomSpacing`. Variants can override it individually with their own `bottomSpacing` property (which also supports responsive values).

---

## HtmlInlineLink

`<a>` element for use inside `MjmlText` or `HtmlText`. Inherits parent's font styles — even on Outlook Desktop, which normally overrides link typography with its own defaults.

**CSS class:** `.htmlInlineLink`.

```tsx
<MjmlText variant="body">
    Visit our <HtmlInlineLink href="https://example.com">website</HtmlInlineLink> for more.
</MjmlText>
```

### Outlook Workaround

Outlook Desktop ignores `<style>` blocks and applies its own "Hyperlink" style to `<a>` tags, overriding inherited CSS. `HtmlInlineLink` counters this by setting explicit inline styles for font properties (sourced from the parent text component's context). On modern clients, a responsive CSS reset ensures the link adapts when responsive variant overrides apply.

### Custom Color

Use `!important` when setting a custom link color — the responsive reset uses `inherit !important`, which would otherwise take precedence:

```tsx
<HtmlInlineLink href="https://example.com" style={{ color: "#0066cc !important" }}>
    link text
</HtmlInlineLink>
```

---

## Image

`MjmlImage` and `HtmlImage` are responsive — the image scales down to fit narrow viewports.

**CSS classes:** `.mjmlImage`, `.htmlImage`.

## Divider

Themed horizontal line, styled from `theme.divider` (base styles plus variants). Falls back to a built-in default when no theme is in scope; only `variant` requires a theme.

- **`MjmlDivider`** — inside `MjmlColumn`. Classes `.mjmlDivider`, `.mjmlDivider--{variant}`.
- **`HtmlDivider`** — inside ending tags (`MjmlRaw`) or raw HTML. Classes `.htmlDivider`, `.htmlDivider--{variant}`.

```tsx
<MjmlDivider variant="thick" />
```

---

## Button

Themed button, styled from `theme.button` (base styles plus variants). Falls back to a built-in default when no theme is in scope; only `variant` requires a theme.

- **`MjmlButton`** — inside `MjmlColumn`. Classes `.mjmlButton`, `.mjmlButton--{variant}`, `.mjmlButton--fullWidth`.
- **`HtmlButton`** — inside ending tags (`MjmlRaw`) or any non-MJML context. Classes `.htmlButton`, `.htmlButton--{variant}`, `.htmlButton--fullWidth`.

`theme.button.padding` is the inner spacing around the label; `MjmlButton`'s `padding` prop is the outer spacing. `fullWidth` makes the button span its container. A gradient `backgroundImage` overlays the solid `backgroundColor`, which stays the fallback for clients that drop `background-image` (Outlook). Outlook ignores `border-radius`, so rounded buttons render with square corners there.

```tsx
<MjmlButton variant="primary" fullWidth href="https://example.com">
    Click me
</MjmlButton>
```

---

## Scoped Theming

`ThemeProvider` applies a different theme to a subtree. Common use: dark-background sections.

**Prefer `MjmlWrapper` when only the background color changes.** Reach for `ThemeProvider` when text color, variants, or other theme values also need to differ — cloning a theme is overkill for a background-only change.

```tsx
import { ThemeProvider } from "@dextinity/mail-react";
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
                    <MjmlText>Regular content</MjmlText>
                </MjmlColumn>
            </MjmlSection>

            <ThemeProvider theme={darkSectionTheme}>
                <MjmlSection indent>
                    <MjmlColumn>
                        <MjmlText>Dark footer with white text</MjmlText>
                    </MjmlColumn>
                </MjmlSection>
            </ThemeProvider>
        </>
    );
}
```

`ThemeProvider` **replaces** the theme — it does not merge with the parent. Spread the root theme and override only what needs to change to preserve settings like font family, variants, and breakpoints.

Theme-aware `registerStyles` entries always resolve against the **root theme** from `MjmlMailRoot`, not nested `ThemeProvider` scopes.

---

## MJML Component Re-exports

`@dextinity/mail-react` re-exports all MJML components from `@faire/mjml-react`. Consumers import everything from `@dextinity/mail-react` — never from `@faire/mjml-react` directly.

Common re-exports: `MjmlColumn`, `MjmlSpacer`, `MjmlTable`, `MjmlRaw`, `MjmlGroup`, `MjmlAttributes`, `MjmlAll`, `MjmlClass`, `MjmlStyle`, `MjmlComment`, `MjmlConditionalComment`.

For the full MJML tag reference: https://documentation.mjml.io/
