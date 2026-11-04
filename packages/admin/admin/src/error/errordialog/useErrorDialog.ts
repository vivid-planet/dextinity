import { useCallback } from "react";

import type { ErrorDialogOptions } from "./ErrorDialog";
import { errorDialogVar } from "./errorDialogVar";

export interface UseErrorDialogReturn {
    showError: (options: ErrorDialogOptions) => void;
}

export function useErrorDialog(): UseErrorDialogReturn | undefined {
    const showError = useCallback((options: ErrorDialogOptions) => {
        errorDialogVar(options);
    }, []);
    return { showError };
}
