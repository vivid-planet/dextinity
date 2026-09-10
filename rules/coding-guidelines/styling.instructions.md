---
description: Theme usage, Emotion/styled-components, responsive, SVG handling
applyTo: "**/*.tsx,**/*.sc.ts,**/*.css,**/*.scss"
paths:
    - "**/*.tsx"
    - "**/*.sc.ts"
    - "**/*.{css,scss}"
globs:
    - "**/*.tsx"
    - "**/*.sc.ts"
    - "**/*.{css,scss}"
alwaysApply: false
---

# Styling / CSS Rules

## Theme

- Styling decisions go through the theme (colors, typography, buttons, spacing, breakpoints, easings). Do **not** hard-code values in components when the theme already defines them.
- Colors: use basic tokens (`primary`, `grey`, …) when the use is generic; define context-specific tokens (`colorUiLabel`, `colorUiLabelHover`) only when a name has real semantic meaning. Don't invent context tokens that are used once.
- Buttons / form elements: define granular tokens (`primaryBg`, `primaryBgHover`, `primaryBorder`, `primaryHeightDesktop`, …) so the theme is reusable across apps.
- Typography: define as CSS-in-JS helpers returning `css\`…\``blocks, including media-query overrides and an optional`disableMargin` parameter.
- Spacing: split into **dynamic** (responsive scale keyed by breakpoint) and **static** (single value) tokens.

## Where styles live

- **No inline `style={{ … }}`.** Use Emotion / styled-components. Name the styled component after its semantic role (`DeleteButton`, not `StyledIconButton`).
- Keep list-level layout (flex/grid/wrap) on the list container, not on item blocks. When the item needs sizing, wrap it in an `Item` inside the list rather than styling the block itself.
- When a component gets complex, extract styles to a `*.sc.ts` sibling file (and GraphQL to `*.gql.ts`). Those files are **private** to the component — do not import them elsewhere.

## CSS layout

- Use CSS Grid and Flexbox for alignment — but only when layout actually requires them. Do not blanket `display: flex` every `div`.

## Browser support

- See [browser-support.instructions.md](browser-support.instructions.md).

## Responsive

- Mobile-first. Write the mobile layout first, then add breakpoint overrides upward.
- For readability, put a blank line before every nested selector / media query inside a styled block.

## SVGs

- Prefer `<svg><use href="/icon.svg#id" /></svg>` — keeps SVGs out of the JS bundle and still allows `currentColor` theming.
- Do **not** import SVGs as React components (`import Icon from "./icon.svg"` → `<Icon />`) for production icons — they inflate the bundle.
- Do **not** use `<img src="icon.svg">` when the icon needs to be styled (e.g. color changes), since `<img>` cannot be manipulated.
