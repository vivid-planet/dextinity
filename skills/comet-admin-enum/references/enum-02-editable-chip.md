# Editable Chip Component

Wraps the enum chip with an Apollo query and mutation, allowing the user to change the enum value for a specific entity directly from the chip dropdown.

**Naming convention:** `{EnumName}ChipEditableFor{EntityName}`
Example: `LocationStatus` on `Location` → `LocationStatusChipEditableForLocation`

## Prerequisites

1. **Chip component** must exist — create it first using [enum-01-chip.md](enum-01-chip.md) if missing
2. **Auto-detect query and mutation** from `api/schema.gql` — find the entity query, update mutation, and input type structure

## File Location

```
{domain}/components/{camelCaseName}ChipEditableFor{EntityName}/{EnumName}ChipEditableFor{EntityName}
```

## Query & Mutation

```ts
export const {camelCaseName}For{EntityName}Query = gql`
    query {PascalCaseName}For{EntityName}($id: ID!) {
        {entityQuery}(id: $id) {
            id
            {enumFieldName}
        }
    }
`;

export const update{EntityName}{EnumName}Mutation = gql`
    mutation Update{EntityName}{EnumName}($id: ID!, ${enumFieldName}: {EnumName}!) {
        {updateMutation}(id: $id, input: { {enumFieldName}: ${enumFieldName} }) {
            id
            {enumFieldName}
        }
    }
`;
```

## Component Template

```tsx
import { useMutation, useQuery } from "@apollo/client";
import { InlineAlert, LocalErrorScopeApolloContext, Tooltip } from "@comet/admin";
import { Error } from "@comet/admin-icons";
import { Box } from "@mui/material";
import { {EnumName}Chip } from "{chipImportPath}";
import { type FunctionComponent } from "react";

import { {camelCaseName}For{EntityName}Query, update{EntityName}{EnumName}Mutation } from "./{EnumName}ChipEditableFor{EntityName}.gql";
import {
    type GQL{PascalCaseName}For{EntityName}Query,
    type GQL{PascalCaseName}For{EntityName}QueryVariables,
    type GQLUpdate{EntityName}{EnumName}Mutation,
    type GQLUpdate{EntityName}{EnumName}MutationVariables,
} from "./{EnumName}ChipEditableFor{EntityName}.gql.generated";

type {EnumName}ChipEditableFor{EntityName}Props = {
    {entityId}: string;
};

export const {EnumName}ChipEditableFor{EntityName}: FunctionComponent<{EnumName}ChipEditableFor{EntityName}Props> = ({ {entityId} }) => {
    const { data, loading, error } = useQuery<GQL{PascalCaseName}For{EntityName}Query, GQL{PascalCaseName}For{EntityName}QueryVariables>(
        {camelCaseName}For{EntityName}Query,
        {
            variables: { id: {entityId} },
            context: LocalErrorScopeApolloContext,
        },
    );
    const [updateMutation, { loading: updateLoading }] = useMutation<
        GQLUpdate{EntityName}{EnumName}Mutation,
        GQLUpdate{EntityName}{EnumName}MutationVariables
    >(update{EntityName}{EnumName}Mutation);

    if (error) {
        return (
            <Tooltip title={<Box margin={4}><InlineAlert /></Box>} variant="light">
                <Error color="error" />
            </Tooltip>
        );
    }
    return data?.{entityQuery}.{enumFieldName} ? (
        <{EnumName}Chip
            value={data.{entityQuery}.{enumFieldName}}
            loading={loading || updateLoading}
            onSelectItem={(value) => {
                updateMutation({ variables: { id: {entityId}, {enumFieldName}: value } });
            }}
        />
    ) : null;
};
```

## DataGrid Integration

When using an editable chip inside a DataGrid column with `onRowClick`, you **must** stop event propagation on both `onClick` and `onMouseDown`. Otherwise the DataGrid captures the events for cell selection and row navigation, making the chip unclickable or requiring a double click.

```tsx
{
    field: "status",
    headerName: "Status",
    renderCell: ({ row }) => (
        <Box onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
            <{EnumName}ChipEditableFor{EntityName} {entityId}={row.id} />
        </Box>
    ),
}
```

- `onMouseDown` stopPropagation prevents the DataGrid from selecting the cell on first click
- `onClick` stopPropagation prevents `onRowClick` from firing and navigating away

## Concrete Example

### Query & Mutation

```ts
export const locationStatusForLocationQuery = gql`
    query LocationStatusForLocation($id: ID!) {
        location(id: $id) {
            id
            status
        }
    }
`;

export const updateLocationStatusForLocationMutation = gql`
    mutation UpdateLocationStatusForLocation($id: ID!, $status: LocationStatus!) {
        updateLocation(id: $id, input: { status: $status }) {
            id
            status
        }
    }
`;
```

### Component

```tsx
import { useMutation, useQuery } from "@apollo/client";
import { InlineAlert, LocalErrorScopeApolloContext, Tooltip } from "@comet/admin";
import { Error } from "@comet/admin-icons";
import { Box } from "@mui/material";
import { LocationStatusChip } from "@src/common/components/enums/locationStatus/locationStatusChip/LocationStatusChip";
import { type FunctionComponent } from "react";

import { locationStatusForLocationQuery, updateLocationStatusForLocationMutation } from "./LocationStatusChipEditableForLocation.gql";
import {
    type GQLLocationStatusForLocationQuery,
    type GQLLocationStatusForLocationQueryVariables,
    type GQLUpdateLocationStatusForLocationMutation,
    type GQLUpdateLocationStatusForLocationMutationVariables,
} from "./LocationStatusChipEditableForLocation.gql.generated";

type LocationStatusChipEditableForLocationProps = {
    locationId: string;
};

export const LocationStatusChipEditableForLocation: FunctionComponent<LocationStatusChipEditableForLocationProps> = ({ locationId }) => {
    const { data, loading, error } = useQuery<GQLLocationStatusForLocationQuery, GQLLocationStatusForLocationQueryVariables>(
        locationStatusForLocationQuery,
        {
            variables: {
                id: locationId,
            },
            context: LocalErrorScopeApolloContext,
        },
    );
    const [updateMutation, { loading: updateLoading }] = useMutation<
        GQLUpdateLocationStatusForLocationMutation,
        GQLUpdateLocationStatusForLocationMutationVariables
    >(updateLocationStatusForLocationMutation);

    if (error) {
        return (
            <Tooltip
                title={
                    <Box margin={4}>
                        <InlineAlert />
                    </Box>
                }
                variant="light"
            >
                <Error color="error" />
            </Tooltip>
        );
    }
    return data?.location.status ? (
        <LocationStatusChip
            value={data.location.status}
            loading={loading || updateLoading}
            onSelectItem={(status) => {
                updateMutation({
                    variables: {
                        id: locationId,
                        status: status,
                    },
                });
            }}
        />
    ) : null;
};
```
