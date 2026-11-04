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

## Before adding a dependency

- Check if there is already a go-to solution in the repo (e.g. Swiper for sliders, MUI for admin UI, Emotion/styled-components for styling). Use it instead of introducing a parallel library.
- For "large" decisions (new paradigms like RxJS, new ORM, new state lib), do **not** decide inside a single project — coordinate with the architects first.
- Small, non-invasive utilities (e.g. `clsx`) can be added without coordination, but the checks below still apply.

## Evaluation checklist for a new npm package

Before adding, verify:

- **Maintenance**: recent releases, regular commits on default branch, issues getting attention.
- **Longevity**: how long has it existed, multiple independent maintainers.
- **Compatibility**: works with our stack (React/Next/Nest/MikroORM/TS versions in use).
- **Bundle impact** (frontend): check [bundlephobia.com](https://bundlephobia.com/). Prefer tree-shakeable packages.
- **Vulnerabilities**: check [security.snyk.io](https://security.snyk.io/) for known CVEs.
- **License**: must be a recognized open-source license compatible with the product.

If a package fails any of these, either pick another or flag it explicitly in the PR description with justification.

## Duplication risk

Do not introduce a second library that overlaps with an existing one (e.g. a different date-picker when one already exists). Consolidate instead.
