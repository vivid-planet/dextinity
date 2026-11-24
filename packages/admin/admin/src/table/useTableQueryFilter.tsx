import { deepEqual } from "fast-equals";
import { createForm, type FormApi } from "final-form";
import { useEffect, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";

import { usePersistedState } from "./usePersistedState";
import type { IPagingApi } from "./useTableQueryPaging";

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export interface IFilterApi<FilterValues> {
    current: FilterValues;
    formApi: FormApi<FilterValues>;
}
/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export function useTableQueryFilter<FilterValues>(
    defaultValues: FilterValues,
    options: {
        pagingApi?: IPagingApi<any>;
        persistedStateId?: string;
    } = {},
): IFilterApi<FilterValues> {
    const [filters, setFilters] = usePersistedState<FilterValues>(defaultValues, {
        persistedStateId: options.persistedStateId ? `${options.persistedStateId}_filter` : undefined,
    });
    const ref = useRef<FormApi<FilterValues>>(undefined);
    if (!ref.current) {
        ref.current = createForm({
            initialValues: filters,
            onSubmit: (values) => {
                // Nothing todo
            },
        });
    }

    const handleFormStateChange = useDebouncedCallback(
        (formState: { values: FilterValues }) => {
            const newValues = formState.values;
            if (!deepEqual(filters, newValues)) {
                setFilters(newValues);
                if (options.pagingApi) {
                    options.pagingApi.changePage(options.pagingApi.init, 1, { noScrollToTop: true });
                }
            }
        },
        500,
        { leading: true, trailing: true },
    );

    useEffect(() => {
        if (!ref.current) {
            return;
        }
        const unsubscribe = ref.current.subscribe(handleFormStateChange, { values: true });
        return () => {
            unsubscribe();
            handleFormStateChange.cancel();
        };
    }, [handleFormStateChange]);

    return {
        current: filters,
        formApi: ref.current,
    };
}
