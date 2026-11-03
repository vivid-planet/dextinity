---
"@dextinity/api-generator": patch
---

Keep `generate --watch` running when generating a changed entity fails

Previously, the failure caused an unhandled promise rejection that terminated the watcher instead of logging the error.
