---
"@dextinity/cms-admin": minor
---

Build the dialogs of the asset upload with `@dextinity/ui`

The progress of an upload, the choice for duplicate filenames (skip, replace, or upload as copy), and the list of files that couldn't be uploaded are shown in the dialogs of `@dextinity/ui`, in the asset finder, the file picker, and the old asset manager alike. The warning about very large videos is a toast instead of a MUI snackbar, so it no longer needs the `SnackbarProvider`.
