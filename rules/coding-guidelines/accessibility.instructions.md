---
description: WCAG 2.1 AA rules for site UI (semantics, contrast, keyboard, ARIA, zoom, motion)
applyTo: "**/site/**/*.tsx,**/site/**/*.jsx,**/site/**/*.sc.ts,**/site/**/*.css,**/site/**/*.scss"
paths:
    - "**/site/**/*.{tsx,jsx}"
    - "**/site/**/*.sc.ts"
    - "**/site/**/*.{css,scss}"
globs:
    - "**/site/**/*.{tsx,jsx}"
    - "**/site/**/*.sc.ts"
    - "**/site/**/*.{css,scss}"
alwaysApply: false
---

# Accessibility Rules

The site must conform to [WCAG 2.1 Level AA](https://www.w3.org/TR/WCAG21/): perceivable, operable, understandable, robust.

## Key rules

- Use semantic HTML (`<nav>`, `<main>`, `<button>`, `<label>`, …). Never a clickable `<div>` / `<span>` where a `<button>` or `<a>` fits.
- Color contrast: at least **4.5:1** for normal text, **3:1** for large text.
- Don't use color as the only way to convey information (links in text, states, error messages).
- All interactive elements must be keyboard operable and have a visible focus indicator. Don't remove `outline` without a replacement.
- Provide a skip link that lets keyboard users skip the main navigation.
- Dialogs: trap focus inside while open and return it to the opening element on close. A native `<dialog>` opened with `showModal()` does both.
- Images need meaningful `alt` text; use `alt=""` for decorative images.
- Associate every form input with a `<label>` (or `aria-label` / `aria-labelledby`).
- Use ARIA only when semantic HTML can't express the meaning, and use it correctly — e.g. `aria-label` on icon-only buttons, `aria-expanded` on accordion triggers.
- Content must stay usable at 200% zoom. At a 320 px viewport width the page must not scroll horizontally, except for content that needs two dimensions (maps, data tables).
- Respect `prefers-reduced-motion`; don't autoplay animations for users who requested reduced motion.

## Testing

- Verify new UI with the keyboard only and at a 320 px viewport width (e.g. via Playwright).
- Automated checks (e.g. Lighthouse) find only some issues. Ask the user to also test with a screen reader (VoiceOver, NVDA) and a simulated color vision deficiency.
