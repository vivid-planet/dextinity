---
title: Email Basics
---

Email clients don't share a rendering engine the way web browsers do. The most constrained major client — Outlook on Windows (2007–2019) — uses Microsoft Word to render HTML, supporting only a fraction of modern CSS. While Outlook's global market share is small, it dominates in enterprise and B2B environments. This shapes every aspect of email development: table-based layouts (handled by MJML), inline styles for the base rendering, and responsive styles layered on top as progressive enhancement.

:::tip
For researching support across clients, [Can I email](https://www.caniemail.com/scoreboard/), [Google's Gmail CSS support](https://developers.google.com/workspace/gmail/design/css) and the [Litmus blog](https://www.litmus.com/blog/) are invaluable resources.
:::

## MJML Fundamentals

[MJML](https://documentation.mjml.io/) is a markup language that compiles to cross-client-compatible HTML emails. `@dextinity/mail-react` exposes MJML tags as React components (e.g., `MjmlSection`, `MjmlText`, `MjmlColumn`) and adds a theme system and higher-level components on top. You write JSX, the library converts it to MJML, and MJML generates the final HTML.

MJML enforces a **section → column → content** nesting hierarchy. Content components (`MjmlText`, `MjmlImage`, `MjmlButton`, etc.) must always be placed inside `MjmlSection > MjmlColumn`. Placing them elsewhere produces MJML validation warnings and broken layouts. The MJML Warnings panel in Storybook surfaces these issues during development.

For a full reference of all available MJML tags and their attributes, see the [official MJML documentation](https://documentation.mjml.io/).

## The Styling Model

Email styling follows a desktop-first approach where all default styles must be applied inline — either through MJML component props (which compile to inline styles) or through explicit `style` attributes on raw HTML elements. This is because desktop email clients like Outlook (2007–2019) use Microsoft Word as their rendering engine and ignore `<style>` blocks entirely. The base rendering of every email must look correct with inline styles alone.

:::caution
Never rely on `<style>` blocks for your base/desktop layout. Outlook and several other major clients strip or ignore them. Always set default styles inline via MJML component props.
:::

MJML breaks this rule for column widths: it puts them in a `min-width` media query, so a multi-column section stacks in any client that drops that query — GMX and Web.de, for example. See [Column Widths Must Be Inline](./6-layout-patterns.md#column-widths-must-be-inline).

Media queries, registered via [`registerStyles`](./5-customization.md#registering-responsive-styles), serve as **progressive enhancement** for mobile and responsive behavior. Clients that support media queries also support modern CSS, so properties like `flex` and CSS custom properties are safe to use inside them. Because inline styles take precedence over `<style>` blocks, responsive overrides must use `!important` to take effect. See [Adding Custom Responsive Styles](./5-customization.md#adding-custom-responsive-styles) for details.

## MJML Components vs HTML Components

### Ending Tags

Some MJML components are [**ending tags**](https://documentation.mjml.io/#ending-tags) — they accept HTML content as children but **cannot** contain other MJML components. The most common ending tags are `mj-text`, `mj-button`, `mj-table`, and `mj-raw`.

Once you enter an ending tag, you are in **HTML-land for the entire subtree**. No MJML components can be used at any nesting depth within that subtree. Everything inside `MjmlText`, for example, is treated as raw HTML by the MJML engine. You can use HTML elements like `<span>`, `<a>`, `<table>`, `<tr>`, and `<td>`, but you cannot nest another `MjmlText` or `MjmlSection` inside it.

When you need to drop into raw HTML outside of a text context — for example, to build a custom table layout — use `MjmlRaw` (or `MjmlTable` for table shorthand). These are escape hatches for cases where MJML components can't achieve the desired layout, and should generally be a last resort.

`@dextinity/mail-react` provides both MJML-level and HTML-level text components to work across this boundary. See [Theme & Base Components](./2-components-and-theme.md#text) for all available text components and their usage.

## Common Pitfalls

### Start Raw Content Inside a Column With `<tr>`

`mj-column` wraps every child in its own `<tr><td>` — except `MjmlRaw` content, which goes straight into the column's table unwrapped. A `<table>`, `<div>`, or `<img>` in that position ends up outside the column's table instead, and MJML reports no error. This covers the `Html*` components. Open with a `<tr>` and put your markup in a `<td>`:

```tsx
<MjmlColumn>
    <MjmlRaw>
        <tr>
            <td>{/* your raw markup */}</td>
        </tr>
    </MjmlRaw>
</MjmlColumn>
```

`HtmlText` is the exception: it renders the `<td>` itself, so a surrounding `<tr>` is all it needs — unless its `element` prop renders something else, which needs a `<td>` again. `MjmlDivider` supplies both the row and the cell — use it instead of a hand-wrapped `HtmlDivider` whenever you are in an `MjmlColumn`.

The rule applies to `MjmlColumn` and `MjmlHero`. `MjmlSection` and `MjmlWrapper` already place their children inside a shared cell, so any root element is safe there.

### Avoid Block-Level HTML Elements Inside Ending Tags

Don't use `<p>`, `<h1>`, `<h2>`, or other block-level HTML elements inside ending tags. They have wildly inconsistent default margins and spacing across email clients and add no rendering value in email HTML. Instead, use `<td>`, `<div>`, and `<span>` for structure, and build your typography hierarchy through `MjmlText`/`HtmlText` [text variants](./2-components-and-theme.md#variants) rather than HTML semantics. If a block-level element is truly unavoidable, always reset its margins explicitly with inline styles (e.g., `style={{ margin: 0 }}`).

### Set `mso-line-height-rule: exactly` for Manual HTML

Outlook calculates line-height using its own rules, which can cause unexpected vertical spacing. When setting `line-height` on raw HTML elements inside ending tags, also set `mso-line-height-rule: exactly` as an inline style to force Outlook to respect your value. `HtmlText` and the built-in MJML components handle this automatically — this only applies to manually written HTML inside `MjmlRaw` or similar escape hatches.

### No CSS `background-image` in Outlook

Classic Outlook ignores the CSS `background-image` property entirely. If your design uses background images, you need a [VML](https://learn.microsoft.com/en-us/windows/win32/vml/web-workshop---specs---standards----introduction-to-vector-markup-language--vml-)-based workaround for Outlook support, or accept graceful degradation by always providing a `background-color` fallback. Campaign Monitor's [Bulletproof Background Images](https://www.backgrounds.cm/) generator can help produce the necessary VML markup.

### No CSS `border-radius` in Outlook

Classic Outlook ignores CSS `border-radius` entirely — rounded corners on buttons, containers, or any other element render as sharp rectangles.

`MjmlImage` and `HtmlImage` handle images for you, as long as `width` and `height` are given in pixels and `borderRadius` is a single pixel value or `"50%"`. Other values — a percentage width, `1em`, `16px 4px` — leave the image square in Outlook.

Everything else, buttons and containers included, needs a [VML](https://learn.microsoft.com/en-us/windows/win32/vml/web-workshop---specs---standards----introduction-to-vector-markup-language--vml-) (Vector Markup Language) `v:roundrect` written by hand, inside a conditional comment. Give the shape a fixed pixel `width` and `height` — it cannot be fluid:

```html
<!--[if mso]>
    <v:roundrect
        xmlns:v="urn:schemas-microsoft-com:vml"
        arcsize="18%"
        stroked="f"
        style="width:200px;height:44px;"
    >
        <center>Button label</center>
    </v:roundrect>
<![endif]-->
```

Set `arcsize` to the corner radius divided by the shorter side, capped at `50%` — `8px` on a `44px`-high button gives `18%`. Do not take the value from the VML specification; it is twice what Outlook needs.

Campaign Monitor's [Bulletproof Email Buttons](https://www.buttons.cm/) generator and the [Litmus VML button snippet](https://litmus.com/community/snippets/7-bulletproof-button-vml-approach) are good starting points for this technique.

### No CSS `calc()`

Yahoo Mail (webmail and both mobile apps) and Outlook.com drop every declaration whose value contains a `calc()`, single-unit expressions such as `calc(300px - 200px)` included. The declaration disappears, so the element keeps the value the `calc()` was meant to override — a plausible wrong width rather than no width, which makes the defect hard to recognize.

Where an element has to fill the space next to a fixed-width one, let the table compute the width: the fixed cells get their pixel width, and the flexible cell gets `width="100%"`, so the table gives it whatever the fixed cells leave — [Good Email Code](https://www.goodemailcode.com/email-code/columns.html) has the markup. It needs no arithmetic and holds in every client, classic Outlook included.

Where a `calc()` is unavoidable, put a plain value before it in the same rule. A client that drops the `calc()` keeps the first declaration:

```css
.fluidColumn {
    width: 40% !important;
    width: calc(100% - 192px) !important;
}
```

Choose that fallback so the row still fits at the narrowest viewport the media query covers, otherwise the columns wrap. The [asymmetric two-column layout](./6-layout-patterns.md#two-breakpoint-responsive-behavior) uses this fallback.

### `height` Becomes `min-height` in Yahoo Mail

Yahoo Mail rewrites `height` into `min-height`. `min-height` is only a lower limit — it can make an element taller, never shorter — and on a `<td>` it does nothing at all. That leads to two failures:

- An `<img>` that a media query shrinks with `height` keeps its original size. Use `max-height` instead.
- A row whose height comes only from `height` on a `<td>` collapses to nothing, and the cell's background disappears with it. Put the height on a `<div>` inside the cell, or use padding.
