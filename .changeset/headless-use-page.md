---
"@dextinity/cms-admin": major
---

Build the save conflict dialog and the page save button of `createUsePage` with `@dextinity/ui`

The hook returned by `createUsePage` now also returns `saveState` and `savedAt` for `SaveState` and `rootBlocksValidity` to mark invalid root blocks, e.g. in the editor's tabs.
`useSavePageShortcut(handleSavePage, { hasChanges, saving })` saves the page with ⌘S / Ctrl+S when it has unsaved changes.

**Breaking changes**

- `pageSaveButton` is a `Button` of `@dextinity/ui` instead of the MUI `SaveButton` and is deprecated. Build the save action from `handleSavePage`, `hasChanges` and `saving` instead.
- The save conflict dialog of `createUsePage`, `useSaveConflict`, `useSaveConflictQuery` and `useFormSaveConflict` is a `ConfirmDialog` of `@dextinity/ui`. It renders outside the MUI theme, so the application must load the styles of `@dextinity/ui`.
