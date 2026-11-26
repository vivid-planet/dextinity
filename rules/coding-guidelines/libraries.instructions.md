---
description: Criteria for adding or replacing npm packages
applyTo: "**/package.json"
paths:
    - "**/package.json"
globs:
    - "**/package.json"
alwaysApply: false
---

# Libraries & Techniques Rules

- Use the go-to solution the project already has (e.g. Swiper for sliders, MUI for admin UI, the project's styling solution). Never add a second library that overlaps with an existing one, such as a different date picker.
- Don't decide on "large" additions yourself (new paradigms like RxJS, a new ORM or state library). Propose them to the user, who coordinates with the architects. Small, non-invasive utilities like `clsx` are fine.
- Before adding a package, check that it is maintained, has existed for a while, fits our stack's versions, has an open-source license, no known CVEs ([security.snyk.io](https://security.snyk.io/)), and, in the frontend, a reasonable bundle size ([bundlephobia.com](https://bundlephobia.com/)). If it falls short, pick another or justify it in the PR description.
