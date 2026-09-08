# Column: FileUpload

## Image (single FileUpload known to be an image)

**Important:** FileUpload `imageUrl` returns a **relative** path (e.g. `/file-uploads/hash/id/timeout/resizeWidth/filename`). You must prepend the API URL using `useCometConfig()` from `@comet/cms-admin`.

```tsx
import { useCometConfig } from "@comet/cms-admin";

const { apiUrl } = useCometConfig();

{
    field: "preview",
    headerName: intl.formatMessage({ id: "product.preview", defaultMessage: "Preview" }),
    sortable: false,
    filterable: false,
    width: 80,
    renderCell: ({ row }) => {
        if (!row.preview?.imageUrl) return null;
        return (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", py: 0.5 }}>
                <img
                    src={`${apiUrl}${row.preview.imageUrl}`}
                    alt=""
                    style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain", borderRadius: 4 }}
                />
            </Box>
        );
    },
}
```

GQL fragment: `preview { id imageUrl(resizeWidth: 80) }`

Add `apiUrl` to the `useMemo` dependency array for columns.

## Document / array of files

```tsx
{
    field: "datasheets",
    headerName: intl.formatMessage({ id: "product.datasheets", defaultMessage: "Datasheets" }),
    width: 160,
    sortable: false,
    valueGetter: (value) => value?.map((f: { name: string }) => f.name).join(", "),
}
```

GQL fragment: `datasheets { name }`

## DAM Image (`DamImageBlockData` / block field)

DAM Image block fields store their data as a JSON block. To render a preview in the grid, access the first attached block's `damFile.fileUrl`. Unlike FileUpload, DAM file URLs are **absolute** and do not need the `apiUrl` prefix.

```tsx
{
    field: "images",
    headerName: intl.formatMessage({ id: "product.images", defaultMessage: "Images" }),
    sortable: false,
    filterable: false,
    width: 80,
    renderCell: ({ row }) => {
        const damFile = row.images?.attachedBlocks?.[0]?.props?.damFile;
        if (!damFile?.fileUrl) return null;
        return (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", py: 0.5 }}>
                <img
                    src={damFile.fileUrl}
                    alt=""
                    style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain", borderRadius: 4 }}
                />
            </Box>
        );
    },
}
```

GQL fragment: Include the block field name directly (e.g. `images`) — the block JSON is returned as-is.

## Rules

- Ask the user whether a FileUpload field is an image or a document to pick the right variant
- Use `sortable: false` and `filterable: false` for all file upload and image columns
- **FileUpload `imageUrl` is relative** — always prepend `apiUrl` from `useCometConfig()`
- **DAM Image `fileUrl` is absolute** — use directly without prefix
- Add `apiUrl` to the columns `useMemo` dependency array when using FileUpload image columns
