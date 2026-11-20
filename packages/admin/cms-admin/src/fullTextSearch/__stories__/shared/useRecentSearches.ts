import { useCallback, useState } from "react";

import type { SearchResult } from "./types";

const storageKey = "dextinity.fullTextSearchPrototype.recent";
const maxRecentEntries = 5;

interface RecentSearches {
    terms: string[];
    results: SearchResult[];
}

function readFromStorage(): RecentSearches {
    try {
        const value = window.localStorage.getItem(storageKey);
        return value ? (JSON.parse(value) as RecentSearches) : { terms: [], results: [] };
    } catch {
        return { terms: [], results: [] };
    }
}

function writeToStorage(recentSearches: RecentSearches) {
    try {
        window.localStorage.setItem(storageKey, JSON.stringify(recentSearches));
    } catch {
        // Storage may be unavailable (private mode), recent searches then only live for the session
    }
}

export function useRecentSearches() {
    const [recentSearches, setRecentSearches] = useState<RecentSearches>(readFromStorage);

    const update = useCallback((updater: (previous: RecentSearches) => RecentSearches) => {
        // Written eagerly because the component may unmount right after selecting a result, dropping a queued state update
        const next = updater(readFromStorage());
        writeToStorage(next);
        setRecentSearches(next);
    }, []);

    const addTerm = useCallback(
        (term: string) => {
            const trimmedTerm = term.trim();
            if (trimmedTerm.length === 0) {
                return;
            }
            update((previous) => ({
                ...previous,
                terms: [trimmedTerm, ...previous.terms.filter((existing) => existing.toLowerCase() !== trimmedTerm.toLowerCase())].slice(
                    0,
                    maxRecentEntries,
                ),
            }));
        },
        [update],
    );

    const addResult = useCallback(
        (result: SearchResult) => {
            update((previous) => ({
                ...previous,
                results: [
                    result,
                    ...previous.results.filter((existing) => existing.id !== result.id || existing.entityName !== result.entityName),
                ].slice(0, maxRecentEntries),
            }));
        },
        [update],
    );

    const clear = useCallback(() => update(() => ({ terms: [], results: [] })), [update]);

    return { ...recentSearches, addTerm, addResult, clear };
}
