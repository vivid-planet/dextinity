# Styling & Customization Reference

Deep dive into the desktop-first styling model, `registerStyles`, BEM naming, custom component patterns, and overriding built-in components.

## Table of Contents

1. [Desktop-First Styling Model](#desktop-first-styling-model)
2. [The `css` Helper](#the-css-helper)
3. [Registering Responsive Styles](#registering-responsive-styles)
4. [BEM Class Naming Convention](#bem-class-naming-convention)
5. [Custom Component Pattern](#custom-component-pattern)
6. [The `belowMediaQuery` Pattern](#the-belowmediaquery-pattern)
7. [Overriding Built-In Components](#overriding-built-in-components)
8. [Forwarding Props via `slotProps`](#forwarding-props-via-slotprops)
9. [MJML Table Structure](#mjml-table-structure)

---

## Desktop-First Styling Model

Email clients that lack CSS support are almost exclusively desktop clients (Outlook 2007–2019, older Lotus Notes). Mobile email clients — Apple Mail, Gmail app, Outlook mobile — all support `<style>` blocks and media queries.

This means:

- **Desktop/default rendering** → inline styles only (MJML props compile to inline styles)
- **Mobile/responsive overrides** → `<style>` blocks with media queries via `registerStyles`

The base email must look correct with zero CSS from `<style>` blocks. Media queries are layered on top as progressive enhancement for mobile viewports.

### Why `!important`?

Email clients inline all styles during processing. Since inline styles have higher CSS specificity than `<style>` block rules, responsive overrides must use `!important` to win. Every property inside a media query override should have `!important`.

---

## The `css` Helper

`css` is a tagged template literal that returns a plain string. Its only purpose is enabling CSS syntax highlighting and auto-formatting in editors (e.g., the styled-components VS Code extension):

```ts
import { css } from "@comet/mail-react";

const styles = css`
    @media (max-width: 419px) {
        .myComponent {
            padding: 12px !important;
        }
    }
`;
```

No runtime styling logic — purely a developer experience improvement.

---

## Registering Responsive Styles

`registerStyles` adds CSS to the email's `<head>` as `<style>` blocks. Call it at the **module level** (outside component functions) so styles are registered once when the module is first imported.

Since `<style>` blocks are ignored by some desktop clients, `registerStyles` is intended for responsive overrides inside media queries — not for base styles, which must be inline.

### Theme-Aware CSS (Preferred)

When you need access to theme tokens (breakpoints, colors, sizes) — which is **most of the time**. Always prefer theme-aware styles over static CSS so that breakpoints and tokens stay in sync with the theme. If a breakpoint value is needed repeatedly but doesn't exist in the theme, add it via `createBreakpoint` and module augmentation rather than hardcoding media queries.

```ts
registerStyles(
    (theme) => css`
        ${theme.breakpoints.mobile.belowMediaQuery} {
            .calloutBox {
                padding: 12px !important;
                border-color: ${theme.colors.background.body} !important;
            }
        }
    `,
);
```

Theme-aware entries are called at render time with the theme from `MjmlMailRoot`. Using `theme.breakpoints.mobile.belowMediaQuery` keeps styles in sync with the theme's breakpoint configuration.

### Static CSS

When you genuinely don't need any theme values (rare — most responsive styles benefit from theme breakpoints):

```ts
import { css, registerStyles } from "@comet/mail-react";

registerStyles(css`
    @media (max-width: 419px) {
        .calloutBox {
            padding: 12px !important;
        }
    }
`);
```

### Important Details

- Call at **module level**, not inside component functions
- `MjmlMailRoot` renders all registered styles automatically
- Duplicate registrations with the same function/string reference overwrite (stored in a `Map`)
- Theme-aware entries always resolve against the **root theme** from `MjmlMailRoot` — nested `ThemeProvider` scopes do not affect them
- Optional second argument: partial `MjmlStyle` props (forwarded to the underlying `<mj-style>`)

---

## BEM Class Naming Convention

Use BEM with camelCase blocks for custom component CSS classes:

| BEM Part | Pattern                       | Example                   |
| -------- | ----------------------------- | ------------------------- |
| Block    | `componentName`               | `calloutBox`              |
| Element  | `componentName__elementName`  | `calloutBox__title`       |
| Modifier | `componentName--modifierName` | `calloutBox--highlighted` |

Built-in components follow this convention:

- `mjmlSection`, `mjmlSection--indented`
- `mjmlText`, `mjmlText--heading`, `mjmlText--bottomSpacing`
- `htmlText`, `htmlText--body`
- `htmlInlineLink`

---

## Custom Component Pattern

The complete pattern for building email-safe custom components:

1. **Inline styles** for base/desktop rendering — set via `style` props on HTML elements
2. **BEM class names** on elements that need responsive overrides
3. **`registerStyles`** at module level with media queries targeting those classes
4. **`!important`** on all responsive overrides

```tsx
import { css, MjmlColumn, MjmlRaw, MjmlSection, registerStyles } from "@comet/mail-react";

interface FeatureCardProps {
    title: string;
    description: string;
    highlighted?: boolean;
}

function FeatureCard({ title, description, highlighted = false }: FeatureCardProps) {
    return (
        <MjmlSection>
            <MjmlColumn>
                <MjmlRaw>
                    <tr>
                        <td
                            className={`featureCard${highlighted ? " featureCard--highlighted" : ""}`}
                            style={{
                                padding: "24px",
                                border: "1px solid #E0E0E0",
                                borderRadius: "8px",
                                backgroundColor: highlighted ? "#F0F7FF" : "#FFFFFF",
                            }}
                        >
                            <span
                                className="featureCard__title"
                                style={{
                                    display: "block",
                                    fontSize: "20px",
                                    fontWeight: 700,
                                    lineHeight: "28px",
                                    msoLineHeightRule: "exactly",
                                    margin: "0 0 8px 0",
                                }}
                            >
                                {title}
                            </span>
                            <span
                                className="featureCard__description"
                                style={{
                                    display: "block",
                                    fontSize: "14px",
                                    lineHeight: "22px",
                                    msoLineHeightRule: "exactly",
                                    color: "#555555",
                                }}
                            >
                                {description}
                            </span>
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
            .featureCard {
                padding: 16px !important;
            }
            .featureCard__title {
                font-size: 18px !important;
                line-height: 24px !important;
            }
            .featureCard__description {
                font-size: 13px !important;
            }
        }
    `,
);
```

### Key Reminders

- Inside `MjmlRaw` and other ending tags, you're in HTML-land — only HTML elements, no MJML components
- Always reset margins on block-level elements: `style={{ margin: 0 }}`
- **Every element with a manual `line-height`** must also have `mso-line-height-rule: exactly` as an inline style — Outlook ignores standard line-height calculations and produces unexpected vertical spacing without it. This is easy to forget on `<span>` and `<td>` elements inside custom components.
- `borderRadius` won't render in Outlook — provide a visually acceptable fallback

---

## The `belowMediaQuery` Pattern

Every breakpoint in the theme has a `belowMediaQuery` property — a ready-to-use CSS media query string targeting viewports below that breakpoint:

```ts
theme.breakpoints.mobile.belowMediaQuery;
// → "@media (max-width: 419px)"   (for mobile breakpoint at 420px)

theme.breakpoints.tablet.belowMediaQuery;
// → "@media (max-width: 539px)"   (for tablet breakpoint at 540px, if augmented)
```

Always use `belowMediaQuery` instead of hardcoding media query values:

```ts
registerStyles(
    (theme) => css`
        ${theme.breakpoints.mobile.belowMediaQuery} {
            .myComponent {
                font-size: 14px !important;
                padding: 10px !important;
            }
        }
    `,
);
```

This keeps responsive styles in sync with the theme's breakpoint configuration.

---

## Overriding Built-In Components

Target built-in CSS class names in `registerStyles` to add responsive overrides to library components:

```ts
registerStyles(
    (theme) => css`
        ${theme.breakpoints.mobile.belowMediaQuery} {
            .mjmlSection--indented > table > tbody > tr > td {
                background-color: ${theme.colors.background.body} !important;
            }
        }
    `,
);
```

### Built-In CSS Class Names

| Component        | Classes                                                         |
| ---------------- | --------------------------------------------------------------- |
| `MjmlSection`    | `.mjmlSection`, `.mjmlSection--indented`                        |
| `MjmlText`       | `.mjmlText`, `.mjmlText--{variant}`, `.mjmlText--bottomSpacing` |
| `HtmlText`       | `.htmlText`, `.htmlText--{variant}`, `.htmlText--bottomSpacing` |
| `HtmlInlineLink` | `.htmlInlineLink`                                               |

---

## Forwarding Props via `slotProps`

Some components use internal sub-components not directly accessible through the main API. These expose a `slotProps` prop for forwarding:

```tsx
<MjmlSection disableResponsiveBehavior slotProps={{ group: { width: "100%" } }}>
    <MjmlColumn>
        <MjmlText>Column 1</MjmlText>
    </MjmlColumn>
    <MjmlColumn>
        <MjmlText>Column 2</MjmlText>
    </MjmlColumn>
</MjmlSection>
```

Currently, `MjmlSection` exposes `slotProps.group` for forwarding props to the internal `MjmlGroup` when `disableResponsiveBehavior` is enabled.

---

## MJML Table Structure

MJML generates table-based HTML. When targeting nested elements inside MJML components via CSS, you may need to traverse the generated table structure:

```css
.mjmlSection--indented > table > tbody > tr > td {
    /* targets the actual content cell */
}
```

Use browser dev tools in Storybook to inspect the generated HTML structure when writing CSS selectors for built-in components. The exact nesting varies by component and shouldn't be assumed — always inspect first.
