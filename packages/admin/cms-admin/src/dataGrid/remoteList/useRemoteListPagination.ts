import type { PaginationLabels, PaginationProps } from "@dextinity/ui";
import { useMemo } from "react";
import { useIntl } from "react-intl";

import type { RemoteListFilterParams } from "./remoteListFilterParams";
import type { RemoteListState } from "./useRemoteListState";

export function usePaginationLabels(): PaginationLabels {
    const intl = useIntl();
    return useMemo(
        () => ({
            navigation: intl.formatMessage({ id: "dextinity.remoteList.pagination", defaultMessage: "Pagination" }),
            pageSize: intl.formatMessage({ id: "dextinity.remoteList.pageSize", defaultMessage: "Per page" }),
            range: (from, to, count) =>
                intl.formatMessage({ id: "dextinity.remoteList.range", defaultMessage: "{from}–{to} of {count}" }, { from, to, count }),
            previous: intl.formatMessage({ id: "dextinity.remoteList.previousPage", defaultMessage: "Previous page" }),
            next: intl.formatMessage({ id: "dextinity.remoteList.nextPage", defaultMessage: "Next page" }),
            page: (page) => intl.formatMessage({ id: "dextinity.remoteList.page", defaultMessage: "Page {page}" }, { page }),
        }),
        [intl],
    );
}

/**
 * The `pagination` of a `DataGrid` for a remote list with translated labels, or `undefined` while there are no rows.
 */
export function useRemoteListPagination<Filters extends RemoteListFilterParams>(
    state: Pick<RemoteListState<Filters>, "page" | "pageSize" | "setPage" | "setPageSize">,
    total: number | undefined,
): PaginationProps | undefined {
    const labels = usePaginationLabels();
    if (total === undefined || total === 0) {
        return undefined;
    }
    return {
        page: state.page,
        pageSize: state.pageSize,
        total,
        onPageChange: state.setPage,
        onPageSizeChange: state.setPageSize,
        labels,
    };
}
