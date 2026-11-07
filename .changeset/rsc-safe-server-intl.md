---
"@dextinity/site-nextjs": major
"@dextinity/site-react": major
---

Add `@dextinity/site-nextjs/intl` to translate in server and client components

`useIntl` and the context-based components of `react-intl` can't be used in server components.
`FormattedMessage` and `useIntl` from `@dextinity/site-nextjs/intl` resolve to a server implementation based on `react-intl/server` in server components and to `react-intl` in client components, so the same components can translate in both.
`FormattedMessage` only supports `id`, `defaultMessage`, `description` and `values`, as the server implementation doesn't support more.

The server implementation stores the intl per request.
Set it with `setServerIntl` from `@dextinity/site-nextjs/server` in the layout and in every page rendering translated server components, because Next.js renders layouts and pages concurrently and doesn't render the layout again on client-side navigation.

`react-intl` v12 is now a peer dependency of `@dextinity/site-nextjs` and `@dextinity/site-react`.

**Example**

```tsx
// src/app/[language]/layout.tsx and every page rendering translated server components
import { setServerIntl } from "@dextinity/site-nextjs/server";

setServerIntl(language, await loadMessages(language));
```

```tsx
// server or client component
import { FormattedMessage } from "@dextinity/site-nextjs/intl";

<FormattedMessage id="productList.title" defaultMessage="Products" />;
```

Projects using `@dextinity/site-react` without `@dextinity/site-nextjs` import `FormattedMessage` and `useIntl` from `@dextinity/site-react/intl` and `setServerIntl` from `@dextinity/site-react/server` instead.
Don't combine imports from both packages: they don't share the per-request intl.
