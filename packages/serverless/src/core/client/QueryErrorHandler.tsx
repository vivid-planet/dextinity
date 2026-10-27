import { Alert, useSnackbarApi } from "@dextinity/admin";
import { Snackbar } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { DetailedError } from "hono/client";
import { useEffect } from "react";

import { getErrorMessage } from "./getErrorMessage.js";

/**
 * Shows failed queries in a snackbar, the counterpart of `ErrorDialogHandler`, which only works with Apollo. Reloads the page when the
 * Access session expired, so Access redirects to its login.
 */
export function QueryErrorHandler() {
    const queryClient = useQueryClient();
    const snackbarApi = useSnackbarApi();

    useEffect(
        () =>
            queryClient.getQueryCache().subscribe((event) => {
                if (event.type !== "updated" || event.action.type !== "error") {
                    return;
                }
                const { error } = event.action;
                if (error instanceof DetailedError && error.statusCode === 401) {
                    window.location.reload();
                    return;
                }
                snackbarApi.showSnackbar(
                    <Snackbar autoHideDuration={6000}>
                        <Alert severity="error">{getErrorMessage(error)}</Alert>
                    </Snackbar>,
                );
            }),
        [queryClient, snackbarApi],
    );

    return null;
}
