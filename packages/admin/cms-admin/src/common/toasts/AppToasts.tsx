import { Alert, useOptionalSnackbarApi } from "@dextinity/admin";
import { type NewToast, ToastViewport, useToasts } from "@dextinity/ui";
import { Snackbar } from "@mui/material";
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from "react";
import { useIntl } from "react-intl";

interface AppToastsApi {
    /** Shows a toast in place of the current one and returns its id. */
    add: (toast: NewToast) => string;
    /** Removes a toast. */
    dismiss: (id: string) => void;
}

const AppToastsContext = createContext<AppToastsApi | undefined>(undefined);

/**
 * Shows the toasts of the whole app in one `ToastViewport` of `@dextinity/ui`, the successor of `SnackbarProvider`. `AppFrame`
 * includes it; mount it yourself only inside a `Theme` of `@dextinity/ui` without `AppFrame`.
 */
export function AppToastsProvider({ children }: PropsWithChildren) {
    const intl = useIntl();
    const { toasts, add, dismiss } = useToasts();
    const api = useMemo(() => ({ add, dismiss }), [add, dismiss]);

    return (
        <AppToastsContext.Provider value={api}>
            {children}
            <ToastViewport
                toasts={toasts}
                onDismiss={dismiss}
                labels={{ region: intl.formatMessage({ id: "dextinity.appToasts.region", defaultMessage: "Notifications" }) }}
            />
        </AppToastsContext.Provider>
    );
}

/**
 * Shows a toast app-wide, e.g. a result that stays relevant after leaving the page: in the `AppToastsProvider` (which `AppFrame`
 * includes), or, in apps without it, as a snackbar of the MUI `SnackbarProvider`.
 */
export function useShowAppToast(): (toast: NewToast) => void {
    const appToasts = useContext(AppToastsContext);
    const snackbarApi = useOptionalSnackbarApi();

    return useCallback(
        (toast: NewToast) => {
            if (appToasts) {
                appToasts.add(toast);
            } else {
                snackbarApi?.showSnackbar(
                    <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "left" }} autoHideDuration={toast.duration ?? 5000}>
                        <Alert severity={toast.tone ?? "success"}>{toast.message}</Alert>
                    </Snackbar>,
                );
            }
        },
        [appToasts, snackbarApi],
    );
}
