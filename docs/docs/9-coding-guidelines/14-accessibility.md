---
title: Accessibility
---

The site of a Dextinity project aims to conform to [WCAG 2.1 Level AA](https://www.w3.org/TR/WCAG21/).

## POUR Principles

- **Perceivable:** Provide text alternatives, captions, and sufficient contrast.
- **Operable:** All functionality must be keyboard accessible.
- **Understandable:** Use predictable behavior, clear instructions, and helpful error messages.
- **Robust:** Ensure content works with a wide range of devices and assistive technologies.

## Key Rules

- Use semantic HTML (`<nav>`, `<main>`, `<button>`, `<label>`, etc.).
- Color contrast: at least **4.5:1** for normal text, **3:1** for large text.
- Don't use color as the only way to convey information, for example for links in text, states, or error messages.
- All interactive elements must be keyboard operable with visible focus indicators.
- Add a skip link that lets keyboard users skip the main navigation.
- Keep the focus inside an open dialog, and move it back to the element that opened the dialog when it closes. A native `<dialog>` opened with `showModal()` does both.
- Images need meaningful `alt` text; use `alt=""` for decorative images.
- Associate form inputs with `<label>` (or `aria-label` / `aria-labelledby`).
- Use ARIA only when semantic HTML can't express the meaning, and use it correctly. For example, give icon-only buttons an `aria-label`, and set `aria-expanded` on accordion triggers.
- Content must stay usable at 200% zoom. At a viewport width of 320 px, which is 400% zoom on a 1280 px wide screen, the page must not scroll horizontally, except for content that needs two dimensions, such as maps or data tables.
- Respect `prefers-reduced-motion`; avoid autoplay animations for users who have requested reduced motion.

## Testing

Test each new UI manually:

- Use it with the keyboard only.
- Use it with a screen reader, for example VoiceOver on macOS or NVDA on Windows.
- View it at a viewport width of 320 px.
- View it with a simulated color vision deficiency, for example with "Emulate vision deficiencies" in the "Rendering" panel of the Chrome DevTools.

Also run an automated check, for example Lighthouse in the Chrome DevTools. Automated checks find only some of the issues.
