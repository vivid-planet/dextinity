# Components & Theme Reference

Detailed reference for all `@comet/mail-react` components, the theme system, module augmentation, and scoped theming.

## Table of Contents

1. [Theme Structure & Defaults](#theme-structure--defaults)
2. [Module Augmentation Interfaces](#module-augmentation-interfaces)
3. [MjmlMailRoot](#mjmlmailroot)
4. [MjmlSection](#mjmlsection)
5. [MjmlWrapper](#mjmlwrapper)
6. [Text Components](#text-components)
7. [HtmlInlineLink](#htmlinlinelink)
8. [Scoped Theming](#scoped-theming)
9. [MJML Component Re-exports](#mjml-component-re-exports)

---

## Theme Structure & Defaults

`createTheme(overrides?)` merges partial overrides into the default theme:

| Path                        | Default                       | Description                                                 |
| --------------------------- | ----------------------------- | ----------------------------------------------------------- |
| `sizes.bodyWidth`           | `600`                         | Email container width in pixels                             |
| `sizes.contentIndentation`  | `{ default: 32, mobile: 16 }` | Left/right padding when `indent` is used                    |
| `breakpoints.default`       | `createBreakpoint(bodyWidth)` | Auto-set to body width unless explicitly overridden         |
| `breakpoints.mobile`        | `createBreakpoint(420)`       | Mobile breakpoint (`max-width: 419px`)                      |
| `text.fontFamily`           | System default                | Base font family                                            |
| `text.fontSize`             | `"16px"`                      | Base font size                                              |
| `text.lineHeight`           | `"20px"`                      | Base line height                                            |
| `text.bottomSpacing`        | `"16px"`                      | Default spacing below text when `bottomSpacing` prop is set |
| `text.defaultVariant`       | `undefined`                   | Variant applied when no `variant` prop is specified         |
| `text.variants`             | `{}`                          | Named typography presets                                    |
| `colors.background.body`    | `"#F2F2F2"`                   | Email body background                                       |
| `colors.background.content` | `"#FFFFFF"`                   | Section content background                                  |

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
});
```

The `default` key provides the base value (rendered inline). Other keys generate media query overrides automatically.

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

declare module "@comet/mail-react" {
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

### ThemeBreakpoints

Built-in keys are `default` and `mobile`. Add custom breakpoints:

```ts
import { createBreakpoint, type ThemeBreakpoint } from "@comet/mail-react";

const theme = createTheme({
    breakpoints: { tablet: createBreakpoint(540) },
    sizes: {
        contentIndentation: { default: 40, tablet: 30, mobile: 20 },
    },
});

declare module "@comet/mail-react" {
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

declare module "@comet/mail-react" {
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

**Props:**

| Prop       | Type        | Default         | Description         |
| ---------- | ----------- | --------------- | ------------------- |
| `theme`    | `Theme`     | `createTheme()` | Theme for the email |
| `children` | `ReactNode` | —               | Email content       |

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

**Props** (in addition to standard MJML section props):

| Prop                        | Type                                  | Default                           | Description                                                                     |
| --------------------------- | ------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------- |
| `indent`                    | `boolean`                             | `false`                           | Applies theme-based left/right padding                                          |
| `disableResponsiveBehavior` | `boolean`                             | `false`                           | Prevents columns from stacking on mobile                                        |
| `slotProps`                 | `{ group?: Partial<MjmlGroupProps> }` | —                                 | Forward props to internal `MjmlGroup` (when `disableResponsiveBehavior` is set) |
| `backgroundColor`           | `string`                              | `theme.colors.background.content` | Override section background color                                               |

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

**Props** (standard MJML wrapper props):

| Prop              | Type        | Default                           | Description                                                           |
| ----------------- | ----------- | --------------------------------- | --------------------------------------------------------------------- |
| `backgroundColor` | `string`    | `theme.colors.background.content` | Background applied to the whole wrapper; shows through inner sections |
| `children`        | `ReactNode` | —                                 | Sections to group                                                     |

When a theme is present, `MjmlWrapper` applies `theme.colors.background.content` as its default `backgroundColor`. Inner `MjmlSection`s suppress their own theme-default background so the wrapper's color is visible; an explicit `backgroundColor` prop on an inner section still wins.

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

**Props** (in addition to standard MJML text props):

| Prop            | Type                 | Description                               |
| --------------- | -------------------- | ----------------------------------------- |
| `variant`       | `keyof TextVariants` | Named typography preset from theme        |
| `bottomSpacing` | `boolean`            | Add spacing below (from theme or variant) |

**CSS classes:** `.mjmlText`, `.mjmlText--{variant}`, `.mjmlText--bottomSpacing`.

```tsx
<MjmlText variant="heading" bottomSpacing>Large heading with spacing</MjmlText>
<MjmlText variant="body">Regular body text</MjmlText>
<MjmlText>Uses defaultVariant if set in theme</MjmlText>
```

Variant styles merge on top of base theme text styles — properties not set by the variant inherit from the base.

### HtmlText

Themed text for use inside ending tags (`MjmlText`, `MjmlRaw`) or custom HTML structures where MJML components can't be used. Renders a plain HTML element.

**Props:**

| Prop            | Type                 | Default | Description            |
| --------------- | -------------------- | ------- | ---------------------- |
| `variant`       | `keyof TextVariants` | —       | Typography preset      |
| `bottomSpacing` | `boolean`            | `false` | Add spacing below      |
| `element`       | `string`             | `"td"`  | HTML element to render |

**CSS classes:** `.htmlText`, `.htmlText--{variant}`, `.htmlText--bottomSpacing`.

```tsx
<MjmlRaw>
    <table>
        <tr>
            <HtmlText variant="body">Themed text inside a raw table</HtmlText>
        </tr>
    </table>
</MjmlRaw>

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

**Props:** Standard `<a>` props. Defaults to `target="_blank"` and `text-decoration: underline`.

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

## Scoped Theming

`ThemeProvider` applies a different theme to a subtree. Common use: dark-background sections.

**Prefer `MjmlWrapper` when only the background color changes.** Reach for `ThemeProvider` when text color, variants, or other theme values also need to differ — cloning a theme is overkill for a background-only change.

```tsx
import { ThemeProvider } from "@comet/mail-react";
import { theme } from "./theme";

const darkSectionTheme = structuredClone(theme);
darkSectionTheme.colors.background.content = "#1A1A2E";
darkSectionTheme.text.color = "#FFFFFF";

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

`ThemeProvider` **replaces** the theme — it does not merge with the parent. Use `structuredClone` on the root theme and override only what needs to change to preserve settings like font family, variants, and breakpoints.

Theme-aware `registerStyles` entries always resolve against the **root theme** from `MjmlMailRoot`, not nested `ThemeProvider` scopes.

---

## MJML Component Re-exports

`@comet/mail-react` re-exports all MJML components from `@faire/mjml-react`. Consumers import everything from `@comet/mail-react` — never from `@faire/mjml-react` directly.

Common re-exports: `MjmlColumn`, `MjmlImage`, `MjmlButton`, `MjmlDivider`, `MjmlSpacer`, `MjmlTable`, `MjmlRaw`, `MjmlGroup`, `MjmlAttributes`, `MjmlAll`, `MjmlClass`, `MjmlStyle`, `MjmlComment`, `MjmlConditionalComment`.

For the full MJML tag reference: https://documentation.mjml.io/
