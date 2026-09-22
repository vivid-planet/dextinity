---
name: comet-mail-react
description: Guide for building HTML emails with @comet/mail-react and MJML. Use whenever working on email templates, mail markup, MJML components, email theming, email styling, responsive emails, column layouts, multi-column email sections, or anything involving @comet/mail-react or HTML email development — even for seemingly simple tasks like putting content side-by-side in columns, since email client compatibility is a minefield that requires specific patterns and research before implementing.
---

# Building HTML Emails with @comet/mail-react

`@comet/mail-react` lets you build responsive, themed HTML emails using React components. Under the hood it uses [MJML](https://documentation.mjml.io/) to generate cross-client-compatible HTML. The library provides a theme system, higher-level wrapper components, a style utility layer, and Storybook integration for live previewing emails during development.

---

## Research Before You Code

Email development is fundamentally different from web development. There is no shared rendering engine across email clients — the most constrained major client, Outlook on Windows (2007–2019), uses **Microsoft Word** to render HTML, supporting only a fraction of modern CSS. What works perfectly in a browser will often break in email clients, sometimes in surprising ways.

Before implementing any visual technique — even things that seem basic like rounded corners, background images, custom fonts, or flexbox layouts — **verify support across email clients**. Many common CSS properties are partially or fully unsupported. This isn't a "nice to have" step — it prevents hours of debugging and rework.

### Essential Resources

Keep these open during email development:

| Resource                       | What it's for                                                                    | URL                                  |
| ------------------------------ | -------------------------------------------------------------------------------- | ------------------------------------ |
| **Can I email**                | Check CSS/HTML feature support across email clients (like caniuse.com for email) | https://www.caniemail.com/           |
| **MJML Documentation**         | Full reference for all MJML tags and their attributes                            | https://documentation.mjml.io/       |
| **Litmus Blog & Resources**    | Email development best practices, testing guides, client quirks                  | https://www.litmus.com/blog/         |
| **Campaign Monitor CSS Guide** | Comprehensive CSS support tables per email client                                | https://www.campaignmonitor.com/css/ |
| **Bulletproof Backgrounds**    | VML-based background image generator for Outlook                                 | https://www.backgrounds.cm/          |
| **Bulletproof Buttons**        | VML-based rounded button generator for Outlook                                   | https://www.buttons.cm/              |

### The Research Habit

When implementing any visual feature:

1. Check [Can I email](https://www.caniemail.com/) for the CSS properties involved
2. If the property isn't supported in Outlook, search for VML workarounds or provide a graceful fallback (skipping border-radius is generally acceptable)
3. Test in Storybook with the MJML Warnings panel open
4. When uncertain, consult the Litmus blog or Campaign Monitor guide for known patterns

This applies to seemingly simple things: `border-radius`, `background-image`, `flexbox`, `gap`, custom fonts — all have partial or no support in major email clients.

### Library Documentation

Full documentation for `@comet/mail-react`: https://docs.comet-dxp.com/docs/features-modules/building-html-emails/

---

## The MJML Layout Model

MJML enforces a strict **section → column → content** nesting hierarchy:

- **`MjmlSection`** — a full-width horizontal row
- **`MjmlColumn`** — divides a section into vertical columns (stacking on mobile by default)
- **Content components** (`MjmlText`, `MjmlImage`, `MjmlButton`, etc.) — placed inside a column

Content components placed outside this hierarchy produce MJML validation warnings and broken layouts. The MJML Warnings panel in Storybook surfaces these during development.

```tsx
<MjmlSection indent>
    <MjmlColumn>
        <MjmlText variant="heading">Section title</MjmlText>
        <MjmlText variant="body" bottomSpacing>
            Body paragraph with spacing below.
        </MjmlText>
        <MjmlImage src="https://example.com/image.jpg" alt="Example" />
    </MjmlColumn>
</MjmlSection>
```

### Multi-Column Layouts

MJML has no `gap` property. Column padding reduces the content area _inside_ the column — it doesn't add space between column cells. To create a visual gap between columns, apply padding to the inner edges of adjacent columns (`paddingRight` on the left column, `paddingLeft` on the right column). Their sum becomes the visible gap.

For two equal columns, apply half the desired gap to each column's inner edge. Both columns have the same total padding, so MJML's equal-width split produces equal content areas without explicit `width` props:

```tsx
const columnGap = 20;
const halfGap = columnGap / 2;

<MjmlSection indent className="twoColumnsSection">
    <MjmlColumn className="twoColumnsSection__leftColumn" paddingRight={halfGap}>
        <MjmlText>Left column</MjmlText>
    </MjmlColumn>
    <MjmlColumn className="twoColumnsSection__rightColumn" paddingLeft={halfGap}>
        <MjmlText>Right column</MjmlText>
    </MjmlColumn>
</MjmlSection>;
```

**Do not** apply equal padding on all sides of every column — this adds extra outer-edge spacing that compounds with `indent`/`contentIndentation`, pushing content inward beyond the theme's intended margins.

On mobile, reset the gap padding so content stretches full-width, and add a vertical margin between the stacked columns. Column padding compiles to an inner `<td>`, so target it via `.className > table > tbody > tr > td`.

→ For complete two-column patterns (equal-width and fixed+fluid) with responsive styles, CSS targeting rules, and the `direction="rtl"` technique for controlling mobile stack order, read [`references/layout-patterns.md`](references/layout-patterns.md).

### Ending Tags

Some MJML components are [**ending tags**](https://documentation.mjml.io/#ending-tags) — they accept raw HTML as children but **cannot** contain other MJML components. The most common: `MjmlText`, `MjmlButton`, `MjmlTable`, `MjmlRaw`.

Once inside an ending tag, you are in **HTML-land for the entire subtree**. Use HTML elements (`<span>`, `<a>`, `<table>`, `<td>`) but not MJML components. The library provides `HtmlText` and `HtmlInlineLink` for themed text and links inside ending tags.

For raw HTML layouts outside text, use `MjmlRaw` (or `MjmlTable`). These are escape hatches for cases MJML components can't handle — use them as a last resort.

---

## The Styling Model

Email styling follows a **desktop-first** approach:

1. **Base/default styles are inline** — applied through MJML component props or explicit `style` attributes on HTML elements. Desktop clients like Outlook ignore `<style>` blocks entirely, so the base rendering must look correct with inline styles alone.

2. **Responsive overrides are progressive enhancement** — registered via `registerStyles` with media queries targeting mobile viewports. Clients that support media queries also support modern CSS, so properties like `flex`, and CSS custom properties are safe inside media queries.

3. **`!important` is required** in media query overrides — because inline styles take precedence over `<style>` block rules, responsive overrides need `!important` to win.

Never rely on `<style>` blocks for base/desktop layout. Set all default styles inline via MJML component props.

### Prefer Theme Breakpoints

Always use `theme.breakpoints.*.belowMediaQuery` inside `registerStyles` instead of hardcoding media query values. This keeps responsive styles in sync with the theme configuration. If a breakpoint value is needed repeatedly but doesn't exist in the theme, add it via `createBreakpoint` and module augmentation rather than duplicating raw media queries. Reserve hardcoded media queries for genuinely one-off values.

→ For the full `registerStyles` API, `css` helper, and custom component patterns, read [`references/styling-and-customization.md`](references/styling-and-customization.md).

---

## Common Pitfalls

### Avoid Block-Level HTML Elements Inside Ending Tags

Don't use `<p>`, `<h1>`, `<h2>`, or other block-level HTML elements inside ending tags. They have wildly inconsistent default margins and spacing across email clients and add no rendering value in email HTML. Instead, use `<td>`, `<div>`, and `<span>` for structure, and build your typography hierarchy through `MjmlText`/`HtmlText` variants rather than HTML semantics. If a block-level element is truly unavoidable, always reset its margins inline: `style={{ margin: 0 }}`.

### Set `mso-line-height-rule: exactly` on Every Manual `line-height`

Outlook calculates line-height using its own rules, causing unexpected vertical spacing. **Every time** you set `line-height` on a raw HTML element inside an ending tag (`MjmlRaw`, `MjmlText`, etc.), you must also set `mso-line-height-rule: exactly` as an inline style on the same element. This applies to `<span>`, `<td>`, `<div>`, or any other element where you manually control line height. `HtmlText` and built-in MJML components handle this automatically — but any hand-written HTML needs it explicitly.

### No CSS `background-image` in Outlook

Outlook ignores `background-image` entirely. Use a VML-based workaround for Outlook support, or provide a `background-color` fallback for graceful degradation. See [Bulletproof Backgrounds](https://www.backgrounds.cm/).

### No CSS `border-radius` in Outlook

Outlook ignores `border-radius` — rounded corners render as sharp rectangles. The workaround is VML `v:roundrect` in conditional comments (`<!--[if mso]>`). See [Bulletproof Buttons](https://www.buttons.cm/) and the [Litmus VML button snippet](https://litmus.com/community/snippets/7-bulletproof-button-vml-approach).

---

## Theme Setup & Type-Safety

Create a theme with `createTheme()` and pass it to `MjmlMailRoot`:

```tsx
import { createTheme, MjmlMailRoot } from "@comet/mail-react";

const theme = createTheme({
    sizes: {
        bodyWidth: 700,
        contentIndentation: { default: 40, mobile: 20 },
    },
    text: {
        fontFamily: "Georgia, serif",
        fontSize: "18px",
    },
    colors: {
        background: { body: "#EAEAEA", content: "#FAFAFA" },
    },
});

function MyEmail() {
    return <MjmlMailRoot theme={theme}>{/* email content */}</MjmlMailRoot>;
}
```

### Module Augmentation for Type-Safety

`@comet/mail-react` uses TypeScript module augmentation to make custom theme tokens type-safe. Always augment these interfaces when extending the theme — TypeScript will then error on typos or unknown keys.

**Text Variants** — restrict `variant` prop to defined names:

```ts
declare module "@comet/mail-react" {
    interface TextVariants {
        heading: true;
        body: true;
        caption: true;
    }
}
```

**Custom Breakpoints** — make new breakpoint keys available in responsive values:

```ts
declare module "@comet/mail-react" {
    interface ThemeBreakpoints {
        tablet: ThemeBreakpoint;
    }
}
```

**Custom Colors** — add project-specific color tokens:

```ts
declare module "@comet/mail-react" {
    interface ThemeBackgroundColors {
        highlight: string;
    }
    interface ThemeColors {
        brand: { primary: string; secondary: string };
    }
}
```

Place `declare module` blocks in your theme file below the `createTheme()` call.

→ For the full theme structure, defaults, and all component props, read [`references/components-and-theme.md`](references/components-and-theme.md).

---

## Components Overview

### MJML Components (Layout Level)

| Component      | Purpose                                                           | CSS Classes                                                     |
| -------------- | ----------------------------------------------------------------- | --------------------------------------------------------------- |
| `MjmlMailRoot` | Root element, provides theme, renders `<mjml>` skeleton           | —                                                               |
| `MjmlWrapper`  | Groups sections sharing a background; theme-aware default bg      | —                                                               |
| `MjmlSection`  | Full-width row, supports `indent` and `disableResponsiveBehavior` | `.mjmlSection`, `.mjmlSection--indented`                        |
| `MjmlColumn`   | Vertical column inside a section                                  | —                                                               |
| `MjmlText`     | Themed text block with `variant` and `bottomSpacing`              | `.mjmlText`, `.mjmlText--{variant}`, `.mjmlText--bottomSpacing` |
| `MjmlImage`    | Image                                                             | —                                                               |
| `MjmlButton`   | Button (ending tag)                                               | —                                                               |
| `MjmlDivider`  | Horizontal divider                                                | —                                                               |
| `MjmlSpacer`   | Vertical spacing                                                  | —                                                               |
| `MjmlRaw`      | Raw HTML escape hatch (ending tag)                                | —                                                               |

### HTML Components (Inside Ending Tags)

| Component        | Purpose                                                  | CSS Classes                                                     |
| ---------------- | -------------------------------------------------------- | --------------------------------------------------------------- |
| `HtmlText`       | Themed text as HTML element (default `<td>`)             | `.htmlText`, `.htmlText--{variant}`, `.htmlText--bottomSpacing` |
| `HtmlInlineLink` | `<a>` that inherits parent text styles, works in Outlook | `.htmlInlineLink`                                               |

Text components (`MjmlText`, `HtmlText`) support `variant` and `bottomSpacing` props tied to the theme. Variants define typography presets (font size, weight, line height, color). Both support responsive values that change at different breakpoints. Set a `defaultVariant` in the theme to apply a variant automatically when none is specified.

All components are imported from `@comet/mail-react` — never from `@faire/mjml-react` directly.

→ For complete component props, responsive values, scoped theming, and MJML re-exports, read [`references/components-and-theme.md`](references/components-and-theme.md).

---

## Custom Components

When built-in components don't cover your needs, create custom components. **Always try to compose layouts using MJML components first** (`MjmlSection`, `MjmlColumn`, `MjmlText`, `MjmlImage`, etc.) — they handle cross-client compatibility automatically. Only drop into raw HTML (`MjmlRaw`, `MjmlTable`) when the MJML layout model genuinely can't express the structure you need. Raw HTML is an escape hatch, not the default approach.

When raw HTML is necessary, follow these conventions:

### BEM Class Naming

Use BEM with camelCase blocks for CSS class names:

| BEM Part | Pattern                       | Example                   |
| -------- | ----------------------------- | ------------------------- |
| Block    | `componentName`               | `calloutBox`              |
| Element  | `componentName__elementName`  | `calloutBox__title`       |
| Modifier | `componentName--modifierName` | `calloutBox--highlighted` |

### The Pattern

1. **Inline styles** for base/desktop rendering
2. **BEM class names** on elements that need responsive overrides
3. **`registerStyles`** at module level with media queries
4. **`!important`** on all responsive overrides

```tsx
import { css, MjmlColumn, MjmlRaw, MjmlSection, registerStyles } from "@comet/mail-react";

function CalloutBox({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <MjmlSection>
            <MjmlColumn>
                <MjmlRaw>
                    <tr>
                        <td className="calloutBox" style={{ border: "2px solid #0066cc", borderRadius: "8px", padding: "20px" }}>
                            <span
                                className="calloutBox__title"
                                style={{ display: "block", margin: "0 0 8px 0", fontSize: "18px", lineHeight: "24px", msoLineHeightRule: "exactly" }}
                            >
                                {title}
                            </span>
                            <div>{children}</div>
                        </td>
                    </tr>
                </MjmlRaw>
            </MjmlColumn>
        </MjmlSection>
    );
}

registerStyles(
    (theme) => css`
        ${theme.breakpoints.mobile.belowMediaQuery} {
            .calloutBox {
                padding: 12px !important;
            }
            .calloutBox__title {
                font-size: 16px !important;
            }
        }
    `,
);
```

→ For the full `registerStyles` API, `belowMediaQuery` pattern, overriding built-in components, and `slotProps`, read [`references/styling-and-customization.md`](references/styling-and-customization.md).

---

## Rendering

Use `renderMailHtml` to convert the React tree to final HTML for sending:

```tsx
import { MjmlMailRoot, MjmlSection, MjmlColumn, MjmlText } from "@comet/mail-react";
import { renderMailHtml } from "@comet/mail-react/server";

const { html, mjmlWarnings } = renderMailHtml(
    <MjmlMailRoot theme={theme}>
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlText>Hello, world!</MjmlText>
            </MjmlColumn>
        </MjmlSection>
    </MjmlMailRoot>,
);
```

- **Server** (`@comet/mail-react/server`) — uses `mjml`, requires Node.js
- **Client** (`@comet/mail-react/client`) — uses `mjml-browser`, works without `fs`
- `renderMailHtml` is **not** on the main `@comet/mail-react` barrel — always import from `/server` or `/client`
- Returns `{ html: string; mjmlWarnings: MjmlWarning[] }` — warnings are collected, not thrown

### Logging MJML Warnings

When generating emails outside Storybook (e.g., in a mail template's `generateMail` method), always log `mjmlWarnings` in development to catch structural issues early:

```tsx
const { html, mjmlWarnings } = renderMailHtml(/* ... */);

if (process.env.NODE_ENV === "development" && mjmlWarnings.length) {
    console.warn(`${mjmlWarnings.length} MJML Warnings`, mjmlWarnings);
}
```

**Never log MJML warnings in production.** These warnings flag structural MJML issues (e.g., content outside the section → column → content hierarchy) and are useful during development, but the rendered HTML is always produced successfully regardless of warnings. In rare cases, achieving a specific layout intentionally requires a technically invalid MJML structure — logging these in production would spam error trackers like Sentry with noise that cannot be acted upon.

Outside Storybook, wrap content in `MjmlMailRoot` yourself (the Storybook decorator handles it automatically).

---

## Storybook Development

### Setup

Add the addon to `.storybook/main.ts`:

```ts
const config = {
    addons: [
        // ... other addons
        "@comet/mail-react/storybook",
    ],
};
```

This single entry auto-configures:

- A **decorator** that wraps each story in `MjmlMailRoot`, converts MJML to HTML, and displays the rendered email
- A **Copy Mail HTML** toolbar button for copying rendered HTML to the clipboard
- A **Use Public Image URLs** toggle that replaces image sources with public placeholders — useful for testing on external services (Litmus, Email on Acid) that can't reach localhost
- An **MJML Warnings** panel for debugging validation issues

### Writing Stories

Stories only define the email content — the decorator handles `MjmlMailRoot`. Every story should render the actual component being demonstrated (not just surrounding context):

```tsx
import { MjmlColumn, MjmlSection, MjmlText } from "@comet/mail-react";
import type { Meta, StoryObj } from "@storybook/react-vite";

const config: Meta = { title: "Mails/WelcomeEmail" };
export default config;

export const Basic: StoryObj = {
    render: () => (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlText>Hello from my first email!</MjmlText>
            </MjmlColumn>
        </MjmlSection>
    ),
};
```

Pass a custom theme via `parameters.theme`:

```tsx
export const CustomTheme: StoryObj = {
    parameters: { theme: createTheme({ sizes: { bodyWidth: 500 } }) },
    render: () => (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlText>Narrower email at 500px</MjmlText>
            </MjmlColumn>
        </MjmlSection>
    ),
};
```

### Development Workflow

1. Write email templates as Storybook stories
2. Preview rendered HTML in the Storybook canvas
3. Check the **MJML Warnings** panel for validation issues
4. Use **Copy Mail HTML** to test in external services (Litmus, Email on Acid)
5. Enable **Use Public Image URLs** when testing on services that can't reach localhost (e.g., Litmus, Email on Acid)

### Cross-Client Testing

Storybook previews show how the email renders in a web browser, but email clients vary dramatically. Use services like [Litmus](https://www.litmus.com/) or [Email on Acid](https://www.emailonacid.com/) to test the rendered HTML across real email clients and devices. The **Copy Mail HTML** button and **Use Public Image URLs** toggle in Storybook are designed for this workflow.

---

## Related Modules

The `@comet/mail-react` package focuses on building email markup. For sending emails and managing templates in a Comet project:

- **Mail Templates Module** — server-side template registration, dependency injection, and sending. Integrates with `@comet/mail-react` via `renderMailHtml`. Docs: https://docs.comet-dxp.com/docs/features-modules/mail-templates-module/
- **Mailer Module** — lower-level mail sending service. Docs: https://docs.comet-dxp.com/docs/features-modules/mailer-module/
