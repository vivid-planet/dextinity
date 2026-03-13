# Relation Filter Patterns

ManyToOne relation columns need a custom filter component that provides an Autocomplete dropdown backed by a server-side search query. The filter exports a `FilterOperators` array that gets passed to the column's `filterOperators` prop.

## GQL Query

```ts
import { gql } from "@apollo/client";

export const <relatedEntity>FilterQuery = gql`
    query <RelatedEntity>Filter($offset: Int!, $limit: Int!, $search: String) {
        <relatedEntity>s(offset: $offset, limit: $limit, search: $search) {
            nodes {
                id
                title
            }
        }
    }
`;
```

- Only fetch `id` and the label field (e.g. `title`, `name`)
- Match the exact query name from the schema

---

## Filter Component

```tsx
import { gql, useQuery } from "@apollo/client";
import { ClearInputAdornment } from "@comet/admin";
import Autocomplete from "@mui/material/Autocomplete";
import { type GridFilterInputValueProps, type GridFilterOperator, useGridRootProps } from "@mui/x-data-grid-pro";
import { useCallback, useState } from "react";
import { useIntl } from "react-intl";
import { useDebounce } from "use-debounce";

import { type GQL<RelatedEntity>FilterQuery, type GQL<RelatedEntity>FilterQueryVariables } from "./<RelatedEntity>Filter.generated";
import { <relatedEntity>FilterQuery } from "./<RelatedEntity>Filter.gql";

function <RelatedEntity>Filter({ item, applyValue, apiRef }: GridFilterInputValueProps) {
    const intl = useIntl();
    const [search, setSearch] = useState<string | undefined>(undefined);
    const [debouncedSearch] = useDebounce(search, 500);
    const rootProps = useGridRootProps();

    const { data } = useQuery<GQL<RelatedEntity>FilterQuery, GQL<RelatedEntity>FilterQueryVariables>(<relatedEntity>FilterQuery, {
        variables: {
            offset: 0,
            limit: 10,
            search: debouncedSearch,
        },
    });

    const handleApplyValue = useCallback(
        (value: string | undefined) => {
            applyValue({
                ...item,
                id: item.id,
                operator: "equals",
                value,
            });
        },
        [applyValue, item],
    );

    return (
        <Autocomplete
            size="small"
            options={data?.<relatedEntity>s.nodes ?? []}
            autoHighlight
            value={item.value ? item.value : null}
            filterOptions={(x) => x}
            disableClearable
            isOptionEqualToValue={(option, value) => option.id == value}
            getOptionLabel={(option) => {
                return (
                    option.title ??
                    data?.<relatedEntity>s.nodes.find((item) => item.id === option)?.title ??
                    option
                );
            }}
            onChange={(event, value, reason) => {
                handleApplyValue(value ? value.id : undefined);
            }}
            renderInput={(params) => (
                <rootProps.slots.baseTextField
                    {...params}
                    autoComplete="off"
                    placeholder={intl.formatMessage({
                        id: "<relatedEntity>.placeholder",
                        defaultMessage: "Choose a <RelatedEntity Label>",
                    })}
                    value={search ? search : null}
                    onChange={(event) => {
                        setSearch(event.target.value);
                    }}
                    label={apiRef.current.getLocaleText("filterPanelInputLabel")}
                    slotProps={{
                        inputLabel: { shrink: true },
                        input: {
                            ...params.InputProps,
                            endAdornment: (
                                <>
                                    <ClearInputAdornment
                                        position="end"
                                        hasClearableContent={Boolean(item.value)}
                                        onClick={() => handleApplyValue(undefined)}
                                    />
                                    {params.InputProps.endAdornment}
                                </>
                            ),
                        },
                    }}
                />
            )}
        />
    );
}

export const <RelatedEntity>FilterOperators: GridFilterOperator[] = [
    {
        value: "equals",
        getApplyFilterFn: (filterItem) => {
            throw new Error("not implemented, we filter server side");
        },
        InputComponent: <RelatedEntity>Filter,
    },
];
```

## Rules

- Requires `use-debounce` package — check `admin/package.json` and run `npm --prefix admin install use-debounce` if not installed
- The label field in `getOptionLabel` (e.g. `title`) must match what's fetched in the GQL query
- Ask the user for the label field if it's not obvious from the schema (e.g. `name` vs `title`)
- `<RelatedEntity>Filter.generated.ts` is auto-generated by codegen — do not create it manually
