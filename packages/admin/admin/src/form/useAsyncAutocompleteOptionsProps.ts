import type { UseAutocompleteProps } from "@mui/material";
import { debounce } from "@mui/material/utils";
import { type ChangeEvent, useCallback, useMemo, useState } from "react";

export interface AsyncAutocompleteOptionsProps<T> {
    isAsync: boolean;
    open: boolean;
    options: T[];
    loadingError: Error | null;
    loading?: boolean;
    onOpen: (event: ChangeEvent) => void;
    onClose: (event: ChangeEvent) => void;
    onInputChange: UseAutocompleteProps<any, any, any, any>["onInputChange"];
}

/**
 * A hook that handles the state management and loading behavior for asynchronous autocomplete fields.
 * It returns a set of props ready to be used with FinalFormAsyncAutocomplete component.
 */
export function useAsyncAutocompleteOptionsProps<T>(loadOptions: (search?: string) => Promise<T[]>): AsyncAutocompleteOptionsProps<T> {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const loadOptionsWithSearch = useCallback(
        async (search?: string) => {
            setLoading(true);
            setError(null);
            try {
                const newOptions = await loadOptions(search);
                setOptions(newOptions);
            } catch (e) {
                setError(e);
            } finally {
                setLoading(false);
            }
        },
        [loadOptions],
    );

    const debouncedLoadOptionWithSearch = useMemo(
        () =>
            debounce(async (value: string) => {
                await loadOptionsWithSearch(value);
            }, 500),
        [loadOptionsWithSearch],
    );

    const onInputChange: AsyncAutocompleteOptionsProps<T>["onInputChange"] = async (event, value, reason) => {
        // do not load options when the user selects an option or removes it
        if (reason !== "selectOption" && reason !== "removeOption") {
            setError(null);
            setLoading(true);
            setOptions([]);
            await debouncedLoadOptionWithSearch(value);
        }
    };

    const handleOpen = async () => {
        setError(null);
        setOpen(true);
        setOptions([]);
        await loadOptionsWithSearch();
    };

    return {
        isAsync: true,
        open,
        loadingError: error,
        options,
        loading,
        onInputChange,
        onOpen: handleOpen,
        onClose: () => setOpen(false),
    };
}
