---
"@dextinity/site-react": minor
"@dextinity/site-nextjs": minor
---

Add `filterByFragment` to remove fields not selected by a fragment

Use it in a Server Component before passing GraphQL data to a Client Component, so fields the component doesn't need aren't serialized into the RSC payload.

```tsx
import { filterByFragment } from "@dextinity/site-nextjs/server";

<Breadcrumbs {...filterByFragment<GQLBreadcrumbsFragment>(breadcrumbsFragment, data.pageContent)} />;
```

`graphql` is now a peer dependency of both packages.
