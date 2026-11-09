---
"@dextinity/cms-admin": minor
---

Allow choosing the fallback image for invalid licenses before blocking is activated

The DAM's "Settings" action is now shown whenever the license feature is enabled, not only when `blockFilesWithInvalidLicense` is set.
This allows editors to prepare the fallback image before blocking files with invalid licenses is activated.
While blocking is disabled, the settings page shows a notice that the fallback image isn't used yet and that the website administrator needs to be contacted to activate it.
