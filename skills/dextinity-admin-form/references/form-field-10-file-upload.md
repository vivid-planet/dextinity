# FileUpload Fields

**Default: Always use `FinalFormFileUploadDownloadable` fragment** for all file upload fields. This enables image previews and download URLs. Only fall back to `FinalFormFileUpload` when explicitly requested or when files are guaranteed to never be images (e.g. CSVs, XML imports).

## Single file

```tsx
<FileUploadField
    name="certificate"
    label={<FormattedMessage id="<entityName>.certificate" defaultMessage="Certificate" />}
    variant="horizontal"
    fullWidth
/>
```

- Import `FileUploadField` from `@dextinity/cms-admin`
- `FormValues` type: `certificate: GQLFinalFormFileUploadDownloadableFragment | null`
- GQL fragment: `certificate { ...FinalFormFileUploadDownloadable }`
- Import fragment: `import { finalFormFileUploadDownloadableFragment } from "@dextinity/cms-admin"`
- `handleSubmit` output: `certificate: formValues.certificate ? formValues.certificate.id : null` (the input field has the same name as the relation)

## Multiple files

```tsx
<FileUploadField
    name="photos"
    label={<FormattedMessage id="<entityName>.photos" defaultMessage="Photos" />}
    variant="horizontal"
    fullWidth
    multiple
    layout="grid"
/>
```

- `FormValues` type: `photos: GQLFinalFormFileUploadDownloadableFragment[]`
- GQL fragment: `photos { ...FinalFormFileUploadDownloadable }`
- Import fragment: `import { finalFormFileUploadDownloadableFragment } from "@dextinity/cms-admin"`
- `handleSubmit` output: `photos: formValues.photos.map(({ id }) => id)`
- Use `layout="grid"` for a visual grid of image thumbnails

## Fragment choice

| Fragment                          | When to use                                                   |
| --------------------------------- | ------------------------------------------------------------- |
| `FinalFormFileUploadDownloadable` | **Default** — use for all file uploads                        |
| `FinalFormFileUpload`             | Only when no preview or download is needed (e.g. CSV imports) |

Both fragments work with single and multiple file uploads — the choice is about preview, not cardinality.

## Rules

- Import `FileUploadField` from `@dextinity/cms-admin`
- Import `GQLFinalFormFileUploadDownloadableFragment` from `@dextinity/cms-admin` for type overrides (default)
- The form shell needs a local type override for `FormValues` to replace the GQL fragment types with the FileUpload fragment types (see [form-00-shell.md](form-00-shell.md))
- Only import `finalFormFileUploadDownloadableFragment` when the entity has FileUpload fields
- Always use the `FinalFormFileUploadDownloadable` fragment unless there is a specific reason not to
