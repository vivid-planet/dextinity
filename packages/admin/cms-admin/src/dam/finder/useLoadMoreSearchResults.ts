import type { OperationVariables, QueryResult } from "@apollo/client";
import { useState } from "react";

interface SearchResultsData {
    damFilesList: { nodes: unknown[]; totalCount: number };
}

/** Appends the next page of a `damFilesList` search, fetched with `offset` and `limit`, to the results already shown. */
export function useLoadMoreSearchResults<TData extends SearchResultsData, TVariables extends OperationVariables>(
    query: Pick<QueryResult<TData, TVariables>, "data" | "fetchMore">,
    pageSize: number,
) {
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const loadedCount = query.data?.damFilesList.nodes.length ?? 0;
    const totalCount = query.data?.damFilesList.totalCount ?? 0;

    const loadMore = async () => {
        setIsLoadingMore(true);
        try {
            await query.fetchMore({
                variables: { offset: loadedCount, limit: pageSize },
                updateQuery: (previous, { fetchMoreResult }) => ({
                    ...fetchMoreResult,
                    damFilesList: {
                        ...fetchMoreResult.damFilesList,
                        nodes: [...previous.damFilesList.nodes, ...fetchMoreResult.damFilesList.nodes],
                    },
                }),
            });
        } finally {
            setIsLoadingMore(false);
        }
    };

    return { hasMore: loadedCount < totalCount, isLoadingMore, loadMore, loadedCount, totalCount };
}
