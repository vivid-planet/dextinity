---
title: Environment variables in the site
---

In Dextinity, the Next.js site application is built once during CI and the resulting build artifact is reused across multiple environments (e.g., staging and production).
This means environment variables that are evaluated at build time will have the same values in all environments.

Using `process.env` on the server side (e.g., in Server Components, Route Handlers, or middleware) is fine, since those values are read at runtime.
However, the following patterns are **not supported**:

## `process.env.NEXT_PUBLIC_*` variables are not supported

Next.js embeds `NEXT_PUBLIC_*` environment variables into the client bundle **at build time**.
Since the build happens once in CI, the values from the CI environment would be baked into the bundle for all environments.
This means staging and production would share the same values, which is incorrect.

**Use site configs or a custom provider instead.**
Dextinity provides a site config mechanism that allows you to pass environment-specific configuration at runtime.

## `process.env.*` in the Next.js config file is not supported

The Next.js configuration file is evaluated at build time.
Any `process.env.*` access that is evaluated during the build reads values from the CI build environment, not from the target deployment environment.
This means configuration that varies between environments (e.g., API URLs, feature flags) cannot be reliably set via `process.env` in the Next.js config.

**Move environment-specific configuration to site configs or runtime configuration.**
