import { gql, useQuery } from "@apollo/client";
import { ClearInputAdornment } from "@dextinity/admin";
import Autocomplete from "@mui/material/Autocomplete";
import { type GridFilterInputValueProps, type GridFilterOperator, useGridRootProps } from "@mui/x-data-grid-pro";
import { type ChangeEvent, useCallback, useState } from "react";
import { useIntl } from "react-intl";
import { useDebounce } from "use-debounce";

import type { GQLProductCategoryFilterQuery, GQLProductCategoryFilterQueryVariables } from "./ProductCategoryFilter.generated";

const productCategoryQuery = gql`
    query ProductCategoryFilter($offset: Int!, $limit: Int!, $search: String) {
        productCategories(offset: $offset, limit: $limit, search: $search) {
            nodes {
                id
                title
            }
        }
    }
`;

function ProductCategoryFilter({ item, applyValue, apiRef }: GridFilterInputValueProps) {
    const intl = useIntl();
    const [search, setSearch] = useState<string | undefined>(undefined);
    const [debouncedSearch] = useDebounce(search, 500);
    const rootProps = useGridRootProps();

    const { data } = useQuery<GQLProductCategoryFilterQuery, GQLProductCategoryFilterQueryVariables>(productCategoryQuery, {
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
            options={data?.productCategories.nodes ?? []}
            autoHighlight
            value={item.value ? item.value : null}
            filterOptions={(x) => x} // disable local filtering
            disableClearable
            isOptionEqualToValue={(option, value) => {
                return option.id == value;
            }}
            getOptionLabel={(option) => {
                return (
                    option.title ??
                    data?.productCategories.nodes.find((item) => {
                        return item.id === option;
                    })?.title ??
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
                    placeholder={intl.formatMessage({ id: "productCategory.placeholder", defaultMessage: "Choose a Product Category" })}
                    value={search}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        setSearch(event.target.value);
                    }}
                    label={apiRef.current.getLocaleText("filterPanelInputLabel")}
                    slotProps={{
                        inputLabel: {
                            shrink: true,
                        },
                        input: {
                            ...params.InputProps,
                            endAdornment: (
                                <>
                                    {item.value && <ClearInputAdornment position="end" onClick={() => handleApplyValue(undefined)} />}
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

export const ProductCategoryFilterOperators: GridFilterOperator[] = [
    {
        value: "equals",
        getApplyFilterFn: (filterItem) => {
            throw new Error("not implemented, we filter server side");
        },
        InputComponent: ProductCategoryFilter,
    },
];
