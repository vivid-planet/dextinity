import { gql, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

import type { SearchResult } from "./types";

const fullTextSearchQuery = gql`
    query FullTextSearchPrototype($search: String!, $limit: Int!) {
        myFullTextSearch(search: $search, limit: $limit) {
            nodes {
                id
                entityName
                name
                secondaryInformation
            }
            totalCount
        }
    }
`;

interface QueryData {
    myFullTextSearch: { nodes: SearchResult[]; totalCount: number };
}

export function useFullTextSearch({ search, initialLimit }: { search: string; initialLimit: number }) {
    const [debouncedSearch] = useDebounce(search.trim(), 250);
    const [limit, setLimit] = useState(initialLimit);

    useEffect(() => {
        setLimit(initialLimit);
    }, [debouncedSearch, initialLimit]);

    const { data, previousData, loading } = useQuery<QueryData>(fullTextSearchQuery, {
        variables: { search: debouncedSearch, limit },
        skip: debouncedSearch.length === 0,
    });

    const isTyping = search.trim() !== debouncedSearch;
    const currentData = data ?? previousData;

    return {
        results: debouncedSearch.length > 0 ? (currentData?.myFullTextSearch.nodes ?? []) : [],
        totalCount: debouncedSearch.length > 0 ? (currentData?.myFullTextSearch.totalCount ?? 0) : 0,
        loading: loading || isTyping,
        hasResultsData: currentData !== undefined && debouncedSearch.length > 0,
        debouncedSearch,
        showAll: () => setLimit(50),
        isShowingAll: limit > initialLimit,
    };
}
