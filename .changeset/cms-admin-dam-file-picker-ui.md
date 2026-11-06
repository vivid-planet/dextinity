---
"@dextinity/cms-admin": major
---

Choose files from the assets in a dialog built with `@dextinity/ui`

The new `DamFilePickerDialog` shows the folder tree and the files as in the asset finder (`DamFinderPage`), for one file or, with `multiple`, several files from different folders, filtered by `allowedMimetypes`. A search finds files across all folders and shows where each one is; its path opens the folder. The folder tree can be resized, and the width is remembered. Files can be uploaded into the open folder and are then selected. It doesn't depend on the old asset manager (`DamPage`) anymore.

`ChooseDamFileDialog` and `ChooseDamFilesDialog` render it and are deprecated:

- Their `onClose` is called without arguments; the `event` and `reason` of the MUI dialog are gone.
- The dialog remembers the last folder per scope instead of the route of the old asset manager. The search shows the first 100 matching files.
- `FileField` (MUI) keeps working and opens the new dialog.

**New**

- `DamFileField`: the field for forms built with `@dextinity/ui-react-final-form`. It shows the file's thumbnail, name, format and size, opens the picker and clears with a button. Its value is a `GQLDamFileFieldFileFragment`, or a list of them with `multiple`.

```tsx
<DamFileField name="image" label={intl.formatMessage({ id: "teaser.image", defaultMessage: "Image" })} allowedMimetypes={["image/jpeg", "image/png"]} />
<DamFileField name="attachments" label={intl.formatMessage({ id: "teaser.attachments", defaultMessage: "Attachments" })} multiple />
```
