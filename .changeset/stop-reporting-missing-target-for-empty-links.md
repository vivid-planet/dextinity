---
"@dextinity/cms-api": patch
---

Stop reporting `missingTarget` for links without a target page

The Admin creates an internal link without a target in every `createLinkBlock` with `allowEmpty: false` (the default) as soon as the parent block is saved, so every optional link produced a `missingTarget` warning although the site hides the empty link. An empty link is not an error; `InternalLinkBlock` now only reports `invalidTarget` for a link to a deleted page.
