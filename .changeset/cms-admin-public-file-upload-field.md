---
"@dextinity/cms-admin": minor
---

Add `PublicFileUploadField` and export `RouterTabLink`

`PublicFileUploadField` is the field for forms built with `@dextinity/ui-react-final-form` to upload files to the API's public file uploads (`FileUploadsModule`), replacing `FileUploadField` (MUI) on `@dextinity/ui` pages. Its value is a `GQLFinalFormFileUploadFragment` or `null`, or a list of them with `multiple`, so existing queries and mutations keep working.

```tsx
<PublicFileUploadField name="priceList" label={intl.formatMessage({ id: "product.priceList", defaultMessage: "Price list" })} maxSize={4 * 1024 * 1024} />
<PublicFileUploadField name="datasheets" label={intl.formatMessage({ id: "product.datasheets", defaultMessage: "Datasheets" })} multiple />
```

`RouterTabLink` is the `tab` slot of the `Tabs` of `@dextinity/ui` for tabs that are routes: `<Tabs items={[{ value: "price", label, href: `${url}/price` }]} slots={{ tab: RouterTabLink }} … />`.
