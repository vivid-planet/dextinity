# Grid Feature: Responsive Columns

Use `visible` with `theme.breakpoints` to show/hide columns based on screen size. Pair an overview column (for small screens) with individual columns (for larger screens).

## Template

```tsx
const theme = useTheme();

const columns: GridColDef<GQLEntitiesGridFragment>[] = useMemo(
    () => [
        {
            field: "overview",
            headerName: intl.formatMessage({ id: "entity.overview", defaultMessage: "Overview" }),
            filterable: false,
            renderCell: ({ row }) => (
                <GridCellContent
                    primaryText={row.title ?? "-"}
                    secondaryText={
                        <FormattedMessage
                            id="entity.overview.secondaryText"
                            defaultMessage="{price} - {type}"
                            values={{
                                price: typeof row.price === "number" ? <FormattedNumber value={row.price} style="currency" currency="EUR" /> : "-",
                                type: row.type ?? "-",
                            }}
                        />
                    }
                />
            ),
            flex: 1,
            visible: theme.breakpoints.down("md"),
            disableExport: true,
            sortBy: ["title", "price", "type"],
            minWidth: 200,
        },
        {
            field: "title",
            headerName: intl.formatMessage({ id: "entity.title", defaultMessage: "Title" }),
            flex: 1,
            visible: theme.breakpoints.up("md"),
            minWidth: 200,
        },
        {
            field: "price",
            headerName: intl.formatMessage({ id: "entity.price", defaultMessage: "Price" }),
            type: "number",
            // ...
            visible: theme.breakpoints.up("md"),
            minWidth: 150,
        },
    ],
    [intl, theme],
);
```

## Visibility Options

- `theme.breakpoints.up("md")` — visible on md and larger
- `theme.breakpoints.down("md")` — visible below md
- `theme.breakpoints.only("sm")` — visible only on sm
- `theme.breakpoints.between("sm", "md")` — visible between sm and md
- `visible: false` — always hidden (e.g. audit timestamps)

## Overview Column Rules

- `filterable: false` — overview columns cannot be filtered
- `disableExport: true` — exclude from excel export (individual columns export instead)
- `sortBy: [...]` — array of actual field names this virtual column can sort by
- Uses `GridCellContent` for rich rendering with `primaryText` and `secondaryText`
- Requires `useTheme()` import from `@mui/material` and `theme` in `useMemo` deps
