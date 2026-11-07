---
"@dextinity/cms-admin": minor
---

Rebuild `NoContentScopeFallback` with `@dextinity/ui`

The page shown to users without a content scope is an `EmptyState` with the reasons and the way back to the login. It brings its own `Theme`, since it's shown outside the app's frame; pass `colorScheme` to override the default, which follows the operating system's preference.
