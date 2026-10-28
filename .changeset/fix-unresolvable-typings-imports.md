---
"@dextinity/admin": patch
"@dextinity/cms-api": patch
---

Fix unresolvable imports in the published type declarations

Some declaration files imported other modules through the package's `baseUrl` (e.g., `helpers/ThemedComponentBaseProps` or `src/warnings/dto/warning-data`), which can't be resolved in consuming projects, causing these types to become `any`.
