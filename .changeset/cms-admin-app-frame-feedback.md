---
"@dextinity/cms-admin": minor
---

Show the app-wide feedback of `AppFrame` with `@dextinity/ui`

`AppFrame` now includes:

- the errors of `useErrorDialog` and `createErrorDialogApolloLink` in a `Dialog`: remove `ErrorDialogHandler` from the app when using `AppFrame`
- the unsaved-changes dialog of `RouterPrompt`s (forms, editors) as a `ConfirmDialog`, in place of the MUI `RouterConfirmationDialog`
- app-wide toasts: show one with `useShowAppToast`, the successor of the MUI `SnackbarProvider` for new pages. Without an `AppToastsProvider` (which `AppFrame` includes), it falls back to a snackbar of the `SnackbarProvider`, so `useSaveConflict`, `useSaveConflictQuery` and `useFormSaveConflict` keep working in MUI apps
- an "About" entry in the user menu, showing version and build information
- `topBarActions` for app-wide status and actions in the top bar, e.g. `BuildEntry`

```tsx
<AppFrame {...frameProps} topBarActions={<BuildEntry />}>
    <AppMasterMenuRoutes />
</AppFrame>
```
