# Grid: Standard Paginated (Base Pattern)

**This is the base grid pattern. Always read this file first before any variant-specific file.**

The grid component wires together server-side data fetching (Apollo `useQuery`), MUI DataGrid rendering, and `@comet/admin` hooks for pagination, sorting, and filtering. For column definitions see the `grid-col-def-*.md` files.

## GQL (Fragment, Query, Mutation)

```typescript
import { gql } from "@apollo/client";

const <entityName>sFragment = gql`
    fragment <EntityName>sGridItem on <EntityName> {
        id
        <field1>
        <field2>
        // only fields actually rendered in columns
    }
`;

export const <entityName>sQuery = gql`
    query <EntityName>sGrid($offset: Int!, $limit: Int!, $sort: [<EntityName>Sort!]!, $search: String, $filter: <EntityName>Filter) {
        <entityName>s(offset: $offset, limit: $limit, sort: $sort, search: $search, filter: $filter) {
            nodes {
                ...<EntityName>sGridItem
            }
            totalCount
        }
    }
    ${<entityName>sFragment}
`;

export const delete<EntityName>Mutation = gql`
    mutation Delete<EntityName>($id: ID!) {
        delete<EntityName>(id: $id)
    }
`;
```

### GQL Rules

- Fragment name must be `<EntityName>sGridItem` (not `<EntityName>sGrid`) to avoid naming collision with the query operation name. The generated type will be `GQL<EntityName>sGridItemFragment`
- Only include fields actually used in grid columns in the fragment
- Omit `deleteXxxMutation` if no delete mutation exists in the schema
- **Query variable types must match the schema signature exactly** — pay close attention to nullability (`!`), list wrappers (`[...]`), and default values. For example, if the schema declares `sort: [ProductSort!]!`, the query variable must be `$sort: [ProductSort!]!` (non-nullable), not `$sort: [ProductSort!]` (nullable). Always copy the exact type from `schema.gql`
- Use the exact GQL query/mutation names from the schema — do not guess
- For fragment field selection per column type, see the `grid-col-def-*.md` reference files

## Component Template

```tsx
import {
    GQL<EntityName>sGridQuery,
    GQL<EntityName>sGridQueryVariables,
    GQL<EntityName>sGridItemFragment,
    GQLDelete<EntityName>Mutation,
    GQLDelete<EntityName>MutationVariables,
} from "./<EntityName>sGrid.generated";
import { useIntl } from "react-intl";
import { FormattedNumber } from "react-intl";
import { useApolloClient, useQuery } from "@apollo/client";
import {
    CrudContextMenu,
    GridColDef,
    muiGridFilterToGql,
    StackLink,
    useStackSwitchApi,
    useBufferedRowCount,
    usePersistentColumnState,
    useDataGridRemote,
    muiGridSortToGql,
} from "@comet/admin";
import { IconButton } from "@mui/material";
import { DataGridPro, DataGridProProps, GridSlotsComponent } from "@mui/x-data-grid-pro";
import { useMemo } from "react";
import { Edit as EditIcon } from "@comet/admin-icons";
import { delete<EntityName>Mutation, <entityName>sQuery } from "./<EntityName>sGrid.gql";
import { <EntityName>sGridToolbar } from "./toolbar/<EntityName>sGridToolbar";

export function <EntityName>sGrid() {
    const client = useApolloClient();
    const intl = useIntl();
    const dataGridProps = {
        ...useDataGridRemote({
            queryParamsPrefix: "<entityName>s",
        }),
        ...usePersistentColumnState("<EntityName>sGrid"),
    };
    const stackSwitchApi = useStackSwitchApi();

    const handleRowClick: DataGridProProps["onRowClick"] = (params) => {
        stackSwitchApi.activatePage("edit", params.row.id);
    };

    const columns: GridColDef<GQL<EntityName>sGridItemFragment>[] = useMemo(
        () => [
            // see grid-col-def-*.md for column type patterns
            {
                field: "actions",
                headerName: "",
                sortable: false,
                filterable: false,
                type: "actions",
                align: "right",
                pinned: "right",
                width: 84,
                renderCell: (params) => {
                    return (
                        <>
                            <IconButton color="primary" component={StackLink} pageName="edit" payload={params.row.id}>
                                <EditIcon />
                            </IconButton>
                            <CrudContextMenu
                                onDelete={async () => {
                                    await client.mutate<GQLDelete<EntityName>Mutation, GQLDelete<EntityName>MutationVariables>({
                                        mutation: delete<EntityName>Mutation,
                                        variables: { id: params.row.id },
                                    });
                                }}
                                refetchQueries={[<entityName>sQuery]}
                            />
                        </>
                    );
                },
            },
        ],
        [intl, client],
    );

    const { filter: gqlFilter, search: gqlSearch } = muiGridFilterToGql(columns, dataGridProps.filterModel);
    const { data, loading, error } = useQuery<GQL<EntityName>sGridQuery, GQL<EntityName>sGridQueryVariables>(<entityName>sQuery, {
        variables: {
            filter: gqlFilter,
            search: gqlSearch,
            sort: muiGridSortToGql(dataGridProps.sortModel, columns) ?? [],
            offset: dataGridProps.paginationModel.page * dataGridProps.paginationModel.pageSize,
            limit: dataGridProps.paginationModel.pageSize,
        },
    });
    const rowCount = useBufferedRowCount(data?.<entityName>s.totalCount);
    if (error) throw error;
    const rows = data?.<entityName>s.nodes ?? [];

    return (
        <DataGridPro
            {...dataGridProps}
            rows={rows}
            rowCount={rowCount}
            columns={columns}
            loading={loading}
            slots={{
                toolbar: <EntityName>sGridToolbar as GridSlotsComponent["toolbar"],
            }}
            onRowClick={handleRowClick}
        />
    );
}
```

## CrudContextMenu Options

```tsx
<CrudContextMenu
    onDelete={async () => {
        /* ... */
    }}
    refetchQueries={[entitiesQuery]}
    // Custom delete button label:
    messagesMapping={{ delete: <FormattedMessage id="entity.delete" defaultMessage="Remove" /> }}
    // Change delete semantics (default "delete", alternative "remove"):
    deleteType="remove"
/>
```

## Column Header with Tooltip

Use `renderHeader` with `GridColumnHeaderTitle` and `Tooltip` for columns that need an info icon:

```tsx
import { GridColumnHeaderTitle } from "@mui/x-data-grid";
import { Info as InfoIcon } from "@comet/admin-icons";

{
    field: "price",
    renderHeader: () => (
        <>
            <GridColumnHeaderTitle
                label={intl.formatMessage({ id: "product.price", defaultMessage: "Price" })}
                columnWidth={150}
            />
            <Tooltip title={<FormattedMessage id="product.price.tooltip" defaultMessage="Price in EUR" />}>
                <InfoIcon sx={{ marginLeft: 1 }} />
            </Tooltip>
        </>
    ),
    headerName: intl.formatMessage({ id: "product.price", defaultMessage: "Price" }),
    // ... rest of column config
}
```

Note: Keep `headerName` alongside `renderHeader` — it is used for accessibility and export.

## Density

Override row height density on the DataGridPro:

```tsx
<DataGridPro
    {...dataGridProps}
    density="compact" // "comfortable" | "compact" | "standard" (default)
    // ...
/>
```

## Rules

- **`muiGridSortToGql` can return `undefined`** when no sort model is set. Since the `$sort` variable is non-nullable (`[EntitySort!]!`), always provide a fallback: `muiGridSortToGql(dataGridProps.sortModel, columns) ?? []`
- Only import what is actually used — remove unused imports
- `queryParamsPrefix` = camelCase entity plural (e.g. `"products"`)
- `usePersistentColumnState` key = PascalCase grid name (e.g. `"ProductsGrid"`)
- `actions` column is always last, `pinned: "right"`, `width: 84`
- Omit `CrudContextMenu` and `delete*` imports/types if no delete mutation exists in the schema
- Omit `onRowClick` if the entity has no edit page
- Use `DataGridPro` by default; switch to `DataGridPremium` only if the user requests premium features
- Generated types come from `./<EntityName>sGrid.generated` — never create this file manually
- `renderCell` can always be used for any field type when fully custom rendering is needed
- For column type patterns, see the `grid-col-def-*.md` reference files
- For grid variants, see the `grid-01` through `grid-08` reference files
