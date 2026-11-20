import { gql, useQuery } from "@apollo/client";
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

export function useFullTextSearch({ search, limit }: { search: string; limit: number }) {
    const [debouncedSearch] = useDebounce(search.trim(), 250);

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
        areResultsStale: isTyping || (loading && data === undefined),
        debouncedSearch,
    };
}
