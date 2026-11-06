---
"@dextinity/cms-admin": major
---

Build the image, SVG, video and file download blocks and their file field with `@dextinity/ui`

`FileField`, the file card of the blocks, shows the file's preview, name and path with `@dextinity/ui` components and offers "Replace" next to "Empty". The file picker opens the folder of the chosen file.

**Breaking changes**

- The `menuActions` of `FileField` are the props of a `MenuItem` from `@dextinity/ui`, or `MenuItem` elements from `@dextinity/ui`: `label` is a string instead of a `ReactNode`, and MUI `MenuItem` elements aren't supported anymore.

    ```tsx
    menuActions={[
        {
            label: intl.formatMessage({ id: "image.crop", defaultMessage: "Crop image" }),
            icon: <Icon name="crop" />,
            onClick: openCropDialog,
        },
    ]}
    ```

- `FileField` shows an error at the field instead of a snackbar when the chosen files can't be loaded.
- `EditImageDialog` is a `Dialog` from `@dextinity/ui`. Its props are unchanged.
- The video block shows the warning about large videos as a `Banner` from `@dextinity/ui`; the file download link block chooses how the file is opened with a `SelectField` from `@dextinity/ui-react-final-form`.

**New**

- `DamFilePickerDialog` has an `initialFolderId` to open a folder, `null` for the root. Without it, the dialog opens the folder of the first of `initialFileIds`.
- `damFileFieldFragment` includes the file's `folder { id }`.
