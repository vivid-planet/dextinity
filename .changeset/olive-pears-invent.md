---
"@dextinity/admin": patch
---

Show the GraphQL error messages in the error dialog again

`createErrorDialogApolloLink` only passed the message of network errors to the `ErrorDialog`.
For GraphQL errors, the dialog showed "Unknown error" instead of the actual messages (e.g., the message of a `BadRequestException` thrown by the API).
