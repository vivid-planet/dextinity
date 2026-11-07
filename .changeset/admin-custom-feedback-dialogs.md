---
"@dextinity/admin": minor
---

Allow rendering the router's unsaved-changes dialog, the error dialog, and snackbar fallbacks with other components

- `useRouterConfirmationDialog` takes over the unsaved-changes dialog of `RouterPrompt`s: while a component calls it, the built-in `RouterConfirmationDialog` isn't shown, and the component renders the dialog from the returned state (`open`, `message`, `showSaveButton`, `onSave`, `onDiscard`, `onCancel`).
- `useErrorDialogState` returns the error that `useErrorDialog` and `createErrorDialogApolloLink` show, for rendering it instead of `ErrorDialogHandler`.
- `useOptionalSnackbarApi` returns the snackbar API, or `undefined` outside a `SnackbarProvider`.
