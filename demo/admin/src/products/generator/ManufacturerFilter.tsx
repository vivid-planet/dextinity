import { gql, useQuery } from "@apollo/client";
import { ClearInputAdornment } from "@dextinity/admin";
import { ChevronDown } from "@dextinity/admin-icons";
import Autocomplete from "@mui/material/Autocomplete";
import { type GridFilterInputValueProps, type GridFilterOperator, useGridRootProps } from "@mui/x-data-grid-pro";
import { type ChangeEvent, useCallback, useState } from "react";
import { useIntl } from "react-intl";
import { useDebounce } from "use-debounce";

import type { GQLManufacturersFilterQuery, GQLManufacturersFilterQueryVariables } from "./ManufacturerFilter.generated";

const manufacturersQuery = gql`
    query ManufacturersFilter($offset: Int!, $limit: Int!, $search: String) {
        manufacturers(offset: $offset, limit: $limit, search: $search) {
            nodes {
                id
                name
            }
            totalCount
        }
    }
`;

// Source: https://mui.com/x/react-data-grid/filtering/customization/#multiple-values-operator
function ManufacturerFilter({ item, applyValue, apiRef }: GridFilterInputValueProps) {
    const intl = useIntl();
    const [search, setSearch] = useState<string | undefined>(undefined);
    const [debouncedSearch] = useDebounce(search, 500);
    const rootProps = useGridRootProps();

    const { data } = useQuery<GQLManufacturersFilterQuery, GQLManufacturersFilterQueryVariables>(manufacturersQuery, {
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

    // source https://mui.com/material-ui/react-autocomplete/
    return (
        <Autocomplete
            size="small"
            options={data?.manufacturers.nodes ?? []}
            autoHighlight
            value={item.value ? item.value : null}
            filterOptions={(x) => x} // disable local filtering
            disableClearable
            isOptionEqualToValue={(option, value) => {
                // does only highlight the selected value in options-list but does not trigger getOptionLabel-Call
                return option.id == value;
            }}
            getOptionLabel={(option) => {
                // option.name is not set if loaded from filters-model, small delay replacing id with name because of loading
                return option.name ?? data?.manufacturers.nodes.find((item) => item.id === option)?.name ?? option;
            }}
            onChange={(event, value, reason) => {
                handleApplyValue(value ? value.id : undefined);
            }}
            renderInput={(params) => (
                <rootProps.slots.baseTextField
                    {...params}
                    autoComplete="off"
                    placeholder={intl.formatMessage({ id: "manufacturer-filter.placeholder", defaultMessage: "Choose a manufacturer" })}
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
            popupIcon={<ChevronDown />}
        />
    );
}

export const ManufacturerFilterOperators: GridFilterOperator[] = [
    {
        value: "equals",
        getApplyFilterFn: (filterItem) => {
            throw new Error("not implemented, we filter server side");
        },
        InputComponent: ManufacturerFilter,
    },
];
