---
title: Customization
---

## Creating Custom Components

When the built-in components don't cover your layout needs, you can create custom components. As described in [The Styling Model](./1-email-basics.md#the-styling-model), base/default styles must be applied inline so the email renders correctly on clients that ignore `<style>` blocks (e.g., Outlook). Responsive overrides that adapt the layout for mobile viewports go into `<style>` blocks via `registerStyles`.

### The `css` Helper

`css` is a tagged template literal that returns a plain string. Its purpose is to enable CSS syntax highlighting and auto-formatting in editors that support it (e.g., the styled-components VS Code extension):

```ts
import { css } from "@dextinity/mail-react";

const mobilePadding = css`
    @media (max-width: 419px) {
        .myComponent {
            padding: 12px !important;
        }
    }
`;
```

### Registering Responsive Styles

`registerStyles` adds CSS to the email's `<head>` as `<style>` blocks. Call it at the **module level** (outside the component function) so styles are registered once when the module is first imported. `MjmlMailRoot` automatically renders all registered styles.

Since `<style>` blocks are ignored by some desktop clients, `registerStyles` is intended for responsive overrides inside media queries — not for base styles, which must be inline.

There are two ways to register styles:

**Static CSS** — when you don't need theme values:

```ts
import { css, registerStyles } from "@dextinity/mail-react";

registerStyles(css`
    @media (max-width: 419px) {
        .calloutBox {
            padding: 12px !important;
        }
    }
`);
```

**Theme-aware CSS** — when you need access to theme tokens (breakpoints, colors, sizes):

```ts
import { css, registerStyles } from "@dextinity/mail-react";

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

For theme-aware entries, the function is called at render time with the theme provided to `MjmlMailRoot`. Using `theme.breakpoints.mobile.belowMediaQuery` instead of a hardcoded media query keeps styles in sync with the theme's breakpoint configuration.

:::caution
Theme-aware `registerStyles` entries always resolve against the **root theme** from `MjmlMailRoot`. Nested [`ThemeProvider`](./2-components-and-theme.md#scoped-theming) scopes do not affect them.
:::

### Full Example

Here's a complete custom component that applies base styles inline and uses `registerStyles` for a responsive override:

```tsx title="CalloutBox.tsx"
import { css, MjmlColumn, MjmlRaw, MjmlSection, registerStyles } from "@dextinity/mail-react";

function CalloutBox({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <MjmlSection>
            <MjmlColumn>
                <MjmlRaw>
                    <tr>
                        <td
                            className="calloutBox"
                            style={{
                                border: "2px solid #0066cc",
                                borderRadius: "8px",
                                padding: "20px",
                            }}
                        >
                            <span
                                style={{ display: "block", margin: "0 0 8px 0", fontSize: "18px" }}
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
        }
    `,
);
```

The key pattern:

1. Apply base styles as inline `style` attributes — these are the desktop/default rendering
2. Assign CSS class names to elements that need responsive overrides
3. Call `registerStyles` at the module level with media queries targeting those class names
4. Use `!important` in the media query rules to override the inlined defaults

## Forwarding Props via `slotProps`

Some `@dextinity/mail-react` components use internal sub-components that aren't directly accessible through the component's own props. These components expose a `slotProps` prop, which lets you forward additional props to specific internal elements.

For example, when `disableResponsiveBehavior` is enabled, `MjmlSection` wraps its children in an internal `MjmlGroup`. Use `slotProps.group` to forward props to it:

```tsx
<MjmlSection disableResponsiveBehavior slotProps={{ group: { width: "100%" } }}>
    <MjmlColumn>
        <MjmlText>First column</MjmlText>
    </MjmlColumn>
    <MjmlColumn>
        <MjmlText>Second column</MjmlText>
    </MjmlColumn>
</MjmlSection>
```

## Adding Custom Responsive Styles

Email clients inline all styles, so responsive overrides must be placed in `<style>` blocks within the email head and use `!important` to win over the inlined values. The `registerStyles` function is the way to get CSS into the head, and the theme's `belowMediaQuery` strings make writing media queries straightforward.

### The `belowMediaQuery` Pattern

Every breakpoint in the theme has a `belowMediaQuery` property — a ready-to-use CSS media query string targeting viewports below that breakpoint:

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

:::caution
Always use `!important` in media query overrides. Without it, the email client's inlined styles will take precedence and your responsive styles won't apply.
:::

### CSS Class Name Conventions

The built-in components apply stable CSS class names that you can target in your own `registerStyles` calls:

| Component        | Class names                                                                   |
| ---------------- | ----------------------------------------------------------------------------- |
| `MjmlSection`    | `.mjmlSection`, `.mjmlSection--indented` (when `indent` is set)               |
| `MjmlText`       | `.mjmlText`, `.mjmlText--{variant}` (per variant), `.mjmlText--bottomSpacing` |
| `HtmlText`       | `.htmlText`, `.htmlText--{variant}` (per variant), `.htmlText--bottomSpacing` |
| `HtmlInlineLink` | `.htmlInlineLink`                                                             |

### Example: Overriding Built-In Components

Use the class names above to add responsive overrides for built-in components. For example, changing the background color of indented sections on mobile:

```ts
import { css, registerStyles } from "@dextinity/mail-react";

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

:::note
MJML generates table-based HTML. When targeting nested elements inside MJML components, you may need to go through the table structure (e.g., `> table > tbody > tr > td`) to reach the element you want to style. Use the browser dev tools in Storybook to inspect the generated HTML structure.
:::

## Configuration

`Config` can be used to expose, e.g., environment-specific values such as asset base URLs or per-deployment identifiers.

- **`Config`** — an augmentable interface.
- **`MjmlMailRoot.config`** — optional prop that exposes a `Config` value to descendants.
- **`useConfig`** — hook that returns the nearest `Config`, or `{}` if no provider is mounted.
- **`ConfigProvider`** — standalone provider for cases that bypass `MjmlMailRoot`.

Add keys via TypeScript module augmentation:

```ts title="config.ts"
declare module "@dextinity/mail-react" {
    interface Config {
        assetBaseUrl?: string;
    }
}
```

Pass the value at the root and read it from any descendant:

```tsx
import { MjmlMailRoot, useConfig, type Config } from "@dextinity/mail-react";

const config: Config = { assetBaseUrl: process.env.ASSET_BASE_URL };

function WelcomeEmail() {
    return (
        <MjmlMailRoot config={config}>
            {/* descendants can call useConfig() */}
        </MjmlMailRoot>
    );
}
```
