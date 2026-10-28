---
title: Libraries and techniques
sidebar_position: -5
---

## General

We have many different projects, and usually several people work on one project. Therefore, it is important that we have a as uniform environment as possible where one can quickly find their way around.

This also applies to the selection of libraries and technologies. There are several reasons for this:

- For a specific feature, there should ideally be one go-to solution, not a separate solution in every project (e.g., 10 different date-picker libraries in 10 projects).
- By using established go-to solutions, existing know-how can be reused.
- Island solutions that no one can continue working on when the responsible person is unavailable (e.g., on vacation) should be avoided.

We are still fundamentally open to new technologies and libraries. However, the decision whether to use a new technology or library should ideally be made generally, not within the project.

This does not mean that no new npm packages may be used, but rather refers to “larger” things. Such far-reaching decisions should be well evaluated and coordinated with the architects.

### Examples

- A developer wants to use RxJS in a project because he knows it from his old company. RxJS is fundamentally different in programming paradigm from what we are used to.

:::note
Here, coordination with the architects should take place.
:::

- A developer wants to use clsx in a project to build the className prop. Using this package is simple and does not have far-reaching effects.

:::note
Coordination is not necessarily required here. However, it does not hurt either.
:::

## 3rd Party NPM Packages

Using 3rd-party npm packages carries some risks:

- Potential security vulnerabilities that attackers can exploit.
- Incompatibilities that prevent or complicate updates (e.g., a library is not compatible with a newer React version).
- Impact on bundle size (JS that must be downloaded by the browser, mainly in the frontend).

The selection of a package should consider the following criteria:

- Is the package long-lived?
    - How long has the package existed?
    - Are there multiple independent contributors?
- Is the package actively maintained?
    - Have there been new versions in recent months?
    - Are there regular commits in the default branch?
    - Are open issues answered/handled?
- Is the package compatible with our stack?
- Do we already have a go-to solution for the feature (e.g., [Swiper](https://swiperjs.com/) for image sliders)?
- How does the package affect the bundle size?
- Does the npm package have known vulnerabilities (CVEs)?
- Does the npm package have an open source license?

### Further Links

- Guide for choosing an npm package: [How to Choose the Right NPM Package for Your Project](https://medium.com/better-programming/how-to-choose-the-right-npm-package-for-your-project-c3d1cc25285e)
- Determine package size: [Bundlephobia | Size of npm dependencies](https://bundlephobia.com/)
- Identify known vulnerabilities of a package: [Snyk Vulnerability Database | Snyk](https://security.snyk.io/)
