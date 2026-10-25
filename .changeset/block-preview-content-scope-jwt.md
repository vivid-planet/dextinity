---
"@dextinity/cms-admin": minor
---

Add `contentScopeJwt` to `BlockPreview`, `SplitPreview` and `BlockPreviewWithTabs`

The block preview loads the JWT that the site's preview receives through the `blockPreviewJwt` query. An admin without the GraphQL API can pass the JWT instead, the query is skipped then.
