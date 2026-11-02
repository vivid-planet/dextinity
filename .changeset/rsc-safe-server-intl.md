---
"@dextinity/site-nextjs": minor
"@dextinity/site-react": minor
---

Add `setServerIntl`, `useServerIntl` and `ServerFormattedMessage` to translate in server components

`react-intl` can't be imported in server components because it creates a React context.
The new server-only API is based on `@formatjs/intl` and stores the intl per request.
Call `setServerIntl` in the layout and in every page rendering translated server components, because Next.js renders layouts and pages concurrently and doesn't render the layout again on client-side navigation.

Only `id`, `defaultMessage`, `description` and `values` are supported, so the same components can translate on the server and the client.

**Example**

Map a `#intl` subpath import to the server API in server components and to `react-intl` otherwise:

```json
// package.json
"imports": {
    "#intl": {
        "types": "./src/util/intl.d.ts",
        "react-server": "./src/util/intl.server.ts",
        "default": "./src/util/intl.client.ts"
    }
}
```

```ts
// src/util/intl.server.ts and src/util/intl.d.ts
export { ServerFormattedMessage as FormattedMessage, useServerIntl as useIntl } from "@dextinity/site-nextjs/server";

// src/util/intl.client.ts
export { FormattedMessage, useIntl } from "react-intl";
```

```tsx
// src/app/[language]/layout.tsx and every page rendering translated server components
setServerIntl(language, await loadMessages(language));
```

Components then import `FormattedMessage` and `useIntl` from `#intl`.
