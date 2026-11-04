---
title: Accessibility
---

Comet projects aim to conform to [WCAG 2.1 Level AA](https://www.w3.org/TR/WCAG21/).

## POUR Principles

- **Perceivable:** Provide text alternatives, captions, and sufficient contrast.
- **Operable:** All functionality must be keyboard accessible.
- **Understandable:** Use predictable behavior, clear instructions, and helpful error messages.
- **Robust:** Ensure content works with a wide range of devices and assistive technologies.

## Key Rules

- Use semantic HTML (`<nav>`, `<main>`, `<button>`, `<label>`, etc.).
- Color contrast: at least **4.5:1** for normal text, **3:1** for large text.
- All interactive elements must be keyboard operable with visible focus indicators.
- Images need meaningful `alt` text; use `alt=""` for decorative images.
- Associate form inputs with `<label>` (or `aria-label` / `aria-labelledby`).
- Respect `prefers-reduced-motion`; avoid autoplay animations for users who have requested reduced motion.
