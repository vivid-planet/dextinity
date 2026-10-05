---
"@dextinity/admin": major
"@dextinity/admin-color-picker": major
"@dextinity/admin-date-time": major
"@dextinity/admin-generator": major
"@dextinity/admin-rte": major
"@dextinity/brevo-admin": major
"@dextinity/cms-admin": major
---

Require `react-intl` v12

Older `react-intl` versions declare a peer dependency on TypeScript 5, which blocks the update to TypeScript 6.

`react-intl` v12 requires React 18 or later, so the admin packages drop support for React 16 and 17.

`react-intl` v12 types messages created with `defineMessage` or `defineMessages`: without a type parameter, a message accepts no values. Declare the values of messages that take any:

```ts
const headingMessage = defineMessage<{ level: number }>({ id: "heading", defaultMessage: "Heading {level}" });
```

`messages.networkError` and `messages.unknownError` from `@dextinity/admin` are typed accordingly and require the `strong` tag as value.

See the [migration guide](https://cms-docs.dextinity.com/docs/migration-guide/migration-from-v10-to-v11) for all required changes.
