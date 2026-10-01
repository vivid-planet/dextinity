---
"@dextinity/cms-api": minor
---

Describe blocks whose purpose isn't obvious from their name and fields

`RichText` and `TipTapRichText` now carry a description that says which rich text editor they use, since an application typically has both and their fields look alike. `Seo` carries a description of the fields it bundles (title, description, social preview, sitemap settings, canonical URL), since "Seo" alone doesn't say which of those it covers.

The description reaches an application through `block-meta.json` and the generated block interfaces.
