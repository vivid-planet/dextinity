---
"@dextinity/site-nextjs": minor
"@dextinity/site-react": minor
---

Add `@dextinity/site-nextjs/intl` to translate in server and client components

`react-intl` can't be imported in server components because it creates a React context.
`FormattedMessage` and `useIntl` from `@dextinity/site-nextjs/intl` resolve to a server implementation based on `@formatjs/intl` in server components and to `react-intl` in client components, so the same components can translate in both.
Only `id`, `defaultMessage`, `description` and `values` are supported, as the server implementation doesn't support more.

The server implementation stores the intl per request.
Set it with `setServerIntl` from `@dextinity/site-nextjs/server` in the layout and in every page rendering translated server components, because Next.js renders layouts and pages concurrently and doesn't render the layout again on client-side navigation.
`react-intl` is an optional peer dependency, required when using `@dextinity/site-nextjs/intl`.

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

The server implementation is also available as `setServerIntl`, `useServerIntl` and `ServerFormattedMessage` from `@dextinity/site-react/server`.
