import type { DataGridProps, GridCallbackDetails, GridFilterModel, GridPaginationModel, GridSortDirection, GridSortModel } from "@mui/x-data-grid";
import { deepEqual } from "fast-equals";
import queryString from "query-string";
import { useCallback, useRef, useState } from "react";
import { type Location, type NavigateFunction, useLocation, useNavigate } from "react-router";

type UseDataGridUrlStateReturnValue = {
    filterModel: DataGridProps["filterModel"];
    onFilterModelChange: DataGridProps["onFilterModelChange"];

    paginationModel: NonNullable<DataGridProps["paginationModel"]>;
    onPaginationModelChange: DataGridProps["onPaginationModelChange"];

    sortModel: NonNullable<DataGridProps["sortModel"]>;
    onSortModelChange: DataGridProps["onSortModelChange"];
};

/**
 * Returns props for DataGrid that turns it into a controlled component that stores it's state as location params
 **/
function replaceSearch(navigate: NavigateFunction, location: Location, search: string) {
    navigate({ pathname: location.pathname, search, hash: location.hash }, { replace: true, state: location.state });
}

export function useDataGridUrlState({
    queryParamsPrefix = "",
    pageSize: initialPageSize = 25,
    initialSort,
    initialFilter,
}: {
    queryParamsPrefix?: string;
    pageSize?: number;
    initialSort?: Array<{ field: string; sort: GridSortDirection }>;
    initialFilter?: GridFilterModel;
} = {}): UseDataGridUrlStateReturnValue {
    const navigate = useNavigate();
    const location = useLocation();

    // fallback states are used when query param in the Url is lost (e.g. when the user open an EditDialog that creates a new sub route)
    const [fallbackSort, setFallbackSort] = useState<GridSortModel | undefined>(undefined);
    const [fallbackFilter, setFallbackFilter] = useState<GridFilterModel | undefined>(undefined);
    const [fallbackPage, setFallbackPage] = useState<number | undefined>(undefined);
    const [fallbackPageSize, setFallbackPageSize] = useState<number | undefined>(undefined);

    const sortParamName = `${queryParamsPrefix}sort`;
    const filterParamName = `${queryParamsPrefix}filter`;
    const pageParamName = `${queryParamsPrefix}page`;
    const pageSizeParamName = `${queryParamsPrefix}pageSize`;

    const parsedSearch = queryString.parse(location.search, { parseNumbers: true });

    const page = (parsedSearch[pageParamName] as number) ?? fallbackPage ?? 0;

    const pageSize = (parsedSearch[pageSizeParamName] as number) ?? fallbackPageSize ?? initialPageSize;

    const onPaginationModelChange = useCallback(
        (model: GridPaginationModel, details: GridCallbackDetails) => {
            replaceSearch(
                navigate,
                location,
                queryString.stringify({ ...parsedSearch, [pageParamName]: model.page, [pageSizeParamName]: model.pageSize }),
            );
            setFallbackPage(model.page);
            setFallbackPageSize(model.pageSize);
        },
        [navigate, location, pageParamName, pageSizeParamName, parsedSearch],
    );

    const sortModel = useDeepEqualMemo(
        (!parsedSearch[sortParamName]
            ? undefined
            : !Array.isArray(parsedSearch[sortParamName])
              ? parsedSearch[sortParamName] === "none"
                  ? []
                  : [parsedSearch[sortParamName] as string]
              : (parsedSearch[sortParamName] as string[])
        )?.map((i) => {
            const parts = i.split(":");
            return {
                field: parts[0],
                sort: parts[1] as GridSortDirection,
            };
        }) ??
            fallbackSort ??
            initialSort ??
            [],
    );

    const handleSortModelChange = useCallback(
        (sortModel: GridSortModel) => {
            const sort = sortModel.length > 0 ? sortModel.map((i) => `${i.field}:${i.sort}`) : ["none"];
            replaceSearch(navigate, location, queryString.stringify({ ...parsedSearch, [sortParamName]: sort }));
            setFallbackSort(sortModel);
        },
        [navigate, location, parsedSearch, sortParamName],
    );

    const filterModel = parsedSearch[filterParamName]
        ? JSON.parse(parsedSearch[filterParamName] as string)
        : (fallbackFilter ?? initialFilter ?? { items: [] });
    const handleFilterChange = useCallback(
        (filterModel: GridFilterModel) => {
            replaceSearch(navigate, location, queryString.stringify({ ...parsedSearch, [filterParamName]: JSON.stringify(filterModel) }));
            setFallbackFilter(filterModel);
        },
        [navigate, location, parsedSearch, filterParamName],
    );

    return {
        filterModel: filterModel,
        onFilterModelChange: handleFilterChange,

        paginationModel: {
            pageSize,
            page,
        },
        onPaginationModelChange,

        sortModel,
        onSortModelChange: handleSortModelChange,
    };
}

function useDeepEqualMemo<T>(value: T): T {
    const ref = useRef(value);
    if (!deepEqual(ref.current, value)) {
        ref.current = value;
    }
    return ref.current;
}
