import type { DataGridProps, GridFilterModel, GridSortDirection } from "@mui/x-data-grid";

import { useDataGridUrlState } from "./useDataGridUrlState";

type UseDataGridRemoteReturnValue = ReturnType<typeof useDataGridUrlState> & {
    filterMode: DataGridProps["filterMode"];
    paginationMode: DataGridProps["paginationMode"];
    pagination: DataGridProps["pagination"];
    sortingMode: NonNullable<DataGridProps["sortingMode"]>;
};

/**
 * Returns props for DataGrid that turns it into a controlled component that stores it's state as location params AND makes it ready to be used for remote filter/sorting/paging
 **/
export function useDataGridRemote({
    queryParamsPrefix = "",
    pageSize: initialPageSize = 25,
    initialSort,
    initialFilter,
}: {
    queryParamsPrefix?: string;
    pageSize?: number;
    initialSort?: Array<{ field: string; sort: GridSortDirection }>;
    initialFilter?: GridFilterModel;
} = {}): UseDataGridRemoteReturnValue {
    const state = useDataGridUrlState({
        queryParamsPrefix,
        pageSize: initialPageSize,
        initialSort,
        initialFilter,
    });

    return {
        ...state,
        filterMode: "server",
        paginationMode: "server",
        pagination: true,
        sortingMode: "server",
    };
}
