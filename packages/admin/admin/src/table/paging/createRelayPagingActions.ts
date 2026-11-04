import type { IPagingApi } from "../useTableQueryPaging";
import type { IPagingInfo } from "./IPagingInfo";

interface IRelayPagingData {
    pageInfo: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        startCursor: string;
        endCursor: string;
    };
}
interface IRelayPagingVariables {
    after?: string;
    before?: string;
}
/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export function createRelayPagingActions<TData extends IRelayPagingData>(pagingApi: IPagingApi<IRelayPagingVariables>, data: TData): IPagingInfo {
    return {
        fetchNextPage:
            data.pageInfo && data.pageInfo.hasNextPage
                ? () => {
                      pagingApi.changePage({
                          after: data.pageInfo.endCursor,
                      });
                  }
                : undefined,
        fetchPreviousPage:
            data.pageInfo && data.pageInfo.hasPreviousPage
                ? () => {
                      pagingApi.changePage({
                          before: data.pageInfo.startCursor,
                      });
                  }
                : undefined,
        currentPage: pagingApi.currentPage,
        attachTableRef: pagingApi.attachTableRef,
    };
}
