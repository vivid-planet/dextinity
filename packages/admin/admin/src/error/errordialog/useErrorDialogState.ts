import { useReactiveVar } from "@apollo/client";
import { useCallback } from "react";

import type { ErrorDialogOptions } from "./ErrorDialog";
import { errorDialogVar } from "./errorDialogVar";

export interface ErrorDialogState {
    /** The error to show, set with `useErrorDialog` or by `createErrorDialogApolloLink`. `undefined` while there is none. */
    errorOptions: ErrorDialogOptions | undefined;
    /** Clears the error, e.g. after the dialog showing it closed. */
    clearError: () => void;
}

/**
 * The error `useErrorDialog` and `createErrorDialogApolloLink` show, for rendering it with another component than `ErrorDialogHandler`.
 */
export function useErrorDialogState(): ErrorDialogState {
    const errorOptions = useReactiveVar(errorDialogVar);
    const clearError = useCallback(() => {
        errorDialogVar(undefined);
    }, []);

    return { errorOptions, clearError };
}
