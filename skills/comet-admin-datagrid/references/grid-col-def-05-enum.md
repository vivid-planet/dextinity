# Column: Enum

**Default: Always render enum columns as chips with filterable select** unless the user explicitly requests a different rendering (e.g. static select, plain text).

## With Chip Component + Filter (default)

Enum columns should always be filterable via a select dropdown. Use `type: "singleSelect"` with `valueOptions` derived from the translatable enum's `messageDescriptorMap` using the `messageDescriptorMapToValueOptions` helper, and render a chip component in the cell.

```tsx
import { messageDescriptorMapToValueOptions } from "@src/common/components/enums/messageDescriptorMapToValueOptions/messageDescriptorMapToValueOptions";
import { productStatusMessageDescriptorMap } from "./components/productStatus/ProductStatus";
import { ProductStatusChip } from "./components/productStatusChip/ProductStatusChip";

{
    field: "status",
    headerName: intl.formatMessage({ id: "product.status", defaultMessage: "Status" }),
    type: "singleSelect",
    valueOptions: messageDescriptorMapToValueOptions(productStatusMessageDescriptorMap, intl),
    width: 140,
    renderCell: ({ row }) => <ProductStatusChip value={row.status} />,
}
```

### `messageDescriptorMapToValueOptions` helper

Located at `@src/common/components/enums/messageDescriptorMapToValueOptions/messageDescriptorMapToValueOptions.ts`.

Converts a translatable enum's `messageDescriptorMap` (from `createTranslatableEnum`) into `{ value, label }[]` with string labels suitable for DataGrid `valueOptions`. Takes `(map, intl)` as arguments.

If this helper does not exist in the project yet, create it:

```ts
import { type IntlShape, type MessageDescriptor } from "react-intl";

type ValueOption<T extends string> = {
    value: T;
    label: string;
};

export function messageDescriptorMapToValueOptions<T extends string>(map: Record<T, MessageDescriptor>, intl: IntlShape): Array<ValueOption<T>> {
    return (Object.entries(map) as Array<[T, MessageDescriptor]>).map(([value, descriptor]) => ({
        value,
        label: intl.formatMessage(descriptor),
    }));
}
```

## With Editable Chip (inline status change)

Use an editable chip component when the user wants to change the enum value directly in the grid without opening the edit form. The editable chip handles its own Apollo mutation. Wrap it in a `Box` with `stopPropagation` to prevent row click from triggering navigation.

```tsx
import { Box } from "@mui/material";
import { CuisineChipEditableForRecipe } from "./components/cuisineChipEditableForRecipe/CuisineChipEditableForRecipe";
import { cuisineMessageDescriptorMap } from "./components/cuisine/Cuisine";

{
    field: "cuisine",
    headerName: intl.formatMessage({ id: "recipe.cuisine", defaultMessage: "Cuisine" }),
    type: "singleSelect",
    valueOptions: messageDescriptorMapToValueOptions(cuisineMessageDescriptorMap, intl),
    width: 160,
    renderCell: ({ row }) => (
        <Box onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
            <CuisineChipEditableForRecipe recipeId={row.id} />
        </Box>
    ),
}
```

- The `Box` wrapper with `stopPropagation` on both `onClick` and `onMouseDown` is **required** to prevent the chip click from triggering `onRowClick` navigation
- Use the `comet-admin-enum` skill to create the editable chip component if it doesn't exist
- Keep `type: "singleSelect"` and `valueOptions` so the column remains filterable

## With Static Select (only when user explicitly requests it)

Use `renderStaticSelectCell` only when the user specifically asks for inline labels instead of chips:

```tsx
{
    field: "type",
    headerName: intl.formatMessage({ id: "product.type", defaultMessage: "Type" }),
    type: "singleSelect",
    valueFormatter: (value, row) => row.type?.toString(),
    valueOptions: [
        {
            value: "Cap",
            label: intl.formatMessage({ id: "product.type.cap", defaultMessage: "Cap" }),
            cellContent: (
                <GridCellContent
                    primaryText={<FormattedMessage id="product.type.cap" defaultMessage="Cap" />}
                    icon={<EducationIcon color="primary" />}
                />
            ),
        },
        {
            value: "Shirt",
            label: intl.formatMessage({ id: "product.type.shirt", defaultMessage: "Shirt" }),
        },
        {
            value: "Tie",
            label: intl.formatMessage({ id: "product.type.tie", defaultMessage: "Tie" }),
        },
    ],
    renderCell: renderStaticSelectCell,
    flex: 1,
    minWidth: 150,
    maxWidth: 150,
}
```

## Rules

- **Enum columns always render as chips with a filterable select by default.** For every enum field, create a chip component using the `comet-admin-enum` skill and use it in the grid. Only fall back to `renderStaticSelectCell` when the user explicitly requests it.
- **Always add `type: "singleSelect"` and `valueOptions`** to enum columns so they are filterable via a select dropdown.
- **Use `messageDescriptorMapToValueOptions`** to convert the translatable enum's `messageDescriptorMap` to `valueOptions`. Import the `messageDescriptorMap` from the translatable enum file (e.g. `productStatusMessageDescriptorMap`). If the helper does not exist in the project, create it first.
- Search for an existing chip component (glob `**/<EnumName>Chip.tsx`) before generating a new one.
- If no chip component exists, use the `comet-admin-enum` skill to create one first.
- `valueOptions` can include `cellContent` with `GridCellContent` for rich rendering (icon, secondary text) when using `renderStaticSelectCell`.
- `valueFormatter` is only needed when using `renderStaticSelectCell`: `(value, row) => row.type?.toString()`.
