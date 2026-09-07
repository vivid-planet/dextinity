---
"@dextinity/brevo-api": patch
---

Replace `axios` with the native `fetch` API when requesting the email campaign content from the frontend

This removes the `@nestjs/axios` and `axios` dependencies from the package.
