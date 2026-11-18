import { type SyntheticEvent, useState } from "react";

export interface AsyncOptionsProps<T> {
    isAsync: boolean;
    open: boolean;
    options: T[];
    loadingError: Error | null;
    loading?: boolean;
    onOpen: (event: SyntheticEvent) => void;
    onClose: (event: SyntheticEvent) => void;
}
export function useAsyncOptionsProps<T>(loadOptions: () => Promise<T[]>): AsyncOptionsProps<T> {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const handleOpen = async () => {
        setError(null);
        setOpen(true);
        setLoading(true);
        try {
            const newOptions = await loadOptions();
            setOptions(newOptions);
        } catch (e) {
            setError(e instanceof Error ? e : new Error(String(e)));
        } finally {
            setLoading(false);
        }
    };

    return {
        isAsync: true,
        open,
        loadingError: error,
        options,
        loading,
        onOpen: handleOpen,
        onClose: () => setOpen(false),
    };
}
