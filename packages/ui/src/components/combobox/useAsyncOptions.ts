import { useEffect, useRef, useState } from "react";

type AsyncOptionsStatus = "loading" | "success" | "error";

interface LoadResult<Option> {
    status: AsyncOptionsStatus;
    options: Option[];
}

/**
 * Loads the options for `query` while `enabled`, waiting `debounce` milliseconds after the last change of a non-empty query. A newer
 * request aborts the older one, so a slow answer never overwrites a newer one.
 */
export function useAsyncOptions<Option>({
    loadOptions,
    query,
    enabled,
    debounce,
}: {
    loadOptions: (query: string, context: { signal: AbortSignal }) => Promise<Option[]>;
    query: string;
    enabled: boolean;
    debounce: number;
}) {
    const [debouncedQuery, setDebouncedQuery] = useState(query);
    const [result, setResult] = useState<LoadResult<Option>>({ status: "loading", options: [] });
    const [attempt, setAttempt] = useState(0);
    const loadOptionsRef = useRef(loadOptions);

    useEffect(() => {
        loadOptionsRef.current = loadOptions;
    }, [loadOptions]);

    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedQuery(query), query === "" ? 0 : debounce);
        return () => clearTimeout(timeout);
    }, [query, debounce]);

    useEffect(() => {
        if (!enabled) {
            return;
        }
        const controller = new AbortController();
        setResult((previous) => ({ status: "loading", options: previous.options }));
        loadOptionsRef.current(debouncedQuery, { signal: controller.signal }).then(
            (options) => {
                if (!controller.signal.aborted) {
                    setResult({ status: "success", options });
                }
            },
            () => {
                if (!controller.signal.aborted) {
                    setResult({ status: "error", options: [] });
                }
            },
        );
        return () => controller.abort();
    }, [enabled, debouncedQuery, attempt]);

    const status: AsyncOptionsStatus = query !== debouncedQuery ? "loading" : result.status;

    return { status, options: result.options, retry: () => setAttempt((count) => count + 1) };
}
