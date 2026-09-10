---
description: Which browsers we support and how to decide if a modern feature can be used
applyTo: "**/*.ts,**/*.tsx,**/*.js,**/*.jsx,**/*.css,**/*.scss,**/*.html"
paths:
    - "**/*.{ts,tsx,js,jsx}"
    - "**/*.{css,scss}"
    - "**/*.html"
globs:
    - "**/*.{ts,tsx,js,jsx}"
    - "**/*.{css,scss}"
    - "**/*.html"
alwaysApply: false
---

# Browser Support Rules

Everything we build for the web must work in these browsers:

- Chrome and other Chromium based (Edge, Opera, ...)
- Firefox and other Gecko based
- Safari for macOS and iOS

## Modern features

- Verify features via [caniuse.com](https://caniuse.com) against **All Users / Europe**.
- **Site / frontend**: ≥93% usage → free to use. 90–93% → only if basic functionality still works without the feature; minor visual/behavioral degradation is acceptable. Below that → check with a stylist.
- **Admin**: anything supported by the current version of the browsers above can be used.
- HTML emails are not browsers — email clients support far less. For emails, follow the `dextinity-mail-react` skill instead.
