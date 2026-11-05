---
"@dextinity/admin": major
"@dextinity/admin-generator": major
"@dextinity/brevo-admin": major
"@dextinity/cms-admin": major
---

Require Apollo Client v4

Update `@apollo/client` to v4 and add `rxjs`, which Apollo Client v4 requires as a peer dependency:

```sh
npm install @apollo/client@^4.3.5 rxjs@^7.8.2
```

The APIs that accept an `ApolloClient` or pass Apollo errors to your code use the Apollo Client 4 types now: `ApolloClient` has no type parameter, and errors are typed as `ErrorLike` instead of `ApolloError`.

The Admin Generator imports the React hooks from `@apollo/client/react`. Regenerate your files after updating.

See the [migration guide](https://cms-docs.dextinity.com/docs/migration-guide/migration-from-v10-to-v11) for the required changes.
